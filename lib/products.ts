// C:\Users\JULIUS  CZAR KOME\Documents\greenfarm\lib\products.ts
// =====================================================
// Central product DB helpers (GreenFarm)
// SAFE FOR BOTH SERVER + CLIENT
// NO direct supabase imports
// =====================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, NewProduct, UpdateProduct } from "@/types/product";

/* =====================================================
   INTERNAL
===================================================== */

function handleError(error: unknown) {
  if (error) throw error;
}

/* =====================================================
   PUBLIC PRODUCTS (marketplace)
===================================================== */

export async function getProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  handleError(error);
  return data ?? [];
}

/* =====================================================
   SINGLE PRODUCT
===================================================== */

export async function getProductById(
  supabase: SupabaseClient,
  id: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  handleError(error);
  return data ?? null;
}

/* =====================================================
   VENDOR PRODUCTS (inventory manager)
===================================================== */

export async function getVendorProducts(
  supabase: SupabaseClient,
  vendorId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  handleError(error);
  return data ?? [];
}

/* =====================================================
   CREATE
===================================================== */

export async function createProduct(
  supabase: SupabaseClient,
  payload: NewProduct
): Promise<void> {
  const { error } = await supabase.from("products").insert(payload);

  handleError(error);
}

/* =====================================================
   UPDATE
===================================================== */

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  updates: UpdateProduct
): Promise<void> {
  const { error } = await supabase.from("products").update(updates).eq("id", id);

  handleError(error);
}

/* =====================================================
   DELETE
===================================================== */

export async function deleteProduct(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  handleError(error);
}

/* =====================================================
   FEATURE
===================================================== */

export async function toggleFeatured(
  supabase: SupabaseClient,
  id: string,
  featured: boolean
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ featured })
    .eq("id", id);

  handleError(error);
}
