import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import VendorContactCTA from "@/components/product/VendorContactCTA";

/* =====================================================
   Next 16: params is Promise
===================================================== */

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/* =====================================================
   Product Detail Page
===================================================== */

export default async function ProductDetail({ params }: PageProps) {
  /* ✅ MUST await params in Next 16 */
  const { id } = await params;

  if (!id) return notFound();

  /* ✅ Supabase */
  const supabase = await supabaseServer();

  /* ================= Fetch product ================= */

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    console.error("DETAIL FETCH ERROR:", error);
    return notFound();
  }

  /* ================= Fetch vendor (REAL DB ONLY) ================= */
  /* 🔥 THIS IS THE IMPORTANT PART */
  /* We use the REAL Supabase UUID, not vendors.json */

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", product.vendor_id) // ✅ already real UUID
    .maybeSingle();

  /* ================= Helpers ================= */

  const imageUrl = product.image || "/placeholder.png";

  const priceDisplay = product.negotiable
    ? "Negotiable"
    : `₦${(product.discount_price ?? product.price)?.toLocaleString()}${
        product.unit ? ` / ${product.unit}` : ""
      }`;

  /* ================= UI ================= */

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Image */}
      <div className="w-full h-72 rounded-2xl overflow-hidden shadow-md">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold">{product.name}</h1>

      {/* Location */}
      <p className="text-sm text-gray-500">
        📍 {product.location || "Nigeria"}
      </p>

      {/* Price */}
      <p
        className={`font-semibold text-lg ${
          product.negotiable ? "text-orange-600" : "text-green-600"
        }`}
      >
        {priceDisplay}
      </p>

      {/* Description */}
      {product.description && (
        <p className="text-gray-700 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* ================= Contact Vendor ================= */}

      {vendor && (
        <section className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-3">Contact Vendor</h2>

          {/* ✅ PASS REAL SUPABASE UUID ONLY */}
          <VendorContactCTA
            vendor={{
              id: vendor.id, // ✅ REAL UUID (FIXED)
              business_name: vendor.business_name,
              phone: vendor.phone,
              whatsapp: vendor.whatsapp,
              email: vendor.email,
              location: vendor.location,
            }}
          />
        </section>
      )}
    </main>
  );
}
