"use client";

import { payWithPaystack } from "@/lib/paystack";
import { activateFeatured } from "@/app/actions/activateFeatured";

export default function FeatureProductButton({
  productId,
  vendorId,
}: {
  productId: string;
  vendorId: string;
}) {
  function handlePay() {
    payWithPaystack({
      email: "vendor@greenfarm.app",
      amount: 500,
      reference: String(Date.now()),
      metadata: {
        payment_type: "featured_product",
        product_id: productId,
      },
      onSuccess: async (reference) => {
        await activateFeatured({
          productId,
          vendorId,
          reference,
        });

        alert("🚀 Product boosted for 7 days!");
      },
    });
  }

  return (
    <button
      onClick={handlePay}
      className="h-10 rounded-md bg-yellow-500 px-3 text-sm font-medium text-black"
    >
      ⭐ Feature Product (₦500)
    </button>
  );
}
