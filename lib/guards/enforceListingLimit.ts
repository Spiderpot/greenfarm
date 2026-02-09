/* =====================================================
   Vendor Monetization Guards
   🔒 HARD SERVER-SIDE ENFORCEMENT
   Used by API routes ONLY
===================================================== */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolveVendorPlan } from "@/lib/vendorPlan";

/* =====================================================
   Create Supabase server client helper
===================================================== */

async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
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
}

/* =====================================================
   🔥 ENFORCE LISTING LIMIT (MONEY GATE)
   Blocks FREE users after limit
===================================================== */

export async function enforceListingLimit(vendorId: string) {
  const supabase = await getSupabase();

  /* Get vendor plan */
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("plan")
    .eq("id", vendorId)
    .single();

  if (vendorError || !vendor) {
    throw new Error("Vendor not found");
  }

  const plan = resolveVendorPlan(vendor.plan);

  /* Unlimited plan */
  if (plan.limits.listings === Infinity) return;

  /* Count products */
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", vendorId);

  if (countError) {
    throw new Error("Unable to verify listing limit");
  }

  if ((count ?? 0) >= plan.limits.listings) {
    throw new Error(
      `Listing limit reached. ${plan.name} allows only ${plan.limits.listings} products. Upgrade to continue.`
    );
  }
}

/* =====================================================
   🔒 FEATURE GATE (PRO/ELITE ONLY FEATURES)
   Used for: featured, analytics, boosts, etc
===================================================== */

export function enforceFeatureAccess(
  planKey: string | undefined,
  feature: "featured" | "analytics"
) {
  const plan = resolveVendorPlan(planKey);

  if (!plan.limits[feature]) {
    throw new Error("Upgrade required to access this feature");
  }
}