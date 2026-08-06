import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
=======
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
>>>>>>> 767a4931 (Add customer and order management)
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
<<<<<<< HEAD
      trim: true,
=======
>>>>>>> 767a4931 (Add customer and order management)
      default: "",
    },
    phone: {
      type: String,
<<<<<<< HEAD
      trim: true,
=======
>>>>>>> 767a4931 (Add customer and order management)
      default: "",
    },
    email: {
      type: String,
<<<<<<< HEAD
      trim: true,
      lowercase: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
=======
      default: "",
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
>>>>>>> 767a4931 (Add customer and order management)
      default: "",
    },
    gst: {
      type: String,
<<<<<<< HEAD
      trim: true,
      default: "",
    },
=======
      default: "",
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    totalOrderValue: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
>>>>>>> 767a4931 (Add customer and order management)
    balance: {
      type: Number,
      default: 0,
    },
<<<<<<< HEAD
=======
    invoices: {
      type: Number,
      default: 0,
    },
>>>>>>> 767a4931 (Add customer and order management)
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
<<<<<<< HEAD
    invoices: {
      type: Number,
      default: 0,
    },
=======
>>>>>>> 767a4931 (Add customer and order management)
  },
  {
    timestamps: true,
  },
);

<<<<<<< HEAD
=======
// Ensure a customer name is unique per business owner.
customerSchema.index({ ownerId: 1, name: 1 }, { unique: true });

>>>>>>> 767a4931 (Add customer and order management)
export default mongoose.model("Customer", customerSchema);
