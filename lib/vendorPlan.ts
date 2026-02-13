import { PRICING } from "@/lib/config/pricing";

/* =====================================================
   Vendor Plan Types
===================================================== */

export type VendorPlanKey = keyof typeof PRICING.vendorPlans;

/* =====================================================
   Normalize legacy values
===================================================== */

function normalizePlanKey(plan?: string): VendorPlanKey {
  const p = String(plan || "").toLowerCase().trim();

  if (p === "free") return "FREE";
  if (p === "pro" || p === "pro_farmer" || p === "professional")
    return "PRO_FARMER";
  if (p === "elite" || p === "enterprise" || p === "aggregator")
    return "ENTERPRISE";

  return "FREE";
}

/* =====================================================
   Resolve vendor plan safely
===================================================== */

export function resolveVendorPlan(plan?: string) {
  const key = normalizePlanKey(plan);
  return PRICING.vendorPlans[key];
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
