"use server";

import { supabaseServer } from "@/lib/supabase-server";

/* ========================================
   TYPES (no any, build-safe)
======================================== */

type Payment = {
  id: string;
  reference: string;
  amount: number | null;
  status: string | null;
  created_at: string;
};

type Subscription = {
  id: string;
  vendor_id: string;
  expires_at: string;
};

type Featured = {
  id: string;
  expires_at: string;
};

/* ========================================
   Helpers
======================================== */

async function getStats() {
  const supabase = await supabaseServer(); // ✅ CRITICAL FIX

  const now = new Date().toISOString();

  const [paymentsRes, subsRes, featuredRes] = await Promise.all([
    supabase.from("payments").select("*"),
    supabase
      .from("vendor_subscriptions")
      .select("*")
      .gte("expires_at", now),
    supabase
      .from("featured_products")
      .select("*")
      .gte("expires_at", now),
  ]);

  const payments: Payment[] = paymentsRes.data ?? [];
  const subs: Subscription[] = subsRes.data ?? [];
  const featured: Featured[] = featuredRes.data ?? [];

  const revenue = payments.reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0
  );

  return {
    revenue,
    payments,
    subs,
    featured,
  };
}

/* ========================================
   Page
======================================== */

export default async function AdminDashboard() {
  const { revenue, payments, subs, featured } = await getStats();

  return (
    <main className="min-h-screen p-6 bg-zinc-50">
      <h1 className="mb-6 text-2xl font-bold">
        GreenFarm Admin Dashboard
      </h1>

      {/* ================= Stats cards ================= */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Revenue" value={`₦${revenue}`} />
        <StatCard label="Payments" value={payments.length} />
        <StatCard label="Active Vendors" value={subs.length} />
        <StatCard label="Featured Boosts" value={featured.length} />
      </div>

      {/* ================= Payments ================= */}

      <section className="mb-10">
        <h2 className="mb-3 font-semibold">Payments</h2>

        <div className="overflow-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <Th>Ref</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <Td>{p.reference}</Td>
                  <Td>₦{p.amount ?? 0}</Td>
                  <Td>{p.status ?? "-"}</Td>
                  <Td>
                    {new Date(p.created_at).toLocaleDateString()}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= Subscriptions ================= */}

      <section>
        <h2 className="mb-3 font-semibold">
          Active Vendor Subscriptions
        </h2>

        <div className="overflow-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <Th>Vendor</Th>
                <Th>Expires</Th>
              </tr>
            </thead>

            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t">
                  <Td>{s.vendor_id}</Td>
                  <Td>
                    {new Date(s.expires_at).toLocaleDateString()}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

/* ========================================
   UI helpers
======================================== */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="p-3 text-left font-medium">{children}</th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-3">{children}</td>;
}
