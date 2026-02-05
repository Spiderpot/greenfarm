import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   SAFE SUPABASE FACTORY (NO TOP LEVEL INIT)
   prevents Vercel build crash
===================================================== */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/* =====================================================
   BASE URL
===================================================== */

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* =====================================================
   POST → Initialize Paystack payment
   supports:
   - lead unlock
   - vendor subscription
===================================================== */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      vendorId,
      leadId,
      plan,
      amount,
      type, // "lead" | "vendor_plan"
    } = body;

    if (!vendorId || !type || !amount) {
      return NextResponse.json(
        { error: "Missing required params" },
        { status: 400 }
      );
    }

    const reference = `${type}_${vendorId}_${Date.now()}`;

    const res = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || "pay@greenfarm.ng",
          amount: amount * 100, // kobo
          reference,
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

    return NextResponse.json({
      url: data?.data?.authorization_url,
    });
  } catch (err) {
    console.error("Paystack init error:", err);

    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

/* =====================================================
   GET → Verify + process payment
   (FINTECH STANDARD FLOW)
===================================================== */

export async function GET(req: Request) {
  const supabase = getSupabase(); // ✅ INIT HERE ONLY

  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
    }

    /* =============================
       VERIFY TRANSACTION
    ============================= */

    const verify = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await verify.json();

    console.log("VERIFY RESULT:", result);

    if (result?.data?.status !== "success") {
      return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
    }

    const meta = result.data.metadata;

    /* =============================
       LEAD UNLOCK
    ============================= */

    if (meta.type === "lead") {
      await supabase.from("lead_unlocks").insert({
        vendor_id: meta.vendorId,
        lead_id: meta.leadId,
        paid: true,
        amount: result.data.amount / 100,
        paystack_ref: reference,
      });
    }

    /* =============================
       VENDOR SUBSCRIPTION
    ============================= */

    if (meta.type === "vendor_plan") {
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

    return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
  } catch (err) {
    console.error("Verify error:", err);

    return NextResponse.redirect(`${BASE_URL}/vendor/dashboard`);
  }
}
