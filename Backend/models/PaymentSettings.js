import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    sales: {
      type: [String],
      default: ["Cash", "UPI & QR Code", "Credit / Debit Card", "Store Credit / Khata"],
    },
    purchase: {
      type: [String],
      default: ["Cash", "Bank Transfer", "Cheque / DD", "Credit / Debit Card"],
    },
    expenses: {
      type: [String],
      default: ["Cash", "UPI & QR Code", "Bank Transfer", "Credit / Debit Card"],
    },
    defaultSalesMethod: {
      type: String,
      default: "Cash",
      trim: true,
    },
    upiSettings: {
      enabled: { type: Boolean, default: true },
      upiId: { type: String, default: "", trim: true },
      payeeName: { type: String, default: "", trim: true },
      showDynamicQrOnInvoice: { type: Boolean, default: true },
    },
    bankSettings: {
      enabled: { type: Boolean, default: true },
      bankName: { type: String, default: "", trim: true },
      accountHolderName: { type: String, default: "", trim: true },
      accountNumber: { type: String, default: "", trim: true },
      accountType: { type: String, default: "Current", trim: true },
      ifscCode: { type: String, default: "", trim: true },
      branchName: { type: String, default: "", trim: true },
      showOnInvoice: { type: Boolean, default: true },
    },
    transactionRules: {
      cashRounding: { type: Boolean, default: true },
      allowSplitPayment: { type: Boolean, default: true },
      requireReferenceNumber: { type: Boolean, default: false },
    },
    customMethods: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },
        channels: { type: [String], default: ["sales"] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
