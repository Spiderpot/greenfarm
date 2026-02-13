// =====================================================
// POST /api/products
// Create product (vendor)
// SAFE • EXPLICIT • PRODUCTION READY • PLAN AWARE • MONETIZED
// =====================================================

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type ApiErrorCode = "LIMIT_REACHED" | "FEATURE_LOCKED" | "VENDOR_SETUP_FAILED";

type VendorPlan = "FREE" | "PRO_FARMER" | "ENTERPRISE";

function normalizePlan(raw: unknown): VendorPlan {
  const p = String(raw || "").toLowerCase().trim();

  // Accept old/legacy plan keys too
  if (p === "free") return "FREE";
  if (p === "pro_farmer" || p === "pro" || p === "professional") return "PRO_FARMER";
  if (p === "enterprise" || p === "aggregator" || p === "elite") return "ENTERPRISE";

  // default
  return "FREE";
}

function planLimits(plan: VendorPlan) {
  if (plan === "FREE") return { listings: 1, expiresDays: 7, featuredAllowed: false };
  if (plan === "PRO_FARMER") return { listings: 20, expiresDays: null, featuredAllowed: true };
  return { listings: Infinity, expiresDays: null, featuredAllowed: true }; // ENTERPRISE
}

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
    const title = String(body.title ?? "").trim();
    if (!title || body.price === undefined || body.price === null) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    /* ===============================
       GET VENDOR PLAN (AUTO CREATE SAFE)
    =============================== */
    const { data: vendor, error: vendorReadErr } = await supabase
      .from("vendors")
      .select("id, plan")
      .eq("id", user.id)
      .maybeSingle();

    if (vendorReadErr) {
      // If RLS blocks vendor read for some reason, fail clearly
      console.error("VENDOR READ ERROR:", vendorReadErr);
      return NextResponse.json(
        { error: "Unable to verify vendor profile" },
        { status: 403 }
      );
    }

    let vendorPlan: VendorPlan = normalizePlan(vendor?.plan);

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
        plan: "FREE", // store as FREE
      });

      if (insertError) {
        console.error("VENDOR AUTO-CREATE ERROR:", insertError);

        return NextResponse.json(
          {
            error: "Vendor profile setup failed. Please refresh and try again.",
            code: "VENDOR_SETUP_FAILED" as ApiErrorCode,
          },
          { status: 403 }
        );
      }

      vendorPlan = "FREE";
    }

    const limits = planLimits(vendorPlan);

    /* ===============================
       💰 LISTING LIMIT CHECK (counts ACTIVE listings only)
    =============================== */
    const nowIso = new Date().toISOString();

    // ENTERPRISE unlimited -> skip count check
    if (Number.isFinite(limits.listings)) {
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", user.id)
        // active listings only: expires_at is null OR expires_at > now
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`);

      if (countError) {
        console.error("LISTING COUNT ERROR:", countError);
        return NextResponse.json(
          { error: "Unable to verify listing limit" },
          { status: 500 }
        );
      }

      if ((count ?? 0) >= limits.listings) {
        return NextResponse.json(
          {
            error:
              vendorPlan === "FREE"
                ? "Free plan allows 1 active listing for 7 days. Upgrade to add more."
                : `Listing limit reached. Your plan allows only ${limits.listings} active products. Upgrade to add more.`,
            code: "LIMIT_REACHED" as ApiErrorCode,
            plan: vendorPlan,
            limit: limits.listings,
            current: count ?? 0,
          },
          { status: 403 }
        );
      }
    }

    /* ===============================
       FEATURE PERMISSION CHECK
    =============================== */
    if (body.featured && !limits.featuredAllowed) {
      return NextResponse.json(
        {
          error: "Featured products require PRO_FARMER or ENTERPRISE plan.",
          code: "FEATURE_LOCKED" as ApiErrorCode,
          plan: vendorPlan,
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

    // Expiry only for FREE
    const expiresAt =
      limits.expiresDays === null
        ? null
        : new Date(Date.now() + limits.expiresDays * 24 * 60 * 60 * 1000).toISOString();

    // Images: support both body.images[] and body.image
    const imagesArr = Array.isArray(body.images) ? body.images : [];
    const firstImage = imagesArr?.[0] ?? body.image ?? null;

    /* ===============================
       PAYLOAD (SCHEMA-SAFE)
       NOTE: keep column names aligned with your DB.
       If your DB column is "title", use "title" (not "name").
    =============================== */
    const payload = {
      title, // ✅ use "title" to match buyer search/filter + UI
      description: body.description ?? "",
      category: body.category ?? "",
      price,
      discount_price: discount,
      stock,
      location: body.location ?? "",
      // store either "images" (array) or "image" (single) depending on your DB
      // If your DB has "images" jsonb, keep it:
      images: imagesArr.length ? imagesArr : firstImage ? [firstImage] : [],
      featured: Boolean(body.featured && limits.featuredAllowed),

      vendor_id: user.id,
      status: "approved",
      expires_at: expiresAt, // ✅ Free expires in 7 days, paid null
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
