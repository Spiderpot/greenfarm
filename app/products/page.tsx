import ProductCard from "@/components/product/ProductCard";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* =====================================================
   DB Product type (REAL SCHEMA)
===================================================== */

interface DbProduct {
  id: string;
  title: string; // ✅ correct column
  vendor_id: string;

  category?: string | null;
  location?: string | null;

  images?: string[] | null; // ✅ array

  price?: number | null;
  discount_price?: number | null;
  featured?: boolean | null;

  status?: string | null;
  expires_at?: string | null;
}

/* =====================================================
   Fetch APPROVED + NON-EXPIRED
===================================================== */

async function getProducts(): Promise<DbProduct[]> {
  const supabase = await createSupabaseServerClient();

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "approved")
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("PRODUCT FETCH ERROR:", error.message);
    return [];
  }

  return (data as DbProduct[]) ?? [];
}

/* =====================================================
   Products Page
===================================================== */

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen p-6">
      <h1 className="mb-2 text-2xl font-bold">Products</h1>

      <p className="mb-6 text-sm text-gray-500">
        🔒 Secure Escrow Payments — <span className="font-medium">Coming Soon</span>
      </p>

      {products.length === 0 && (
        <p className="text-sm text-gray-500">
          No products available yet. Please check back soon.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.title, // ✅ map title → name
              category: p.category ?? "general",
              location: p.location ?? "Nigeria",
              images: p.images?.length
                ? p.images
                : ["/placeholder.png"],

              price: p.price ?? undefined,
              discount_price: p.discount_price ?? undefined,
              featured: p.featured ?? false,
            }}
            featured={Boolean(p.featured)}
          />
        ))}
      </div>
    </main>
  );
}
