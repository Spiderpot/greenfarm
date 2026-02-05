import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   REQUIRED FOR PAYSTACK + RENDER
===================================================== */

export const dynamic = "force-dynamic";

/* =====================================================
   SAFE SUPABASE FACTORY
===================================================== */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/* =====================================================
   ENV
===================================================== */

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;


/* =====================================================
   HELPERS
===================================================== */

function buildReference(type: string, vendorId: string) {
  return `${type}_${vendorId}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* =====================================================
   POST → INITIALIZE PAYMENT
===================================================== */

export async function POST(req: Request) {
  try {
    if (!PAYSTACK_SECRET) {
      return NextResponse.json(
        { error: "Payment not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      email,
      vendorId,
      leadId,
      plan,
      amount,
      type, // "lead_unlock" | "vendor_plan"
    } = body;

    /* ===============================
       VALIDATION
    =============================== */

    if (!vendorId || !amount || !type) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const reference = buildReference(type, vendorId);

    console.log("🚀 Initializing Paystack:", {
      reference,
      type,
      vendorId,
      amount,
    });

    /* ===============================
       CALL PAYSTACK
    =============================== */

    const res = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || "pay@greenfarm.ng",
          amount: Math.round(amount * 100), // kobo
          reference,

          /* redirect back here for fallback verify */
          callback_url: `${BASE_URL}/api/paystack/unlock-lead`,

          metadata: {
            type,
            vendorId,
            leadId,
            plan,
          },
        }),
      }
    );

    const data = await res.json();

    if (!data?.data?.authorization_url) {
      console.error("❌ Paystack init failed:", data);
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("❌ Paystack init crash:", err);

    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

/* =====================================================
   GET → VERIFY (BACKUP ONLY)
   Webhook is primary processor
===================================================== */

export async function GET(req: Request) {
  const supabase = getSupabase();

  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
    }

    console.log("🔎 Verifying fallback:", reference);

    /* ===============================
       VERIFY WITH PAYSTACK
    =============================== */

    const verify = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const result = await verify.json();

    if (result?.data?.status !== "success") {
      return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
    }

    /* ===============================
       DUPLICATE PROTECTION
    =============================== */

    const { data: existing } = await supabase
      .from("payments")
      .select("reference")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Already processed (webhook handled)");
      return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
    }

    const meta = result.data.metadata;

    const amount = result.data.amount / 100;

    /* ===============================
       LOG PAYMENT FIRST
    =============================== */

    await supabase.from("payments").insert({
      reference,
      amount,
      gateway: "paystack",
      status: "success",
      raw: result,
    });

    /* ===============================
       LEAD UNLOCK
    =============================== */

    if (meta?.type === "lead_unlock" && meta.vendorId && meta.leadId) {
      await supabase.from("lead_unlocks").upsert(
        {
          vendor_id: meta.vendorId,
          lead_id: meta.leadId,
          paid: true,
          amount,
          paystack_ref: reference,
        },
        { onConflict: "vendor_id,lead_id" }
      );
    }

    /* ===============================
       VENDOR PLAN
    =============================== */

    if (meta?.type === "vendor_plan" && meta.vendorId) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      const expiresISO = expires.toISOString();

      await supabase.from("vendor_subscriptions").insert({
        vendor_id: meta.vendorId,
        reference,
        plan: meta.plan,
        status: "active",
        expires_at: expiresISO,
      });

      await supabase
        .from("vendors")
        .update({
          plan: meta.plan,
          plan_expires_at: expiresISO,
          is_verified: true,
        })
        .eq("id", meta.vendorId);
    }

    console.log("✅ Fallback verify processed:", reference);

    return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
  } catch (err) {
    console.error("❌ Verify crash:", err);

    return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
  }
}
