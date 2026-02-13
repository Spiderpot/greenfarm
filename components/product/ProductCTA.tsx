"use client";

import VendorContactCTA, { Vendor } from "@/components/product/VendorContactCTA";

interface Props {
  vendor: Vendor;
  productId: string;
  productName?: string;
  isDemo?: boolean; // ✅ NEW
}

/* =====================================================
   ProductCTA
   - Real products → show contact
   - Demo products → show request quote notice only
===================================================== */

export default function ProductCTA({
  vendor,
  productId,
  productName,
  isDemo = false,
}: Props) {
  return (
    <section className="pt-6 border-t">
      <h2 className="text-lg font-semibold mb-3">
        {isDemo ? "Request Quote" : "Contact Vendor"}
      </h2>

      {/* 🔒 DEMO LISTING → NO DIRECT CONTACT */}
      {isDemo ? (
        <div className="rounded-xl border bg-yellow-50 p-4 text-sm">
          <p className="font-semibold text-yellow-800">
            This is a sample listing.
          </p>
          <p className="text-yellow-700 mt-1">
            Submit a request to receive pricing and availability from verified farmers.
          </p>
        </div>
      ) : (
        <VendorContactCTA
          vendor={vendor}
          productId={productId}
          productName={productName}
        />
      )}
    </section>
  );
}
