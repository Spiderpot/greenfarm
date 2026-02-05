"use server";

import { supabaseServer } from "@/lib/supabase-server";

/* =====================================================
   Activate Vendor Subscription
   Called AFTER Paystack success
===================================================== */

export async function activateVendorSubscription(data: {
  vendorId: string;
  reference: string;
  plan: "pro" | "elite";
}) {
  const supabase = await supabaseServer();

  /* =====================================================
     Expiry (30 days)
  ===================================================== */

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const expiresISO = expires.toISOString();

  /* =====================================================
     1️⃣ Insert subscription history
  ===================================================== */

  const { error: subError } = await supabase
    .from("vendor_subscriptions")
    .insert({
      vendor_id: data.vendorId,
      reference: data.reference,
      plan: data.plan, // ✅ NEW
      status: "active",
      expires_at: expiresISO,
    });

  if (subError) {
    console.error("Subscription insert error:", subError);
    return { success: false };
  }

  /* =====================================================
     2️⃣ Update vendor plan (IMPORTANT)
  ===================================================== */

  const { error: vendorError } = await supabase
    .from("vendors")
    .update({
      plan: data.plan,
      plan_expires_at: expiresISO,
      is_verified: true, // premium vendors auto-verified
    })
    .eq("id", data.vendorId);

  if (vendorError) {
    console.error("Vendor update error:", vendorError);
    return { success: false };
  }

  return { success: true };
}
