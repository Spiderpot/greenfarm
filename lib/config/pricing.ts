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
    FREE: {
      key: "FREE",
      name: "Free",
      price: 0,

      limits: {
        listings: 1,
        featured: false,
        analytics: false,
        expiresDays: 7,
      },

      features: [
        "1 product only",
        "Expires after 7 days",
        "Basic visibility",
      ],
    },

    PRO_FARMER: {
      key: "PRO_FARMER",
      name: "Pro Farmer",
      price: 5000,

      limits: {
        listings: 20,
        featured: true,
        analytics: true,
        expiresDays: null,
      },

      features: [
        "Up to 20 products",
        "No expiry",
        "Feature products",
        "Higher ranking",
        "Verified badge",
      ],
    },

    ENTERPRISE: {
      key: "ENTERPRISE",
      name: "Enterprise / Aggregator",
      price: 15000,

      limits: {
        listings: Number.POSITIVE_INFINITY, // safer than Infinity
        featured: true,
        analytics: true,
        expiresDays: null,
        commissionPct: 3,
      },

      features: [
        "Unlimited products",
        "No expiry",
        "Homepage featured",
        "Top search placement",
        "Priority leads",
        "3% transaction commission (escrow soon)",
      ],
    },
  },

  /* =====================================================
     One-time Payments
  ===================================================== */
  oneTime: {
    featureProduct: 1000,
    boostListing: 500,
    convenienceConnect: 50,
  },

  /* =====================================================
     Helpers
  ===================================================== */

  format(price: number) {
    return `₦${price.toLocaleString()}`;
  },

  getPlan(plan?: string) {
    const normalized = String(plan || "FREE").toUpperCase().trim();

    if (normalized in this.vendorPlans) {
      return this.vendorPlans[
        normalized as keyof typeof this.vendorPlans
      ];
    }

    return this.vendorPlans.FREE;
  },

  getListingLimit(plan?: string) {
    return this.getPlan(plan).limits.listings;
  },
} as const;
