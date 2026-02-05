"use client";

import { createBrowserClient } from "@supabase/ssr";

/* =====================================================
   SAFE SUPABASE CLIENT FACTORY
   (lazy init – prevents build crash)
===================================================== */

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
