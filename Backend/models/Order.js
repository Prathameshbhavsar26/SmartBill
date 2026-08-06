import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, default: null },
    name: { type: String, default: "" },
    sku: { type: String, default: "" },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
    discount: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    customerName: {
      type: String,
      default: "Walk-in Customer",
    },
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    gstRate: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    totalOrderValue: {
      type: Number,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      default: "Cash",
    },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Due"],
      default: "Due",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
