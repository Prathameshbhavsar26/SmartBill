import Coupon from "../models/Coupon.js";

const DEFAULT_COUPONS = [
  {
    code: "WELCOME50",
    title: "Launch Special — 50% Flat Off",
    description: "Enjoy 50% instant discount on your first subscription upgrade or purchase.",
    discountType: "percentage",
    discountValue: 50,
    maxDiscountAmount: 2000,
    minOrderAmount: 499,
    applicablePlans: ["all"],
    applicableCycles: ["all"],
    maxUsageCount: 500,
    maxUsagePerUser: 1,
    status: "active",
    isFeaturedBanner: true,
    bannerText: "⚡ SPECIAL OFFER: Save 50% on all plans with code WELCOME50!",
    bannerCta: "Claim 50% Off",
  },
  {
    code: "PRO20",
    title: "Pro Business Booster",
    description: "Get 20% discount on the Pro Plan for growing retail and wholesale stores.",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountAmount: 1000,
    minOrderAmount: 999,
    applicablePlans: ["pro"],
    applicableCycles: ["all"],
    maxUsageCount: 1000,
    maxUsagePerUser: 2,
    status: "active",
    isFeaturedBanner: false,
    bannerText: "",
    bannerCta: "Claim Offer",
  },
  {
    code: "SAVE500",
    title: "Flat ₹500 Instant Savings",
    description: "Save ₹500 directly at checkout on any plan subscription.",
    discountType: "flat",
    discountValue: 500,
    maxDiscountAmount: null,
    minOrderAmount: 999,
    applicablePlans: ["all"],
    applicableCycles: ["all"],
    maxUsageCount: 200,
    maxUsagePerUser: 1,
    status: "active",
    isFeaturedBanner: false,
    bannerText: "",
    bannerCta: "Claim Offer",
  },
  {
    code: "SCALE15",
    title: "Enterprise Scaling Discount",
    description: "Get 15% off on Enterprise plan with unlimited branches and users.",
    discountType: "percentage",
    discountValue: 15,
    maxDiscountAmount: 3000,
    minOrderAmount: 2000,
    applicablePlans: ["enterprise"],
    applicableCycles: ["all"],
    maxUsageCount: 500,
    maxUsagePerUser: 1,
    status: "active",
    isFeaturedBanner: false,
    bannerText: "",
    bannerCta: "Claim Offer",
  },
];

export default async function seedCoupons() {
  try {
    for (const couponData of DEFAULT_COUPONS) {
      const existing = await Coupon.findOne({ code: couponData.code });
      if (!existing) {
        await Coupon.create(couponData);
        console.log(`[SEED] Created default promotional coupon: ${couponData.code}`);
      }
    }
    console.log("[SEED] Promotional coupons verified/seeded successfully.");
  } catch (error) {
    console.error("[SEED] Error seeding promotional coupons:", error.message);
  }
}
