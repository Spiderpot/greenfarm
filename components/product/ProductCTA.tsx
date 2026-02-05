"use client";

import VendorContactCTA, {
  Vendor,
} from "@/components/product/VendorContactCTA";

interface Props {
  vendor: Vendor;
}

/* =====================================================
   ProductCTA
   (simple, free contact only)
===================================================== */

export default function ProductCTA({ vendor }: Props) {
  return (
    <section className="pt-6 border-t">
      <h2 className="text-lg font-semibold mb-3">Contact Vendor</h2>

      <VendorContactCTA vendor={vendor} />
    </section>
  );
}
