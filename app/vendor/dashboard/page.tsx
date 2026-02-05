import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import VendorDashboardClient from "@/components/vendor/VendorDashboardClient";

import { getVendorDashboardData } from "@/lib/queries/getVendorData";

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  /* ================= AUTH ================= */

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* ================= DATA ================= */

  const { vendor, leads } = await getVendorDashboardData(user.id);

  if (!vendor) redirect("/login");

  /* ================= SUB FLAGS (TYPE SAFE) =================
     We avoid touching vendor.plan types directly
  ========================================================== */

  const v = vendor as unknown as {
  plan?: "free" | "pro" | "elite";
  plan_expires_at?: string | null;
};

const now = new Date();

const isActive =
  v.plan_expires_at && new Date(v.plan_expires_at) > now;

const plan = isActive ? v.plan : "free";


  const isPro = plan === "pro" || plan === "elite";
  const isElite = plan === "elite";

  /* ================= RENDER ================= */

  return (
    <DashboardLayout>
      <VendorDashboardClient
        vendor={vendor}
        leads={leads}
        userEmail={user.email}
        isPro={isPro}
        isElite={isElite}
      />
    </DashboardLayout>
  );
}
