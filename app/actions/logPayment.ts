"use server";

import { supabaseServer } from "@/lib/supabase-server";

export async function logPayment(data: {
  reference: string;
  amount: number;
  productId: string;
  vendorId: string;
  buyerName: string;
  buyerPhone: string;
}) {
  /* ===============================
     FIX: create client correctly
  =============================== */
  const supabase = await supabaseServer();

  /* ===============================
     INSERT PAYMENT
  =============================== */
  const { error } = await supabase
    .from("payments")
    .insert({
      reference: data.reference,
      amount: data.amount,
      product_id: data.productId,
      vendor_id: data.vendorId,
      buyer_name: data.buyerName,
      buyer_phone: data.buyerPhone,
      status: "success",
    });

  if (error) {
    console.error("Payment log error:", error);
    return { success: false };
  }

  return { success: true };
}
