"use client";

import { payForVendorPlan } from "@/lib/paystack";

export default function PayToListButton({
  vendorId,
}: {
  vendorId: string;
}) {
  function handlePay() {
    payForVendorPlan({
      plan: "pro", // listing unlocks PRO
      email: "vendor@greenfarm.app",
      vendorId,
    });
  }

  return (
    <button
      onClick={handlePay}
      className="h-11 w-full rounded-md bg-blue-600 text-white font-medium"
    >
      Pay ₦1000 to List Product
    </button>
  );
}
