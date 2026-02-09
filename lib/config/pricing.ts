/* =====================================================
   PRICING CONFIG (Single Source of Truth)
   ⚠️ Edit plans, limits, prices ONLY here
   All payments + restrictions read from this file
===================================================== */

export const PRICING = {
  /* =====================================================
     Vendor Subscription Plans (monthly)
  ===================================================== */
  vendorPlans: {
    free: {
      key: "FREE",
      name: "Free",
      price: 0,

      /* 🔥 business rules */
      limits: {
        listings: 5, // ← UPDATED (was 10)
        featured: false,
        analytics: false,
      },

      features: [
        "Up to 5 products",
        "Basic visibility",
      ],
    },

    pro: {
      key: "PRO",
      name: "Pro",
      price: 5000,

      limits: {
        listings: 50,
        featured: true,
        analytics: true,
      },

      features: [
        "Up to 50 products",
        "Feature products",
        "Higher ranking",
        "Verified badge",
        "More impressions",
      ],
    },

    elite: {
      key: "ELITE",
      name: "Elite",
      price: 15000,

      limits: {
        listings: Infinity,
        featured: true,
        analytics: true,
      },

      features: [
        "Unlimited products",
        "Homepage featured",
        "Top search placement",
        "Advanced analytics",
        "Priority leads",
        "Instant WhatsApp connect",
      ],
    },
  },

  /* =====================================================
     One-time Payments
  ===================================================== */
  oneTime: {
    featureProduct: 1000,     // boost one product
    boostListing: 500,        // temporary boost
    convenienceConnect: 50,   // optional buyer fast-connect
  },

  /* =====================================================
     Helpers
  ===================================================== */

  format(price: number) {
    return `₦${price.toLocaleString()}`;
  },

  /* 🔥 get plan safely */
  getPlan(plan?: string) {
    const key = (plan || "FREE").toLowerCase() as keyof typeof this.vendorPlans;
    return this.vendorPlans[key] ?? this.vendorPlans.free;
  },

  /* 🔥 listing limit helper */
  getListingLimit(plan?: string) {
    return this.getPlan(plan).limits.listings;
  },
} as const;
