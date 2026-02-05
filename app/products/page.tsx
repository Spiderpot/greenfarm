import ProductCard from "@/components/product/ProductCard";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* =====================================================
   Types (must match ProductCard exactly)
===================================================== */

interface Product {
  id: string;
  name: string;
  vendor_id: string;

  category?: string;
  location?: string;

  image?: string;

  price?: number;
  unit?: string;
  negotiable?: boolean;
  discount_price?: number;
  featured?: boolean;

  status?: string;
}

/* =====================================================
   Fetch APPROVED products only (STABLE + SAFE)
===================================================== */

async function getProducts(): Promise<Product[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select("*") // ✅ NO JOINS (stable)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("PRODUCT FETCH ERROR:", error.message);
    return [];
  }

  return data ?? [];
}

/* =====================================================
   Products Page (SERVER COMPONENT)
===================================================== */

export default async function ProductsPage() {
  const products = await getProducts();

  const featured = products.filter((p) => p.featured);
  const normal = products.filter((p) => !p.featured);

  const finalProducts = [...featured, ...normal];

  return (
    <main className="min-h-screen p-6">
      <h1 className="mb-4 text-2xl font-bold">Products</h1>

      {finalProducts.length === 0 && (
        <p className="text-sm text-gray-500">
          No approved listings yet. Vendors can add products from dashboard.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {finalProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              ...p,
              category: p.category ?? "general",
              location: p.location ?? "Nigeria",
              images: [p.image ?? "/placeholder.png"],
            }}
            featured={p.featured ?? false}
          />
        ))}
      </div>
    </main>
  );
}
