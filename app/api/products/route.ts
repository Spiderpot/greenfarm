// =====================================================
// POST /api/products
// Create product (vendor)
// SAFE • EXPLICIT • PRODUCTION READY • PLAN AWARE • MONETIZED
// =====================================================

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PRICING } from "@/lib/config/pricing";

type ApiErrorCode = "LIMIT_REACHED" | "FEATURE_LOCKED" | "VENDOR_SETUP_FAILED";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    /* ===============================
       AUTH
    =============================== */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ===============================
       VALIDATION
    =============================== */
    if (!body.title || body.price === undefined || body.price === null) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    /* ===============================
       GET VENDOR PLAN (AUTO CREATE SAFE)
    =============================== */
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, plan")
      .eq("id", user.id)
      .maybeSingle();

    let vendorPlan = vendor?.plan ?? "free";

    if (!vendor) {
      const businessName =
        user.user_metadata?.business_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "GreenFarm Vendor";

      const { error: insertError } = await supabase.from("vendors").insert({
        id: user.id,
        business_name: String(businessName).trim(),
        email: user.email ?? null,
        plan: "free",
      });

      if (insertError) {
        console.error("VENDOR AUTO-CREATE ERROR:", insertError);

        return NextResponse.json(
          {
            error:
              "Vendor profile setup failed. Please refresh and try again.",
            code: "VENDOR_SETUP_FAILED" as ApiErrorCode,
          },
          { status: 403 }
        );
      }

      vendorPlan = "free";
    }

    const planConfig = PRICING.getPlan(vendorPlan);

    /* ===============================
       💰 LISTING LIMIT CHECK (MONEY GATE)
    =============================== */
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", user.id);

    if (countError) {
      console.error("LISTING COUNT ERROR:", countError);
      return NextResponse.json(
        { error: "Unable to verify listing limit" },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= planConfig.limits.listings) {
      return NextResponse.json(
        {
          error: `Listing limit reached. ${planConfig.name} plan allows only ${planConfig.limits.listings} products. Upgrade to add more.`,
          code: "LIMIT_REACHED" as ApiErrorCode,
          plan: planConfig.key,
          limit: planConfig.limits.listings,
          current: count ?? 0,
        },
        { status: 403 }
      );
    }

    /* ===============================
       FEATURE PERMISSION CHECK
    =============================== */
    if (body.featured && !planConfig.limits.featured) {
      return NextResponse.json(
        {
          error: "Featured products require PRO or ELITE plan.",
          code: "FEATURE_LOCKED" as ApiErrorCode,
          plan: planConfig.key,
        },
        { status: 403 }
      );
    }

    /* ===============================
       SAFE NORMALIZATION
    =============================== */
    const price = Number(body.price ?? 0);
    const discount = Number(body.discount ?? 0);
    const stock = Math.max(0, Number(body.stock ?? 0));

    /* ===============================
       PAYLOAD
    =============================== */
    const payload = {
      name: String(body.title).trim(),
      description: body.description ?? "",
      category: body.category ?? "",
      price,
      discount_price: discount,
      stock,

      location: body.location ?? "",
      delivery: body.delivery ?? null,
      condition: body.condition ?? null,

      image: body.images?.[0] ?? null,
      featured: Boolean(body.featured && planConfig.limits.featured),

      vendor_id: user.id,
      status: "approved",
      created_at: new Date().toISOString(),
    };

    /* ===============================
       INSERT
    =============================== */
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (err: unknown) {
    console.error("PRODUCT CREATE ERROR:", err);

    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
