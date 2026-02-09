"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { deleteProduct, toggleFeatured } from "@/lib/products";
import { getSupabaseClient } from "@/lib/supabase-client";

type Props = {
  products: Product[];
};

export default function ProductTable({ products }: Props) {
  const supabase = getSupabaseClient();

  /* ===============================
     FILTER STATE
  =============================== */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  /* ===============================
     FILTER LOGIC
  =============================== */
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || p.category === category;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in" && (p.stock ?? 0) > 0) ||
        (stockFilter === "out" && (p.stock ?? 0) <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, stockFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(supabase, id);
    location.reload();
  }

  async function handleFeature(id: string, current: boolean) {
    await toggleFeatured(supabase, id, !current);
    location.reload();
  }

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  /* ===============================
     EMPTY
  =============================== */
  if (!products.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        No products yet. Click “Add Product” to start selling.
      </div>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="space-y-4">

      {/* ===============================
         FILTER BAR
      =============================== */}
      <div className="flex flex-wrap gap-3">

        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white text-gray-900 w-60"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white text-gray-900"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white text-gray-900"
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* ===============================
         TABLE
      =============================== */}
      <div className="rounded-xl border bg-white text-gray-900 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 font-semibold">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50 transition">

                <td className="p-3">{p.name}</td>

                <td className="p-3 font-medium">₦{p.price}</td>

                <td className="p-3">
                  {(p.stock ?? 0) > 0 ? (
                    <span className="text-green-600">In stock ({p.stock})</span>
                  ) : (
                    <span className="text-red-600">Out</span>
                  )}
                </td>

                <td className="p-3 space-x-3">
                  <button
                    onClick={() => handleFeature(p.id, p.featured)}
                    className="text-blue-600 text-xs font-medium"
                  >
                    Feature
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
