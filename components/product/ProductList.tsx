// /components/product/ProductList.tsx

import ProductCard from "./ProductCard";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types/product";

export default async function ProductList() {
  const products: Product[] = await getProducts();

  /* =============================
     EMPTY STATE (important UX)
  ============================== */

  if (!products.length) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-lg font-medium">No products yet</p>
        <p className="text-sm">
          Vendors will see their products here once approved.
        </p>
      </div>
    );
  }

  /* =============================
     GRID
  ============================== */

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p: Product) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
