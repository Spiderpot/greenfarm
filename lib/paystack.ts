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
   WAIT FOR SCRIPT (robust)
===================================================== */

function waitForPaystack(): Promise<PaystackPop> {
  return new Promise((resolve, reject) => {
    let tries = 0;

    const timer = setInterval(() => {
      tries++;

      if (window.PaystackPop) {
        clearInterval(timer);
        resolve(window.PaystackPop);
        return;
      }

      /* wait up to ~5s */
      if (tries > 30) {
        clearInterval(timer);
        reject(new Error("Paystack script failed to load"));
      }
    }, 150);
  });
}

/* =====================================================
   CORE PAYMENT (INLINE MODE ONLY)
===================================================== */

export async function payWithPaystack(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Metadata;
  onSuccess: (ref: string) => void;
  onClose?: () => void;
}) {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!key) {
    console.error("❌ Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY");
    alert("Payment not configured");
    return;
  }

  try {
    const Paystack = await waitForPaystack();

    console.log("🚀 Opening Paystack popup...", {
      email: params.email,
      amount: params.amount,
      reference: params.reference,
    });

    const handler = Paystack.setup({
      key,
      email: params.email,
      amount: params.amount * 100,
      currency: "NGN",
      ref: params.reference,
      metadata: params.metadata,

      /* 🔥 GUARANTEED INLINE CALLBACK */
      callback: (res: PaystackResponse) => {
        console.log("✅ Paystack callback fired:", res.reference);
        params.onSuccess(res.reference);
      },

      onClose: () => {
        console.log("⚠️ Paystack closed");
        params.onClose?.();
      },
    });

    /* ALWAYS open iframe (no redirect) */
    handler.openIframe();
  } catch (err) {
    console.error("❌ Paystack error:", err);
    alert("Payment system failed to initialize");
  }
}

/* =====================================================
   VENDOR PLAN HELPER (UNCHANGED LOGIC)
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
