"use client";

import { getSupabaseClient } from "@/lib/supabase-client";

const supabase = getSupabaseClient();

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="text-sm text-red-600 underline"
    >
      Logout
    </button>
  );
}
