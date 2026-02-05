import { supabaseServer } from "@/lib/supabase-server";

/* =====================================================
   TYPES
===================================================== */

export type Vendor = {
  id: string;
  email?: string | null;
  is_verified?: boolean | null;
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

/* =====================================================
   FUNCTION
   ✅ only patched unlock logic
   ❌ no refactor
===================================================== */

export async function getVendorDashboardData(userId: string): Promise<{
  vendor: Vendor;
  leads: Lead[];
}> {
  const supabase = await supabaseServer();

  /* =====================================================
     vendor === user (unchanged)
  ===================================================== */

  const vendor: Vendor = {
    id: userId,
    email: null,
    is_verified: true,
  };

  /* =====================================================
     GET LEADS (unchanged)
  ===================================================== */

  const { data: leadsRows } = await supabase
    .from("leads")
    .select("*")
    .eq("vendor_id", userId)
    .order("created_at", { ascending: false });

  /* =====================================================
     ✅ PATCH: GET UNLOCKED LEADS
     (THIS IS THE ONLY ADDITION)
  ===================================================== */

  const { data: unlocks } = await supabase
    .from("lead_unlocks")
    .select("lead_id")
    .eq("vendor_id", userId)
    .eq("paid", true);

  const unlockedSet = new Set(
    unlocks?.map((u) => u.lead_id)
  );

  /* =====================================================
     MERGE (same logic + unlocked flag)
  ===================================================== */

  const leads: Lead[] =
    leadsRows?.map((l) => ({
      id: String(l.id),
      buyer_name: l.buyer_name ?? "",
      buyer_phone: l.buyer_phone ?? "",
      product_name: l.product_name ?? "",
      created_at: l.created_at ?? new Date().toISOString(),
      contacted: Boolean(l.contacted),

      /* ✅ PATCHED LINE */
      unlocked: unlockedSet.has(l.id),
    })) ?? [];

  return {
    vendor,
    leads,
  };
}

/* =====================================================
   LANDMARK: resolveVendorIdByEmail
   JSON → Supabase UUID bridge
===================================================== */

export async function resolveVendorIdByEmail(email: string) {
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from("vendors")
    .select("id")
    .eq("email", email)
    .single();

  return data?.id ?? null;
}
