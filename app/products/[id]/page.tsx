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

  /* ================= Fetch product (simple + safe) ================= */

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !product) {
    console.error("DETAIL FETCH FAILED:", error);
    return notFound();
  }

  /* ================= Expiry Check (JS instead of SQL) ================= */
  const now = new Date();

  if (
    product.expires_at &&
    new Date(product.expires_at) < now
  ) {
    return notFound();
  }


  /* ================= Fetch vendor ================= */

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", product.vendor_id)
    .maybeSingle();

  const imageUrl = product.image || "/placeholder.png";
  const isDemo = product.is_demo === true;

  const priceDisplay = product.negotiable
    ? "Negotiable"
    : `₦${(product.discount_price ?? product.price)?.toLocaleString()}${
        product.unit ? ` / ${product.unit}` : ""
      }`;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">

      <div className="w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-md">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold">{product.name}</h1>

      <p className="text-sm text-gray-500">
        📍 {product.location || "Nigeria"}
      </p>

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
      </p>

      {product.description && (
        <p className="text-gray-700 leading-relaxed">
          {product.description}
        </p>
      )}

      {vendor && (
        <section className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-3">
            {isDemo ? "Request Quote" : "Contact Vendor"}
          </h2>

          <VendorContactCTA
            productId={product.id}
            productName={product.name}
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
