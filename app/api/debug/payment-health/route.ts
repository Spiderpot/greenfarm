import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =====================================================
   PAYMENT SYSTEM HEALTH CHECK (STRICT + SAFE)
===================================================== */

export const dynamic = "force-dynamic";

/* =====================================================
   TYPES
===================================================== */

type HealthResult = {
  env: {
    PAYSTACK_SECRET_KEY: boolean;
    NEXT_PUBLIC_SITE_URL: string | undefined;
    SUPABASE_URL: boolean;
    SERVICE_ROLE: boolean;
  };
  vendor_sample?: unknown;
  product_sample?: unknown;
  vendor_match?: string;
  last_payment?: unknown;
  last_subscription?: unknown;
  summary?: string;
  error?: string;
};

/* =====================================================
   ROUTE
===================================================== */

export async function GET() {
  const results: HealthResult = {
    env: {
      PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    /* ================= VENDOR SAMPLE ================= */

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id,email,plan,plan_expires_at")
      .limit(1)
      .maybeSingle();

    results.vendor_sample = vendor ?? null;

    /* ================= PRODUCT SAMPLE ================= */

    const { data: product } = await supabase
      .from("products")
      .select("id,vendor_id")
      .limit(1)
      .maybeSingle();

    results.product_sample = product ?? null;

    /* ================= ID MATCH CHECK ================= */

    if (vendor && product) {
      results.vendor_match =
        vendor.id === product.vendor_id
          ? "✅ product.vendor_id matches vendor.id"
          : "❌ product.vendor_id DOES NOT MATCH vendor.id";
    }

    /* ================= LAST PAYMENT ================= */

    const { data: payment } = await supabase
      .from("payments")
      .select("reference,amount,status,created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    results.last_payment = payment ?? null;

    /* ================= LAST SUBSCRIPTION ================= */

    const { data: sub } = await supabase
      .from("vendor_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    results.last_subscription = sub ?? null;

    /* ================= SUMMARY ================= */

    if (vendor?.plan && vendor.plan !== "free") {
      results.summary = "✅ SYSTEM HEALTHY — plan upgraded";
    } else {
      results.summary = "❌ PLAN STILL FREE — webhook or metadata issue";
    }

    return NextResponse.json(results);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        ...results,
        error: message,
      },
      { status: 500 }
    );
  }
}
