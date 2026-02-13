// C:\Users\JULIUS  CZAR KOME\Documents\greenfarm\app\vendor\dashboard\page.tsx

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

  const { vendor, leads, earnings } =
    await getVendorDashboardData(user.id);

  if (!vendor) redirect("/login");

  /* ================= RENDER ================= */

  return (
    <DashboardLayout>
      <VendorDashboardClient
        vendor={vendor}
        leads={leads}
        earnings={earnings}
      />
    </DashboardLayout>
  );
}
