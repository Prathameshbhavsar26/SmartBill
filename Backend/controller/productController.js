import Product from "../models/productModel.js";
import mongoose from "mongoose";
import { createNotification } from "../services/notificationService.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      userId: req.user._id,
    });

    // Save product to MongoDB
    await product.save();

    // Trigger instant stock alert if initially low or out of stock
    try {
      const stock = Number(product.stock || 0);
      const minStock = Number(product.minStock ?? 10);
      if (stock <= 0) {
        await createNotification({
          ownerId: req.user._id,
          title: `Out of Stock: ${product.name}`,
          message: `${product.name} (SKU: ${product.sku || "N/A"}) was added with 0 stock.`,
          type: "error",
          category: "stock",
          link: "inventory",
          metadata: { productId: product._id, stock: 0 },
        });
      } else if (stock <= minStock) {
        await createNotification({
          ownerId: req.user._id,
          title: `Low Stock: ${product.name}`,
          message: `${product.name} has only ${stock} ${product.unit || "units"} remaining (Min threshold: ${minStock}).`,
          type: "warning",
          category: "stock",
          link: "inventory",
          metadata: { productId: product._id, stock },
        });
      }
    } catch (notifErr) {
      console.error("Product notification error:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists.",
        field: "sku",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Products for logged-in user only
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      userId: req.user._id,
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Single Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product belonging to logged-in user
    const product = await Product.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const {
      name,
      sku,
      category,
      supplier,
      cost,
      price,
      gst,
      stock,
      minStock,
      unit,
      status,
    } = req.body;

    if (name !== undefined) product.name = name || product.name;
    if (sku !== undefined) product.sku = sku || product.sku;
    if (category !== undefined) product.category = category || product.category;
    if (supplier !== undefined) product.supplier = supplier || product.supplier;
    if (cost !== undefined) product.cost = Number(cost) || 0;
    if (price !== undefined) product.price = Number(price) || 0;
    if (gst !== undefined) product.gst = Number(gst) || 0;
    if (stock !== undefined) product.stock = Number(stock) || 0;
    if (minStock !== undefined) product.minStock = Number(minStock) || 0;
    if (unit !== undefined) product.unit = unit || product.unit;
    if (status !== undefined) product.status = status || product.status;

    await product.save();

    // Trigger instant alert if updated stock is low or out of stock
    try {
      const stock = Number(product.stock || 0);
      const minStock = Number(product.minStock ?? 10);
      if (stock <= 0) {
        await createNotification({
          ownerId: req.user._id,
          title: `Out of Stock: ${product.name}`,
          message: `${product.name} (SKU: ${product.sku || "N/A"}) stock has dropped to 0.`,
          type: "error",
          category: "stock",
          link: "inventory",
          metadata: { productId: product._id, stock: 0 },
        });
      } else if (stock <= minStock) {
        await createNotification({
          ownerId: req.user._id,
          title: `Low Stock: ${product.name}`,
          message: `${product.name} has only ${stock} ${product.unit || "units"} remaining.`,
          type: "warning",
          category: "stock",
          link: "inventory",
          metadata: { productId: product._id, stock },
        });
      }
    } catch (notifErr) {
      console.error("Product update notification error:", notifErr.message);
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Single Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete only if product belongs to logged-in user
    const product = await Product.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one product for the logged-in user.
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product id." });
    }

    const product = await Product.findOne({ _id: id, userId: req.user._id });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    return res.json({ success: true, product });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
