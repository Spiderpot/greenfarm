import { headers } from "next/headers";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

/* =====================================================
   REQUIRED FOR PAYSTACK WEBHOOKS (Next.js 14+)
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
      plan?: string; // ⭐ REQUIRED
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
    const rawBody = await req.text();

    const signature = (await headers()).get("x-paystack-signature");

    /* ===============================
       SECURITY
    =============================== */
    if (!verifySignature(rawBody, signature)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body: PaystackWebhook = JSON.parse(rawBody);

    /* only process successful charges */
    if (body.event !== "charge.success") {
      return Response.json({ ignored: true });
    }

    const { reference, amount, status, metadata } = body.data;

    if (status !== "success" || !reference) {
      return Response.json({ ignored: true });
    }

    const supabase = await supabaseServer();

    /* ===============================
       REPLAY PROTECTION
    =============================== */
    const { data: existing } = await supabase
      .from("payments")
      .select("reference")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      return Response.json({ duplicate: true });
    }

    /* ===============================
       LOG PAYMENT FIRST
    =============================== */
    await supabase.from("payments").insert({
      reference,
      amount: amount / 100,
      gateway: "paystack",
      status: "success",
      raw: body,
    });

    if (!metadata) {
      return Response.json({ ok: true });
    }

    /* =====================================================
       LEAD UNLOCK
    ===================================================== */
    if (
      metadata.type === "lead_unlock" &&
      metadata.vendorId &&
      metadata.leadId
    ) {
      await supabase.from("lead_unlocks").upsert(
        {
          vendor_id: metadata.vendorId,
          lead_id: metadata.leadId,
          amount: amount / 100,
          paid: true,
          paystack_ref: reference,
        },
        { onConflict: "vendor_id,lead_id" }
      );
    }

    /* =====================================================
       VENDOR PLAN  ⭐⭐⭐ MAIN FIX
    ===================================================== */
    if (
      metadata.type === "vendor_plan" &&
      metadata.vendorId &&
      metadata.plan
    ) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      const expiresISO = expires.toISOString();

      /* subscription history */
      await supabase.from("vendor_subscriptions").insert({
        vendor_id: metadata.vendorId,
        reference,
        plan: metadata.plan,
        status: "active",
        expires_at: expiresISO,
      });

      /* activate vendor */
      await supabase
        .from("vendors")
        .update({
          plan: metadata.plan,
          plan_expires_at: expiresISO,
          is_verified: true,
        })
        .eq("id", metadata.vendorId);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook crash:", err);
    return new Response("Webhook error", { status: 500 });
  }
}
