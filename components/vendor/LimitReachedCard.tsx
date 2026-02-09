"use client";

import { useState } from "react";
import { PRICING } from "@/lib/config/pricing";

type Props = {
  currentPlan?: string; // "free" | "pro" | "elite"
  currentCount?: number;
};

export default function LimitReachedCard({
  currentPlan = "free",
  currentCount,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<null | "pro" | "elite">(null);

  const pro = PRICING.vendorPlans.pro;
  const elite = PRICING.vendorPlans.elite;

  /* =====================================================
     START CHECKOUT
     (Paystack wiring will plug into this endpoint next)
  ===================================================== */
  async function startUpgrade(plan: "pro" | "elite") {
    try {
      setLoadingPlan(plan);

      const res = await fetch("/api/payments/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upgrade failed");
        return;
      }

      // redirect to Paystack checkout (or success page)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      {/* HEADER */}
      <h3 className="text-lg font-semibold text-gray-900">
        🚫 Listing Limit Reached
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        Your <b>{currentPlan.toUpperCase()}</b> plan has reached its maximum
        listings.
        {typeof currentCount === "number" && (
          <> You currently have <b>{currentCount}</b> products.</>
        )}
      </p>

      <p className="mt-1 text-sm text-gray-600">
        Upgrade to continue selling more products.
      </p>

      {/* PLANS */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">

        {/* ================= PRO ================= */}
        <div className="rounded-lg border p-4 hover:shadow transition">

          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{pro.name}</p>
            <p className="text-green-700 font-semibold">
              {PRICING.format(pro.price)}/mo
            </p>
          </div>

          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            {pro.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <button
            disabled={loadingPlan !== null}
            onClick={() => startUpgrade("pro")}
            className="mt-4 w-full rounded-lg bg-green-600 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {loadingPlan === "pro" ? "Processing..." : "Upgrade to Pro"}
          </button>
        </div>


        {/* ================= ELITE ================= */}
        <div className="rounded-lg border p-4 hover:shadow transition">

          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{elite.name}</p>
            <p className="text-green-700 font-semibold">
              {PRICING.format(elite.price)}/mo
            </p>
          </div>

          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            {elite.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <button
            disabled={loadingPlan !== null}
            onClick={() => startUpgrade("elite")}
            className="mt-4 w-full rounded-lg bg-black py-2 text-white font-medium hover:bg-gray-900 disabled:opacity-60"
          >
            {loadingPlan === "elite" ? "Processing..." : "Upgrade to Elite"}
          </button>
        </div>

      </div>

      {/* FOOTER */}
      <p className="mt-4 text-xs text-gray-500">
        Upgrade takes effect instantly after payment.
      </p>
    </div>
  );
}
