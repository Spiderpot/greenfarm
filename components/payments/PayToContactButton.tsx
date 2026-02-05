"use client";

import { payWithPaystack } from "@/lib/paystack";

export default function PayToContactButton({
  amount,
  buyerEmail,
  onSuccess,
}: {
  amount: number;
  buyerEmail: string;
  onSuccess: (reference: string) => void;
}) {
  function handlePay() {
    payWithPaystack({
      email: buyerEmail || "buyer@greenfarm.app",
      amount,
      reference: String(Date.now()),
      metadata: {
        payment_type: "pay_to_contact",
      },
      onSuccess,
    });
  }

  return (
    <button
      onClick={handlePay}
      className="h-11 w-full rounded-md bg-green-600 text-white"
    >
      Unlock Vendor Contact
    </button>
  );
}
