import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import ProductTable from "@/components/product/ProductTable";
import { getVendorProducts } from "@/lib/products";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
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
        remove() {}
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const products = await getVendorProducts(supabase, user.id)


  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">My Products</h1>

          <a
            href="/vendor/products/new"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Add Product
          </a>
        </div>

        <ProductTable products={products} />

      </div>
    </DashboardLayout>
  );
}
