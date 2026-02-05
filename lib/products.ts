// /lib/products.ts

import { supabase } from "@/lib/supabase"

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return data
}
