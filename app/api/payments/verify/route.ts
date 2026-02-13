// app/api/payments/verify/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PRICING } from "@/lib/config/pricing";

type UpgradePlan = "PRO_FARMER" | "ENTERPRISE";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
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

    // reference format: vendor-PLAN-timestamp
    const parts = reference.split("-");
    const plan = parts[1]?.toUpperCase() as UpgradePlan;

    if (!["PRO_FARMER", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan reference" },
        { status: 400 }
      );
    }

    const planConfig = PRICING.vendorPlans[plan];

    const expiresAt =
      planConfig.limits.expiresDays === null
        ? null
        : new Date(
            Date.now() +
              planConfig.limits.expiresDays *
                24 *
                60 *
                60 *
                1000
          ).toISOString();

    const { error: updateError } = await supabase
      .from("vendors")
      .update({
        plan,
        plan_expires_at: expiresAt,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Unable to update vendor plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan,
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
