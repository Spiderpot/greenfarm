"use client";

import { payToFeatureProduct } from "@/lib/paystack";

export default function FeatureProductButton({
  productId,
}: {
  productId: string;
}) {
  function handlePay() {
    payToFeatureProduct({
      email: "vendor@greenfarm.app",
      productId,
      amount: 500,
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
