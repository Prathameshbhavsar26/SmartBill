import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

// ================= LIST PURCHASES =================
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ message: "OK", purchases });
  } catch (error) {
    console.error("GET PURCHASES ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch purchases." });
  }
};

// ================= GET SINGLE PURCHASE =================
export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).lean();

    if (!purchase) {
      return res.status(404).json({ message: "Purchase record not found." });
    }

    return res.status(200).json({ message: "OK", purchase });
  } catch (error) {
    console.error("GET PURCHASE ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch purchase details." });
  }
};

// ================= CREATE PURCHASE =================
export const createPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      supplierName,
      supplierInvoiceNo = "",
      purchaseOrderNo = "",
      purchaseDate,
      dueDate,
      items = [],
      subtotal = 0,
      gstTotal = 0,
      discountTotal = 0,
      totalAmount = 0,
      paymentStatus = "Unpaid",
      paymentMethod = "Cash",
      amountPaid = 0,
      remainingAmount = 0,
      notes = "",
    } = req.body;

    // 1. Validations
    if (!supplierName || !String(supplierName).trim()) {
      return res.status(400).json({ message: "Supplier name is required." });
    }

    if (!purchaseDate) {
      return res.status(400).json({ message: "Purchase date is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one product item is required." });
    }

    const validatedItems = [];
    for (const item of items) {
      const pName = String(item.productName || item.product || "").trim();
      const qty = Number(item.quantity || item.qty) || 0;
      const rate = Number(item.purchaseRate || item.rate) || 0;
      const gstR = Number(item.gstRate ?? item.gst) || 0;
      const disc = Number(item.discount) || 0;

      if (!pName) {
        return res.status(400).json({ message: "Product name is required for all item rows." });
      }
      if (qty <= 0) {
        return res.status(400).json({ message: `Quantity for product "${pName}" must be greater than 0.` });
      }
      if (rate < 0) {
        return res.status(400).json({ message: `Purchase rate for "${pName}" cannot be negative.` });
      }
      if (disc < 0 || disc > qty * rate) {
        return res.status(400).json({ message: `Discount for "${pName}" cannot exceed the item amount.` });
      }

      const itemAmount = qty * rate - disc;
      const gstAmount = itemAmount * (gstR / 100);

      validatedItems.push({
        productId: item.productId || item.id || null,
        productName: pName,
        quantity: qty,
        unit: item.unit || "pcs",
        purchaseRate: rate,
        gstRate: gstR,
        gstAmount,
        discount: disc,
        itemAmount,
      });
    }

    const numTotal = Number(totalAmount) || 0;
    const numPaid = Number(amountPaid) || 0;

    if (numPaid < 0) {
      return res.status(400).json({ message: "Amount paid cannot be negative." });
    }
    if (numPaid > numTotal) {
      return res.status(400).json({ message: "Amount paid cannot exceed total purchase amount." });
    }

    let finalPaid = 0;
    let finalRemaining = numTotal;

    if (paymentStatus === "Paid") {
      finalPaid = numTotal;
      finalRemaining = 0;
    } else if (paymentStatus === "Partially Paid") {
      finalPaid = numPaid;
      finalRemaining = Math.max(0, numTotal - numPaid);
    } else {
      finalPaid = 0;
      finalRemaining = numTotal;
    }

    // 2. Create Purchase Record
    const newPurchase = await Purchase.create({
      ownerId: req.user._id,
      supplierId: supplierId || null,
      supplierName: String(supplierName).trim(),
      supplierInvoiceNo: String(supplierInvoiceNo).trim(),
      purchaseOrderNo: String(purchaseOrderNo).trim(),
      purchaseDate: new Date(purchaseDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      items: validatedItems,
      subtotal: Number(subtotal) || 0,
      gstTotal: Number(gstTotal) || 0,
      discountTotal: Number(discountTotal) || 0,
      totalAmount: numTotal,
      paymentStatus,
      paymentMethod: ["Paid", "Partially Paid"].includes(paymentStatus) ? paymentMethod : "Cash",
      amountPaid: finalPaid,
      remainingAmount: finalRemaining,
      notes: String(notes).trim(),
    });

    // 3. Inventory Integration: Increment stock for purchased products
    for (const item of validatedItems) {
      let product = null;
      if (item.productId) {
        product = await Product.findOne({ _id: item.productId, ownerId: req.user._id });
      }
      if (!product) {
        product = await Product.findOne({ name: item.productName, ownerId: req.user._id });
      }

      if (product) {
        product.stock = (Number(product.stock) || 0) + item.quantity;
        if (item.purchaseRate > 0) {
          product.cost = item.purchaseRate;
        }
        await product.save();
      }
    }

    // 4. Supplier Balance Integration: Increase supplier payable balance by remaining unpaid amount
    let supplierDoc = null;
    if (supplierId) {
      supplierDoc = await Supplier.findOne({ _id: supplierId, ownerId: req.user._id });
    }
    if (!supplierDoc) {
      supplierDoc = await Supplier.findOne({ name: String(supplierName).trim(), ownerId: req.user._id });
    }

    if (supplierDoc) {
      supplierDoc.balance = (Number(supplierDoc.balance) || 0) + finalRemaining;
      await supplierDoc.save();
    }

    return res.status(201).json({
      message: "Purchase saved successfully",
      purchase: newPurchase,
    });
  } catch (error) {
    console.error("CREATE PURCHASE ERROR:", error.message);
    return res.status(500).json({ message: error.message || "Failed to save purchase." });
  }
};
