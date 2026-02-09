import { PRICING } from "@/lib/config/pricing";


/* =====================================================
   Vendor Plan Types
===================================================== */

export type VendorPlanKey = keyof typeof PRICING.vendorPlans;

/* =====================================================
   Resolve vendor plan safely
   - Defaults to FREE
   - Guards against invalid values
===================================================== */

export function resolveVendorPlan(plan?: string) {
  const key = (plan || "free").toLowerCase() as VendorPlanKey;

  return PRICING.vendorPlans[key] ?? PRICING.vendorPlans.free;
}

/* =====================================================
   Helpers (used across UI + API)
===================================================== */

export function getListingLimit(plan?: string): number {
  return resolveVendorPlan(plan).limits.listings;
}

export function canFeatureProduct(plan?: string): boolean {
  return resolveVendorPlan(plan).limits.featured;
}

export function hasAnalytics(plan?: string): boolean {
  return resolveVendorPlan(plan).limits.analytics;
}
