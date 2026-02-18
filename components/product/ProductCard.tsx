"use client";

import Image from "next/image";
import Link from "next/link";

/* =====================================================
   Types
===================================================== */

interface Vendor {
  is_verified?: boolean;
}

interface Product {
  id: string;
  name: string;
  category?: string;
  location?: string;

  images: string[];

  price?: number;
  unit?: string;
  discount_price?: number;
  negotiable?: boolean;
  featured?: boolean;

  is_demo?: boolean; // ✅ NEW

  vendor?: Vendor | null;
}

/* =====================================================
   Helpers
===================================================== */

function formatPrice(value?: number) {
  if (!value || value <= 0) return "";
  return "₦" + value.toLocaleString("en-NG");
}

/* =====================================================
   Component
===================================================== */

export default function ProductCard({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) {
  const hasDiscount =
    product.discount_price &&
    product.price &&
    product.discount_price < product.price;

  const imageSrc = product.images?.[0] || "/placeholder.png";

  return (
    <Link
      href={`/products/${product.id}`}
      className="
        group relative flex flex-col overflow-hidden
        rounded-2xl border border-zinc-200
        bg-white shadow-sm
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg
        dark:border-zinc-800 dark:bg-zinc-900
      "
    >
      {/* ================= Featured Badge ================= */}
      {featured && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-yellow-500 px-3 py-1 text-[10px] font-bold text-black shadow">
          ⭐ Featured
        </span>
      )}

      {/* ================= Demo Badge ================= */}
      {product.is_demo && (
        <span className="absolute right-2 top-8 z-10 rounded bg-yellow-600 px-2 py-1 text-[10px] font-semibold text-white shadow">
          Sample Listing
        </span>
      )}

      {/* ================= Category Tag ================= */}
      {product.category && (
        <span className="absolute right-2 top-2 z-10 rounded bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur">
          {product.category}
        </span>
      )}

      {/* ================= Image ================= */}
      <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>

      {/* ================= Content ================= */}
      <div className="flex flex-col gap-1 p-3">

        {/* ================= Name + Verified Badge ================= */}
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {product.name}
          </h3>

          {product.vendor?.is_verified && (
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              ✅ Verified
            </span>
          )}
        </div>

        {/* ================= Location ================= */}
        {product.location && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            📍 {product.location}
          </p>
        )}

         {/* ================= Pricing ================= */}
        <div className="mt-1 flex flex-wrap items-center gap-1 text-sm">

          {product.is_demo ? (
            <span className="font-semibold text-green-600">
              Request Quote
            </span>
          ) : hasDiscount ? (
            <>
              <span className="font-bold text-green-600">
                {formatPrice(product.discount_price)}
              </span>

              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>

              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                Sale
              </span>
            </>
          ) : product.price ? (
            <span className="font-semibold text-green-600">
              {formatPrice(product.price)}
            </span>
          ) : (
            <span className="font-semibold text-green-600">
              Request Quote
            </span>
          )}

          {!product.is_demo && product.unit && (
            <span className="text-xs text-zinc-500">
              / {product.unit}
            </span>
          )}

          {!product.is_demo && product.negotiable && (
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              Negotiable
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
