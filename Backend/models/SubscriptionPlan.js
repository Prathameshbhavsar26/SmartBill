import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ["starter", "pro", "enterprise"],
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "custom"],
      default: "monthly",
    },

    maxBusinesses: {
      type: Number,
      default: Infinity,
    },

    maxUsers: {
      type: Number,
      default: Infinity,
    },

    maxInvoicesPerMonth: {
      type: Number,
      default: Infinity,
    },

    features: {
      basicReports: { type: Boolean, default: false },
      emailSupport: { type: Boolean, default: false },
      advancedReports: { type: Boolean, default: false },
      gstFiling: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      barcodeScanner: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      dedicatedManager: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);