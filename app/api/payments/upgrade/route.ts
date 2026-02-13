import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PRICING } from "@/lib/config/pricing";

type UpgradePlan = "PRO_FARMER" | "ENTERPRISE";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawPlan = String(body.plan || "").toUpperCase();
    const plan = rawPlan as UpgradePlan;

    if (!["PRO_FARMER", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: vendor } = await supabase
      .from("vendors")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();

    const email = vendor?.email || user.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const price = PRICING.vendorPlans[plan].price;
    const reference = `vendor-${plan}-${Date.now()}`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/unlock-lead`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: price,
          vendorId: user.id,
          plan,               // PRO_FARMER | ENTERPRISE
          type: "vendor_plan",
          reference,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.url) {
      return NextResponse.json(
        { error: data?.error || "Unable to initialize upgrade payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: data.url,
      reference: data.reference || reference,
    });

  } catch (err: unknown) {
    console.error("UPGRADE INIT ERROR:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
