import { supabaseServer } from "./supabase-server";

/* =====================================================
   CHECK VENDOR VERIFICATION (SERVER ONLY)
   - uses service role
   - safe for API/server actions
===================================================== */

export async function checkVendorVerified(userId: string) {
  if (!userId) return false;

  const supabase = await supabaseServer();

  /* ===============================
     FETCH VENDOR
  =============================== */

  const { data, error } = await supabase
    .from("vendors")
    .select(
      "phone_verified, bank_verified, identity_verified, is_verified"
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Vendor lookup failed:", error);
    return false;
  }

  /* ===============================
     COMPUTE STATUS
  =============================== */

  const verified =
    data.phone_verified &&
    data.bank_verified &&
    data.identity_verified;

  /* ===============================
     UPDATE ONLY IF NEEDED
     (prevents extra DB writes)
  =============================== */

  if (verified && !data.is_verified) {
    await supabase
      .from("vendors")
      .update({ is_verified: true })
      .eq("id", userId);
  }

  return verified;
}
