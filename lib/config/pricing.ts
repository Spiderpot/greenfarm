/* =====================================================
   PRICING CONFIG (Single Source of Truth)
   ⚠️ Edit prices ONLY here
   All payments read from this file
===================================================== */

export const PRICING = {
  /* =====================================================
     Vendor Subscription Plans (monthly)
  ===================================================== */
  vendorPlans: {
    free: {
      name: "Free",
      price: 0,
      features: [
        "List products",
        "Basic visibility",
      ],
    },

    pro: {
      name: "Pro",
      price: 5000,
      features: [
        "Higher ranking",
        "Verified badge",
        "More impressions",
        "Priority exposure",
      ],
    },

    elite: {
      name: "Elite",
      price: 15000,
      features: [
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
  featureProduct: 1000,      // boost one product
  boostListing: 500,        // temporary boost
  convenienceConnect: 50,   // optional buyer fast-connect (future)

  /* =====================================================
     Helper (optional)
     prevents repeating ₦ formatting everywhere
  ===================================================== */
  format(price: number) {
    return `₦${price.toLocaleString()}`;
  },
} as const;
