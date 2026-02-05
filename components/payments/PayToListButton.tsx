"use client";

import { payWithPaystack } from "@/lib/paystack";
import { activateVendorSubscription } from "@/app/actions/activateVendor";

export default function PayToListButton({
  vendorId,
}: {
  vendorId: string;
}) {
  function handlePay() {
    payWithPaystack({
      email: "vendor@greenfarm.app",
      amount: 1000,
      reference: String(Date.now()),
      metadata: {
        payment_type: "vendor_subscription",
        vendor_id: vendorId,
      },
      onSuccess: async (reference) => {
        
        await activateVendorSubscription({
          vendorId,
          reference,
          plan: "pro", // ✅ required
        });


        alert("✅ Subscription active for 30 days!");
      },
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
