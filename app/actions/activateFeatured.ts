"use server";

import { supabaseServer } from "@/lib/supabase-server";

export async function activateFeatured(data: {
  productId: string;
  vendorId: string;
  reference: string;
}) {
  const supabase = await supabaseServer();

  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days boost

  /* =====================================================
     🔒 PLAN FEATURE LOCK (SERVER ENFORCED)
     NEVER trust frontend
  ===================================================== */

  const { data: vendor } = await supabase
    .from("vendors")
    .select("plan")
    .eq("id", data.vendorId) // ✅ FIXED
    .single();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  if (vendor.plan === "free") {
    throw new Error("Upgrade to PRO to feature products.");
  }

  /* =====================================================
     FEATURE INSERT
  ===================================================== */

  await supabase.from("featured_products").insert({
    product_id: data.productId,
    vendor_id: data.vendorId,
    reference: data.reference,
    expires_at: expires.toISOString(),
  });

  return { success: true };
}
