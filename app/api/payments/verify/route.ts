import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PRICING } from "@/lib/config/pricing";

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set() {},
          remove() {},
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
        },
      }
    );

    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok || !verifyJson?.status) {
      return NextResponse.json(
        { error: verifyJson?.message || "Verification failed" },
        { status: 500 }
      );
    }

    const tx = verifyJson.data;

    if (tx.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 402 }
      );
    }

    const meta = tx.metadata || {};
    const vendorId = meta.vendor_id;
    const plan = meta.plan;

    if (!vendorId || vendorId !== user.id) {
      return NextResponse.json(
        { error: "Vendor mismatch" },
        { status: 403 }
      );
    }

    if (plan !== "pro" && plan !== "elite") {
      return NextResponse.json(
        { error: "Invalid plan in metadata" },
        { status: 400 }
      );
    }

    const planConfig = plan === "pro" ? PRICING.vendorPlans.pro : PRICING.vendorPlans.elite;

    // Update vendor plan (RLS policy vendor update self must allow this)
    const { error: updateError } = await supabase
      .from("vendors")
      .update({
        plan,
        plan_expires_at: addDays(30),
        monthly_product_limit: planConfig.limits.listings === Infinity ? null : planConfig.limits.listings,
        approval_status: "approved",
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("PLAN UPDATE ERROR:", updateError);
      return NextResponse.json(
        { error: "Unable to apply plan upgrade" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, plan });
  } catch (err: unknown) {
    console.error("VERIFY ERROR:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
