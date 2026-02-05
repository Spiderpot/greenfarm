"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/* =====================================================
   ENV VALIDATION
===================================================== */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anon) {
  throw new Error("Missing Supabase client environment variables");
}

/* =====================================================
   SINGLETON CLIENT
   (prevents multiple instances + safe for Next.js)
===================================================== */

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(url, anon);
  }
  return client;
}

/* =====================================================
   DEFAULT EXPORT FOR EASY IMPORT
   👇 this fixes your build error
===================================================== */

export const supabase = getSupabaseClient();
