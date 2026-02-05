"use client";

import { payForLeadUnlock } from "@/lib/paystack";

export default function PayToContactButton({
  leadId,
  email,
}: {
  leadId: string;
  email: string;
}) {
  function handlePay() {
    payForLeadUnlock({
      email,
      leadId,
      amount: 500, // your lead unlock price
    });
  }

  return (
    <button
      onClick={handlePay}
      className="h-9 rounded-md bg-green-600 px-3 text-sm font-medium text-white"
    >
      🔓 Pay to Contact
    </button>
  );
}
