"use client";

import { useMemo, useState } from "react";

import ProfileHeader from "@/components/dashboard/layout/ProfileHeader";
import StatsCard from "@/components/vendor/StatsCard";
import EarningsCard from "@/components/dashboard/layout/EarningsCard";
import LeadsChart from "@/components/dashboard/charts/LeadsChart";
import LeadsTable from "@/components/vendor/LeadsTable";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { PRICING } from "@/lib/config/pricing";
import { payForVendorPlan } from "@/lib/paystack";
import { getSupabaseClient } from "@/lib/supabase-client";

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
} | null;

/* =====================================================
   ONLY CHANGE → added 3 optional props
===================================================== */

type Props = {
  vendor: Vendor;
  leads: Lead[];

  userEmail?: string;
  isPro?: boolean;
  isElite?: boolean;
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

  const vendorId = vendor?.id ?? "";
  const paymentEmail = vendor?.email || "vendor@greenfarm.ng";
  const plan = vendor?.plan ?? "free";
  const supabase = getSupabaseClient();

  /* =====================================================
     FILTER
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
     PAYMENT + INSERT (UNCHANGED WORKING LOGIC)
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

      async onSuccess(reference) {
        console.log("DEBUG PAYMENT DATA:", {
          vendorId,
          plan: p,
          reference,
        });

        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        await supabase.from("vendor_subscriptions").insert({
          vendor_id: vendorId,
          reference,
          plan: p,
          status: "active",
          expires_at: expires.toISOString(),
        });

        alert("Subscription activated 🎉");
        window.location.reload();
      },
    });
  }

  /* =====================================================
     UI (UNCHANGED)
  ===================================================== */

  return (
    <div className="space-y-8 w-full text-gray-900">

      <ProfileHeader />

      {/* ================= PLAN SECTION ================= */}
      <div className="bg-white border rounded-xl p-5 space-y-5">

        <h2 className="font-semibold text-sm">Subscription Plan</h2>

        <p className="text-sm">
          Current Plan:{" "}
          <span className="font-semibold uppercase">{plan}</span>
        </p>

        {plan === "free" && (
          <div className="grid gap-4 md:grid-cols-2">

            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-base">Pro</h3>

              <p className="text-xs text-gray-500">
                Higher ranking • Verified badge • More visibility
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
                Homepage feature • Analytics • Priority leads • Premium exposure
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

        {plan !== "free" && (
          <p className="text-green-600 text-sm">
            ✅ You are enjoying premium benefits
          </p>
        )}
      </div>

      {/* ================= STATS ================= */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label="Leads" value={filtered.length} icon="📞" />
        <StatsCard label="Active" value="Yes" icon="⭐" />
        <StatsCard label="Expires" value="--" icon="📅" />
        <EarningsCard />
      </div>

      <LeadsChart leads={filtered} />

      <Input
        placeholder="Search buyer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <LeadsTable
        leads={filtered}
        vendorId={vendorId}
        vendorEmail={paymentEmail}
      />
    </div>
  );
}
