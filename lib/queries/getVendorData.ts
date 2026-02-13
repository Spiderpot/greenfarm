import { supabaseServer } from "@/lib/supabase-server";
import { PRICING } from "@/lib/config/pricing";

/* =====================================================
   TYPES
===================================================== */

export type Vendor = {
  id: string;
  email?: string | null;
  is_verified?: boolean | null;
  plan?: string | null;
};

export type Lead = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  product_name: string;
  created_at: string;
  contacted?: boolean;
  unlocked?: boolean;
};

export async function getVendorDashboardData(userId: string) {
  const supabase = await supabaseServer();

  const now = new Date().toISOString();

  /* =====================================================
     GET VENDOR
  ===================================================== */

  const { data: vendorRow } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", userId)
    .single();

  const vendor: Vendor = {
    id: userId,
    email: vendorRow?.email ?? null,
    is_verified: vendorRow?.is_verified ?? false,
    plan: vendorRow?.plan ?? "FREE",
  };

  /* =====================================================
     GET PRODUCTS (ACTIVE + NOT EXPIRED)
  ===================================================== */

  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("vendor_id", userId)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  const listingCount = products?.length ?? 0;
  const listingLimit = PRICING.getListingLimit(
  vendor.plan ?? undefined
);

  /* =====================================================
     GET LEADS
  ===================================================== */

  const { data: leadsRows } = await supabase
    .from("leads")
    .select("*")
    .eq("vendor_id", userId)
    .order("created_at", { ascending: false });

  /* =====================================================
     GET UNLOCKED LEADS
  ===================================================== */

  const { data: unlocks } = await supabase
    .from("lead_unlocks")
    .select("lead_id")
    .eq("vendor_id", userId)
    .eq("paid", true);

  const unlockedSet = new Set(unlocks?.map((u) => u.lead_id));

  const leads: Lead[] =
    leadsRows?.map((l) => ({
      id: String(l.id),
      buyer_name: l.buyer_name ?? "",
      buyer_phone: l.buyer_phone ?? "",
      product_name: l.product_name ?? "",
      created_at: l.created_at ?? new Date().toISOString(),
      contacted: Boolean(l.contacted),
      unlocked: unlockedSet.has(l.id),
    })) ?? [];

  /* =====================================================
     SIMPLE EARNINGS CALC (for now)
     count unlocked leads × ₦50 convenience
  ===================================================== */

  const earnings =
    leads.filter((l) => l.unlocked).length *
    PRICING.oneTime.convenienceConnect;

  return {
    vendor,
    leads,
    listingCount,
    listingLimit,
    earnings,
  };
}
