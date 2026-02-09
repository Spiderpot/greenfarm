/* =====================================================
   GreenFarm Product Types
   Single source of truth for ALL product data
===================================================== */

/* =====================================================
   CONDITION (Farm specific)
===================================================== */

export type ProductCondition =
  | "fresh"     // recently harvested
  | "stored";   // warehouse / preserved stock


/* =====================================================
   DELIVERY OPTIONS
===================================================== */

export type DeliveryOption =
  | "pickup"
  | "delivery";


/* =====================================================
   PRODUCT STATUS (moderation + lifecycle)
===================================================== */

export type ProductStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "sold"
  | "archived";


/* =====================================================
   MAIN PRODUCT ROW (matches Supabase table)
===================================================== */

export interface Product {
  id: string;

  /* ---------------- core info ---------------- */

  name: string;
  description: string | null;
  category: string | null;
  tags: string | null;

  /* ---------------- pricing ---------------- */

  price: number;
  discount_price: number | null;
  negotiable: boolean;
  unit: string | null;

  /* ---------------- inventory ---------------- */

  stock: number | null;            // available quantity
  condition: ProductCondition | null;

  /* ---------------- logistics ---------------- */

  location: string | null;
  delivery: DeliveryOption | null;

  /* ---------------- media ---------------- */

  image: string | null;            // legacy single image (backward compatibility)
  images: string[] | null;         // new multi-image support

  /* ---------------- vendor ---------------- */

  vendor_id: string;

  /* ---------------- promotion ---------------- */

  featured: boolean;

  /* ---------------- status ---------------- */

  status: ProductStatus;

  /* ---------------- timestamps ---------------- */

  created_at: string;
  updated_at?: string | null;
}


/* =====================================================
   INSERT TYPE
   (used when creating product)
===================================================== */

export type NewProduct = Omit<
  Product,
  "id" | "created_at" | "updated_at"
>;


/* =====================================================
   UPDATE TYPE
   (partial edits)
===================================================== */

export type UpdateProduct = Partial<NewProduct>;
