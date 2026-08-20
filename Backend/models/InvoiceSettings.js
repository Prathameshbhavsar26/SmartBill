import mongoose from "mongoose";

const invoiceSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // General Settings
    invoicePrefix: { type: String, default: "INV" },
    startingNumber: { type: Number, default: 1 },
    autoNumbering: { type: Boolean, default: true },
    financialYearWise: { type: Boolean, default: true },
    invoiceTitle: { type: String, default: "Tax Invoice" },
    defaultType: { type: String, default: "Tax Invoice" },
    dateFormat: { type: String, default: "DD-MM-YYYY" },
    
    // Customer Display
    showCustomerName: { type: Boolean, default: true },
    showCustomerMobile: { type: Boolean, default: true },
    showBillingAddress: { type: Boolean, default: true },
    showShippingAddress: { type: Boolean, default: false },
    showCustomerGSTIN: { type: Boolean, default: true },
    
    // Item Columns
    showHSN: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    showSKU: { type: Boolean, default: false },
    showDiscount: { type: Boolean, default: true },
    showTax: { type: Boolean, default: true },
    showBatch: { type: Boolean, default: false },
    
    // GST & Tax
    enableGST: { type: Boolean, default: true },
    defaultTaxMode: { type: String, default: "Exclusive" },
    taxInclusivePricing: { type: Boolean, default: false },
    
    // Payment
    defaultPaymentMode: { type: String, default: "Cash" },
    showPaymentStatus: { type: Boolean, default: true },
    showBalanceDue: { type: Boolean, default: true },
    
    // Bank & UPI
    bankName: { type: String, default: "" },
    accountHolder: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    branch: { type: String, default: "" },
    upiId: { type: String, default: "" },
    showBankDetails: { type: Boolean, default: false },
    showUPIQR: { type: Boolean, default: false },
    
    // Footer & Terms
    invoiceFooter: { type: String, default: "Thank you for your business!" },
    customerNotes: { type: String, default: "" },
    termsAndConditions: { type: String, default: "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged on overdue payments." },
    signatureUrl: { type: String, default: "" },
    showSignature: { type: Boolean, default: false },
    
    // Appearance
    template: { type: String, default: "Classic" }, 
    primaryColor: { type: String, default: "#2563eb" },
    paperSize: { type: String, default: "A4" }, 
  },
  { timestamps: true }
);

export default mongoose.model("InvoiceSettings", invoiceSettingsSchema);
