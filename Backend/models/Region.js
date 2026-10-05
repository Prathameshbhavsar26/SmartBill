import mongoose from "mongoose";

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Region name is required"],
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, "Region code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    states: [
      {
        type: String,
        trim: true,
      },
    ],
    cities: [
      {
        type: String,
        trim: true,
      },
    ],
    currency: {
      code: { type: String, default: "INR" },
      symbol: { type: String, default: "₹" },
      position: { type: String, enum: ["before", "after"], default: "before" },
    },
    taxSettings: {
      taxType: {
        type: String,
        enum: ["GST", "VAT", "SALES_TAX", "NONE"],
        default: "GST",
      },
      taxLabel: { type: String, default: "GSTIN" },
      defaultTaxRate: { type: Number, default: 18 },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

regionSchema.index({ code: 1, status: 1 });

export default mongoose.models.Region || mongoose.model("Region", regionSchema);
