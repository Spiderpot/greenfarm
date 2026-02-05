export type Vendor = {
  id: string;

  phone_verified: boolean;
  bank_verified: boolean;
  identity_verified: boolean;
  is_verified: boolean;

  /* ===============================
     SUBSCRIPTION (NEW)
  =============================== */

  plan?: "free" | "pro" | "elite";
  plan_expires_at?: string | null;
};
