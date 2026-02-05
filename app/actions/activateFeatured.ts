"use server";

import { supabaseServer } from "@/lib/supabase-server";

export async function activateFeatured(data: {
  productId: string;
  vendorId: string;
  reference: string;
}) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days boost

  const supabase = await supabaseServer();

  await supabase.from("featured_products").insert({
    product_id: data.productId,
    vendor_id: data.vendorId,
    reference: data.reference,
    expires_at: expires,
  });


  return { success: true };
}
