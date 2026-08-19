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

    wholesalePrice: {
      type: Number,
      default: 0,
    },

    minPrice: {
      type: Number,
      default: 0,
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

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;