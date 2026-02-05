import { supabase } from "./supabase";

export async function checkVendorVerified(userId: string) {
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", userId)
    .single();

  const verified =
    data.phone_verified &&
    data.bank_verified &&
    data.identity_verified;

  if (verified) {
    await supabase
      .from("vendors")
      .update({ is_verified: true })
      .eq("id", userId);
  }
}
