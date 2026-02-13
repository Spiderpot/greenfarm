import { PRICING } from "@/lib/config/pricing";

/* =====================================================
   TYPES
===================================================== */

type Metadata = {
  type?: string;
  vendorId?: string;
  leadId?: string;
  plan?: string;
  productId?: string;
};

/* =====================================================
   CORE PAYMENT (REDIRECT MODE ONLY)
   Stable for Next.js + React + Render
   No iframe, no popup, no Paystack script needed
===================================================== */

let isProcessing = false;

export async function payWithPaystack(params: {
  email: string;
  amount: number; // naira
  reference: string;
  metadata?: Metadata;
}) {
  if (isProcessing) return;

  try {
    isProcessing = true;

    console.log("🚀 Initializing Paystack redirect", params);

    const res = await fetch("/api/paystack/unlock-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amount,
        vendorId: params.metadata?.vendorId,
        leadId: params.metadata?.leadId,
        plan: params.metadata?.plan,
        type: params.metadata?.type,
        productId: params.metadata?.productId,
      }),
    });

    const data = await res.json();

    if (!data?.url) {
      throw new Error("Missing authorization url");
    }

    /* =========================================
       Redirect to Paystack hosted checkout
    ========================================= */

    window.location.href = data.url;

  } catch (err) {
    console.error("❌ Payment failed:", err);
    alert("Payment failed to initialize. Please retry.");
    isProcessing = false;
  }
}

/* =====================================================
   HELPERS
===================================================== */

export function payForVendorPlan(options: {
  plan: "PRO_FARMER" | "ENTERPRISE";
  email: string;
  vendorId: string;
}) {
  const price = PRICING.vendorPlans[options.plan].price;

  payWithPaystack({
    email: options.email,
    amount: price,
    reference: `vendor-${options.plan}-${Date.now()}`,
    metadata: {
      type: "vendor_plan",
      plan: options.plan,
      vendorId: options.vendorId, // ⭐ must come from DB only
    },
  });
}

export function payForLeadUnlock(options: {
  email: string;
  leadId: string;
  amount: number;
}) {
  payWithPaystack({
    email: options.email,
    amount: options.amount,
    reference: `lead-${options.leadId}-${Date.now()}`,
    metadata: {
      type: "lead_unlock",
      leadId: options.leadId,
    },
  });
}

export function payToFeatureProduct(options: {
  email: string;
  productId: string;
  amount: number;
}) {
  payWithPaystack({
    email: options.email,
    amount: options.amount,
    reference: `feature-${options.productId}-${Date.now()}`,
    metadata: {
      type: "feature_product",
      productId: options.productId,
    },
  });
}
