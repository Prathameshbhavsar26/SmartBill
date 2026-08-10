import Product from "../models/productModel.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      userId: req.user._id,
    });

    // Save product to MongoDB
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

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