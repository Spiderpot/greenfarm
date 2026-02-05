import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import VendorDashboardClient from "@/components/vendor/VendorDashboardClient";

import { getVendorDashboardData } from "@/lib/queries/getVendorData";

/* =====================================================
   SERVER PAGE — VENDOR DASHBOARD
   STABLE • SSR SAFE • CLEAN
===================================================== */

export default async function VendorDashboard() {
  /* =====================================================
     CREATE SERVER SUPABASE CLIENT
  ===================================================== */

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

  /* =====================================================
     AUTH CHECK
  ===================================================== */

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* =====================================================
     FETCH DASHBOARD DATA
     IMPORTANT:
     pass USER ID only
  ===================================================== */

  const { vendor, leads } =
    await getVendorDashboardData(user.id);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <DashboardLayout>
      <VendorDashboardClient
        vendor={vendor}
        leads={leads}
      />
    </DashboardLayout>
  );
}
