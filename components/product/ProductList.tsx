// =====================================================
// Product Types (GreenFarm)
// MUST MATCH SUPABASE SCHEMA EXACTLY
// =====================================================

/* =====================================================
   CORE PRODUCT
===================================================== */

export type Product = {
  id: string;

  vendor_id: string;

  name: string;
  description: string | null;

  price: number | null;

  image_url: string | null;

  category: string | null;

  featured: boolean | null;

  status: "pending" | "approved" | "rejected";

  created_at: string;
};


/* =====================================================
   CREATE PRODUCT
===================================================== */

export type NewProduct = {
  vendor_id: string;

  name: string;
  description?: string | null;

  price?: number | null;

  image_url?: string | null;

  category?: string | null;

  featured?: boolean | null;

  status?: "pending" | "approved" | "rejected";
};


/* =====================================================
   UPDATE PRODUCT
===================================================== */

export type UpdateProduct = Partial<NewProduct>;
