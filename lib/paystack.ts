import { PRICING } from "@/lib/config/pricing";

/* =====================================================
   TYPES
===================================================== */

type Metadata = Record<string, unknown>;

type PaystackResponse = {
  reference: string;
};

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackPop = {
  setup: (config: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    metadata?: Metadata;
    callback: (response: PaystackResponse) => void;
    onClose: () => void;
  }) => PaystackHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

/* =====================================================
   CONSTANTS
===================================================== */

const PAYSTACK_SRC = "https://js.paystack.co/v1/inline.js";

/* =====================================================
   LOAD SCRIPT (auto inject if missing)
===================================================== */

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // already loaded
    if (window.PaystackPop) return resolve();

    const existing = document.querySelector(
      `script[src="${PAYSTACK_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Paystack script failed to load"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = PAYSTACK_SRC;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Paystack script failed to load"));

    document.body.appendChild(script);
  });
}

/* =====================================================
   WAIT FOR PAYSTACK
===================================================== */

async function waitForPaystack(): Promise<PaystackPop> {
  await loadPaystackScript();

  return new Promise((resolve, reject) => {
    let tries = 0;

    const timer = setInterval(() => {
      tries++;

      if (window.PaystackPop) {
        clearInterval(timer);
        resolve(window.PaystackPop);
        return;
      }

      if (tries > 30) {
        clearInterval(timer);
        reject(new Error("Paystack not available"));
      }
    }, 150);
  });
}

/* =====================================================
   CORE PAYMENT (INLINE ONLY)
===================================================== */

let isProcessing = false;

export async function payWithPaystack(params: {
  email: string;
  amount: number; // naira
  reference: string;
  metadata?: Metadata;
  onSuccess: (ref: string) => void;
  onClose?: () => void;
}) {
  if (isProcessing) {
    console.warn("⚠️ Payment already processing...");
    return;
  }

  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!key) {
    console.error("❌ Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY");
    alert("Payment not configured");
    return;
  }

  try {
    isProcessing = true;

    const Paystack = await waitForPaystack();

    console.log("🚀 Paystack init", {
      email: params.email,
      amount: params.amount,
      reference: params.reference,
    });

    const handler = Paystack.setup({
      key,
      email: params.email,
      amount: Math.round(params.amount * 100), // kobo
      currency: "NGN",
      ref: params.reference,
      metadata: params.metadata,

      callback: (res: PaystackResponse) => {
        console.log("✅ Payment success:", res.reference);
        isProcessing = false;
        params.onSuccess(res.reference);
      },

      onClose: () => {
        console.log("⚠️ Payment cancelled");
        isProcessing = false;
        params.onClose?.();
      },
    });

    handler.openIframe();
  } catch (err) {
    isProcessing = false;
    console.error("❌ Paystack init failed:", err);
    alert("Payment failed to initialize. Please retry.");
  }
}

/* =====================================================
   HELPERS
===================================================== */

export function payForVendorPlan(options: {
  plan: "pro" | "elite";
  email: string;
  vendorId: string;
  onSuccess: (ref: string) => void;
}) {
  const price = PRICING.vendorPlans[options.plan].price;

  payWithPaystack({
    email: options.email,
    amount: price,
    reference: `vendor-${options.plan}-${Date.now()}`,
    metadata: {
      type: "vendor_plan",
      plan: options.plan,
      vendorId: options.vendorId,
    },
    onSuccess: options.onSuccess,
  });
}

/* =====================================================
   FUTURE READY HELPERS (optional but useful)
===================================================== */

export function payForLeadUnlock(options: {
  email: string;
  leadId: string;
  amount: number;
  onSuccess: (ref: string) => void;
}) {
  payWithPaystack({
    email: options.email,
    amount: options.amount,
    reference: `lead-${options.leadId}-${Date.now()}`,
    metadata: {
      type: "lead_unlock",
      leadId: options.leadId,
    },
    onSuccess: options.onSuccess,
  });
}

export function payToFeatureProduct(options: {
  email: string;
  productId: string;
  amount: number;
  onSuccess: (ref: string) => void;
}) {
  payWithPaystack({
    email: options.email,
    amount: options.amount,
    reference: `feature-${options.productId}-${Date.now()}`,
    metadata: {
      type: "feature_product",
      productId: options.productId,
    },
    onSuccess: options.onSuccess,
  });
}
