"use server";

import { supabaseServer } from "@/lib/supabase-server";

/* =====================================================
   Types
===================================================== */

export type CreateLeadInput = {
  productId: string;
  vendorId: string;
  productName?: string; // ✅ OPTIONAL NOW
  name: string;
  phone: string;
  message: string;
};


/* =====================================================
   Create Lead (free optional request form)
===================================================== */

export async function createLead(data: CreateLeadInput) {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase.from("leads").insert({
      product_id: data.productId,
      vendor_id: data.vendorId,

      buyer_name: data.name,
      buyer_phone: data.phone,

      message: data.message ?? "",

      product_name: data.productName,
      contacted: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("CREATE LEAD ERROR:", error.message);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("SERVER ACTION CRASH:", err);
    return { success: false };
  }
}
