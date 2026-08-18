import mongoose from "mongoose";

const transactionSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Sales & Pricing
    salePrice: {
      type: String,
      default: "Retail Price",
      trim: true,
    },

    discountType: {
      type: String,
      default: "Percentage",
      trim: true,
    },

    allowDiscount: {
      type: Boolean,
      default: true,
    },

    allowPriceEditing: {
      type: Boolean,
      default: false,
    },

    allowNegativeStock: {
      type: Boolean,
      default: false,
    },

    // Discount Rules
    discountAppliedOn: {
      type: String,
      default: "Item-wise",
      trim: true,
    },

    maximumDiscount: {
      type: String,
      default: "20",
      trim: true,
    },

    restrictDiscountLimit: {
      type: Boolean,
      default: true,
    },

    // Sales Returns
    requireReturnPasscode: {
      type: Boolean,
      default: false,
    },

    allowPartialReturn: {
      type: Boolean,
      default: true,
    },

    restoreStockAfterReturn: {
      type: Boolean,
      default: true,
    },

    allowReturnWithoutInvoice: {
      type: Boolean,
      default: false,
    },

    // Cash Discount
    enableCashDiscount: {
      type: Boolean,
      default: true,
    },

    cashDiscountType: {
      type: String,
      default: "Percentage",
      trim: true,
    },

    defaultCashDiscount: {
      type: String,
      default: "0",
      trim: true,
    },

    // Invoice Behavior
    autoSaveInvoice: {
      type: Boolean,
      default: true,
    },

    printAfterSaving: {
      type: Boolean,
      default: false,
    },

    showPrintPreview: {
      type: Boolean,
      default: true,
    },

    // Order Management
    linkOrdersToInvoices: {
      type: Boolean,
      default: true,
    },

    autoConvertOrders: {
      type: Boolean,
      default: false,
    },

    allowPartialOrderConversion: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "TransactionSettings",
  transactionSettingsSchema
);