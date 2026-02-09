"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";


import ProfileHeader from "@/components/dashboard/layout/ProfileHeader";
import Link from "next/link";
import StatsCard from "@/components/vendor/StatsCard";
import EarningsCard from "@/components/dashboard/layout/EarningsCard";
import LeadsChart from "@/components/dashboard/charts/LeadsChart";
import LeadsTable from "@/components/vendor/LeadsTable";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { PRICING } from "@/lib/config/pricing";
import { payForVendorPlan } from "@/lib/paystack";

/* =====================================================
   TYPES
===================================================== */

export type Lead = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  product_name: string;
  created_at: string;
};

type Vendor = {
  id?: string | null;
  email?: string | null;
  is_verified?: boolean | null;
  plan?: "free" | "pro" | "elite" | null;
  plan_expires_at?: string | null;
  monthly_product_limit?: number | null;
} | null;

type Props = {
  vendor: Vendor;
  leads: Lead[];
};

/* =====================================================
   COMPONENT
===================================================== */

export default function VendorDashboardClient({
  vendor,
  leads,
}: Props) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("reference") || params.get("trxref");
    if (!ref) return;

    (async () => {
      const res = await fetch(
        `/api/payments/verify?reference=${encodeURIComponent(ref)}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upgrade verification failed");
        return;
      }

      alert(`✅ Upgrade successful: ${String(data.plan).toUpperCase()}`);

      // Clean URL (remove ?reference=...) without a full reload
      window.history.replaceState({}, "", "/vendor/dashboard");

      // Hard refresh optional if your server page needs to re-fetch vendor plan:
      window.location.reload();
    })();
  }, [params]);


  /* =====================================================
     CORE VALUES
  ===================================================== */

  const vendorId = vendor?.id ?? "";
  const paymentEmail = vendor?.email || "vendor@greenfarm.ng";

  const plan = vendor?.plan ?? "free";
  const limit = vendor?.monthly_product_limit ?? 5;

  const isFree = plan === "free";
  const isElite = plan === "elite";

  /* =====================================================
     FILTER LEADS
  ===================================================== */

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;

    const q = search.toLowerCase();

    return leads.filter((l) =>
      `${l.buyer_name} ${l.product_name} ${l.buyer_phone}`
        .toLowerCase()
        .includes(q)
    );
  }, [leads, search]);

  /* =====================================================
     PAYMENT
  ===================================================== */

  function upgradePlan(p: "pro" | "elite") {
    if (!vendorId) {
      alert("Vendor not ready. Please login again.");
      return;
    }

    setLoading(p);

    payForVendorPlan({
      plan: p,
      email: paymentEmail,
      vendorId,
    });
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8 w-full text-gray-900">

      {/* ================= HEADER + ACTIONS ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* Left side */}
        <ProfileHeader />

        {/* Right side buttons */}
        <div className="flex gap-3">

          <Link
            href="/vendor/products/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            + Add Product
          </Link>

          <Link
            href="/vendor/products"
            className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Manage Products
          </Link>

        </div>
      </div>


      {/* ================= PLAN SECTION ================= */}

      <div className="bg-white border rounded-xl p-5 space-y-5">

        <h2 className="font-semibold text-sm">Subscription Plan</h2>

        <p className="text-sm">
          Current Plan:{" "}
          <span className="font-semibold uppercase">{plan}</span>
        </p>

        {/* ---------- FREE → show upgrade ---------- */}

        {isFree && (
          <div className="grid gap-4 md:grid-cols-2">

            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-base">Pro</h3>

              <p className="text-xs text-gray-500">
                50 listings • Featured products • Analytics
              </p>

              <Button
                onClick={() => upgradePlan("pro")}
                disabled={loading === "pro"}
              >
                {loading === "pro"
                  ? "Processing..."
                  : `Upgrade – ${PRICING.format(PRICING.vendorPlans.pro.price)} / month`}
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-base">Elite</h3>

              <p className="text-xs text-gray-500">
                Unlimited • Homepage boost • Priority leads
              </p>

              <Button
                onClick={() => upgradePlan("elite")}
                disabled={loading === "elite"}
              >
                {loading === "elite"
                  ? "Processing..."
                  : `Upgrade – ${PRICING.format(PRICING.vendorPlans.elite.price)} / month`}
              </Button>
            </div>

          </div>
        )}

        {!isFree && (
          <p className="text-green-600 text-sm">
            ✅ You are enjoying premium benefits
          </p>
        )}
      </div>

      {/* ================= STATS ================= */}

      <div className="grid gap-4 md:grid-cols-4">

        <StatsCard
          label="Leads"
          value={filtered.length}
          icon="📞"
        />

        <StatsCard
          label="Listings Used"
          value={isElite ? "Unlimited" : `${leads.length} / ${limit}`}
          icon="📦"
        />

        <StatsCard
          label="Plan"
          value={plan.toUpperCase()}
          icon="⭐"
        />

        <StatsCard
          label="Expires"
          value={
            vendor?.plan_expires_at
              ? new Date(vendor.plan_expires_at).toLocaleDateString()
              : "--"
          }
          icon="📅"
        />

        <EarningsCard />
      </div>

      {/* ================= ANALYTICS LOCK ================= */}

      {!isFree && <LeadsChart leads={filtered} />}

      {/* ================= SEARCH ================= */}

      <Input
        placeholder="Search buyer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}

      <LeadsTable
        leads={filtered}
        vendorId={vendorId}
        vendorEmail={paymentEmail}
      />
    </div>
  );
}
