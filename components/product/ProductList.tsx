// /components/product/ProductList.tsx

import ProductCard from "./ProductCard"
import { getProducts } from "@/lib/products"

export default async function ProductList() {
  const products = await getProducts()

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
