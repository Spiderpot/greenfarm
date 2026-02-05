"use client";

import { createBrowserClient } from "@supabase/ssr";

/* =====================================================
   SAFE BROWSER CLIENT FACTORY
   (prevents build-time execution on Vercel)
===================================================== */

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
