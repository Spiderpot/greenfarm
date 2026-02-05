"use server";

import { supabaseServer } from "@/lib/supabase-server";

export async function unlockLead(
  vendorId: string,
  leadId: string
) {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from("lead_unlocks")
    .insert({
      vendor_id: vendorId,
      lead_id: leadId,
      paid: true,
    });

  if (error) throw error;

  return true;
}
