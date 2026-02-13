"use client";

import { useState } from "react";
import { PRICING } from "@/lib/config/pricing";

type PlanKey = "PRO_FARMER" | "ENTERPRISE";

type Props = {
  currentPlan?: string; // FREE | PRO_FARMER | ENTERPRISE
  currentCount?: number;
};

export default function LimitReachedCard({
  currentPlan = "FREE",
  currentCount,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  const pro = PRICING.vendorPlans.PRO_FARMER;
  const enterprise = PRICING.vendorPlans.ENTERPRISE;

  /* =====================================================
     START CHECKOUT
  ===================================================== */
  async function startUpgrade(plan: PlanKey) {
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

        {/* ================= PRO FARMER ================= */}
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
            onClick={() => startUpgrade("PRO_FARMER")}
            className="mt-4 w-full rounded-lg bg-green-600 py-2 text-white font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {loadingPlan === "PRO_FARMER"
              ? "Processing..."
              : "Upgrade to Pro Farmer"}
          </button>
        </div>

        {/* ================= ENTERPRISE ================= */}
        <div className="rounded-lg border p-4 hover:shadow transition">

          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{enterprise.name}</p>
            <p className="text-green-700 font-semibold">
              {PRICING.format(enterprise.price)}/mo
            </p>
          </div>

          <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
            {enterprise.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          <button
            disabled={loadingPlan !== null}
            onClick={() => startUpgrade("ENTERPRISE")}
            className="mt-4 w-full rounded-lg bg-black py-2 text-white font-medium hover:bg-gray-900 disabled:opacity-60"
          >
            {loadingPlan === "ENTERPRISE"
              ? "Processing..."
              : "Upgrade to Enterprise"}
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
