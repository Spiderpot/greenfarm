import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import VendorContactCTA from "@/components/product/VendorContactCTA";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetail({ params }: PageProps) {
  const { id } = await params;
  if (!id) return notFound();

  const supabase = await createSupabaseServerClient();

  /* ================= Fetch product ================= */

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "approved") // ✅ match list page
    .maybeSingle(); // ✅ safe

  if (error) {
    console.error("DETAIL FETCH ERROR:", error);
    return notFound();
  }

  if (!product) {
    return notFound();
  }

  /* ================= Fetch vendor ================= */

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", product.vendor_id)
    .maybeSingle();

  /* ================= Safe Data Handling ================= */

  const imageUrl =
    product.images?.[0] || product.image || "/placeholder.png";

  const isDemo = product.is_demo === true;

  const hasDiscount =
    product.discount_price &&
    product.price &&
    product.discount_price < product.price;

  const priceDisplay = product.negotiable
    ? "Negotiable"
    : hasDiscount
    ? `₦${product.discount_price?.toLocaleString()}`
    : product.price
    ? `₦${product.price.toLocaleString()}`
    : "";

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ================= Image ================= */}
      <div className="w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-md">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ================= Title ================= */}
      <h1 className="text-2xl font-bold">{product.title}</h1>

      {/* ================= Location ================= */}
      <p className="text-sm text-gray-500">
        📍 {product.location || "Nigeria"}
      </p>

      {/* ================= Price ================= */}
      <p
        className={`font-semibold text-lg ${
          isDemo
            ? "text-green-600"
            : product.negotiable
            ? "text-orange-600"
            : "text-green-600"
        }`}
      >
        {isDemo ? "Request Quote" : priceDisplay}
        {!isDemo && product.unit && (
          <span className="text-sm text-gray-500">
            {" "}
            / {product.unit}
          </span>
        )}
      </p>

      {/* ================= Description ================= */}
      {product.description && (
        <p className="text-gray-700 leading-relaxed">
          {product.description}
        </p>
      )}

      {/* ================= Contact Section ================= */}
      {vendor && (
        <section className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-3">
            {isDemo ? "Request Quote" : "Contact Vendor"}
          </h2>

          <VendorContactCTA
            productId={product.id}
            productName={product.title}
            isDemo={isDemo}
            vendor={{
              id: vendor.id,
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
