import { headers } from "next/headers";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

/* =====================================================
   REQUIRED FOR PAYSTACK WEBHOOKS (Next.js 14+)
   prevents body parsing & caching
===================================================== */

export const dynamic = "force-dynamic";

/* =====================================================
   TYPES
===================================================== */

type PaystackWebhook = {
  event: string;
  data: {
    reference: string;
    amount: number; // kobo
    status: string;
    metadata?: {
      vendorId?: string;
      leadId?: string;
      type?: string;
    };
  };
};

/* =====================================================
   VERIFY SIGNATURE
===================================================== */

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) return false;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

/* =====================================================
   WEBHOOK HANDLER
===================================================== */

export async function POST(req: Request) {
  try {
    /* MUST use raw body for Paystack */
    const rawBody = await req.text();

    const signature = (await headers()).get("x-paystack-signature");

    /* ===============================
       SECURITY: signature check
    =============================== */
    if (!verifySignature(rawBody, signature)) {
      console.warn("❌ Invalid Paystack signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const body: PaystackWebhook = JSON.parse(rawBody);

    /* ===============================
       Only care about success events
    =============================== */
    if (body.event !== "charge.success") {
      return Response.json({ ignored: true });
    }

    const { reference, amount, status, metadata } = body.data;

    if (status !== "success") {
      return Response.json({ ignored: true });
    }

    if (!reference) {
      console.warn("❌ Missing reference");
      return Response.json({});
    }

    const supabase = await supabaseServer();

    /* ===============================
       REPLAY PROTECTION
       prevents duplicate processing
    =============================== */
    const { data: existing } = await supabase
      .from("payments")
      .select("reference")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate webhook ignored:", reference);
      return Response.json({ duplicate: true });
    }

    /* ===============================
       LOG PAYMENT FIRST (always)
    =============================== */
    await supabase.from("payments").insert({
      reference,
      amount: amount / 100,
      gateway: "paystack",
      status: "success",
      raw: body,
    });

    /* ===============================
       HANDLE METADATA TYPES
    =============================== */

    if (!metadata) {
      return Response.json({ ok: true });
    }

    /* ---------- LEAD UNLOCK ---------- */
    if (metadata.type === "lead_unlock" && metadata.vendorId && metadata.leadId) {
      await supabase.from("lead_unlocks").upsert(
        {
          vendor_id: metadata.vendorId,
          lead_id: metadata.leadId,
          amount: amount / 100,
          paid: true,
          paystack_ref: reference,
        },
        {
          onConflict: "vendor_id,lead_id",
        }
      );
    }

    /* ---------- VENDOR PLAN ---------- */
    if (metadata.type === "vendor_plan" && metadata.vendorId) {
      await supabase
        .from("vendors")
        .update({
          plan: metadata.type,
          verified: true,
        })
        .eq("id", metadata.vendorId);
    }

    /* future types can be added easily */

    console.log("✅ Payment processed:", reference);

    return Response.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook crash:", err);

    return new Response("Webhook error", {
      status: 500,
    });
  }
}
