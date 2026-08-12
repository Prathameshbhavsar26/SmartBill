import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
    },

    supplier: {
      type: String,
      default: "",
    },

    cost: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    gst: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    minStock: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      default: "Piece",
    },

    status: {
      type: String,
      default: "Active",
    },

    // Add this field
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  {
    timestamps: true,
  }
);


const Product = mongoose.model("Product", productSchema);


export default Product;