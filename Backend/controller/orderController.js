import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
import { sendInvoiceEmail } from "../services/emailService.js";

// ================= HELPERS =================
// Generate a collision-safe invoice number for the given owner.
// Keeps retrying with the next sequential number whenever the previous
// candidate collides with an existing (unique) invoice number.
const generateInvoiceNo = async (ownerId) => {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({ ownerId });
  let candidate = count + 1;
  let invoiceNo = `INV-${year}-${String(candidate).padStart(4, "0")}`;

  // Guard against rapid/duplicate creation races on the unique index.
  for (let attempt = 0; attempt < 20; attempt++) {
    const existing = await Order.exists({ invoiceNo });
    if (!existing) return invoiceNo;
    candidate += 1;
    invoiceNo = `INV-${year}-${String(candidate).padStart(4, "0")}`;
  }

  // Fall back to a timestamp-based suffix to guarantee uniqueness.
  return `INV-${year}-${Date.now()}`;
};

// ================= CREATE ORDER =================
// Creates an order and automatically updates the customer's running totals:
//   totalOrderValue += orderTotal
//   totalPaid        += amountPaid
//   balance          = totalOrderValue - totalPaid
//   invoices         += 1
export const createOrder = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const {
      customerId = null,
      customerName = "Walk-in Customer",
      items = [],
      subtotal = 0,
      gstRate = 0,
      gst = 0,
      totalOrderValue = 0,
      amountPaid = 0,
      paymentMode = "Cash",
    } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Order must contain at least one item." });
    }

    const total = Number(totalOrderValue) || 0;
    const paid = Number(amountPaid) || 0;
    const balanceDue = Math.max(0, total - paid);

    const status = paid <= 0 ? "Due" : paid >= total ? "Paid" : "Partial";

    // Decrease inventory before creating the order. The conditional stock
    // update prevents sales from taking inventory below zero.
    for (const item of items) {
      const quantity = Number(item.qty);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Each item quantity must be a positive whole number.",
        });
      }

      const productIdentifiers = [];
      if (item.sku) {
        productIdentifiers.push({
          sku: String(item.sku).trim().toUpperCase(),
        });
      }
      if (mongoose.isValidObjectId(item.productId)) {
        productIdentifiers.push({ _id: item.productId });
      }

      if (productIdentifiers.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Each item must identify a product by SKU or ID." });
      }

      const ownershipFilter = {
        $or: [{ userId: req.user._id }, { ownerId: req.user._id }],
      };
      const product = await Product.findOne({
        $and: [ownershipFilter, { $or: productIdentifiers }],
      }).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: `Product not found for ${item.sku || item.name || "an order item"}. Refresh products and try again.`,
        });
      }

      if (Number(product.stock || 0) < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${quantity}.`,
        });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, ...ownershipFilter, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, session },
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Stock changed for ${product.name}. Please try again.`,
        });
      }
    }

    // Generate a unique invoice number.
    const invoiceNo = await generateInvoiceNo(req.user._id);

    const order = await Order.create(
      [
        {
          ownerId: req.user._id,
          customerId: customerId || null,
          customerName: customerName || "Walk-in Customer",
          invoiceNo,
          items,
          subtotal: Number(subtotal) || 0,
          gstRate: Number(gstRate) || 0,
          gst: Number(gst) || 0,
          totalOrderValue: total,
          amountPaid: paid,
          balanceDue,
          paymentMode,
          status,
        },
      ],
      { session },
    );

    // Update the customer's running totals atomically.
    if (customerId) {
      const updated = await Customer.findByIdAndUpdate(
        customerId,
        {
          $inc: {
            totalOrderValue: total,
            totalPaid: paid,
            invoices: 1,
          },
        },
        { new: true, session },
      );

      if (!updated) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Customer not found." });
      }

      // Recompute balance from the updated totals.
      updated.balance = updated.totalOrderValue - updated.totalPaid;
      updated.openingBalance = updated.openingBalance || 0;
      await updated.save({ session });

      order[0].customerId = updated._id;
      await order[0].save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Attempt to email the invoice to the customer. This is best-effort and
    // never fails the order — the result is returned so the frontend can show
    // the real email status to the user.
    let emailSent = false;
    let emailMessage = "";
    try {
      // Prefer the customer's saved email; fall back to the email supplied in
      // the request body (e.g. from the POS screen for walk-in customers).
      let customerEmail = "";
      if (customerId) {
        const customer = await Customer.findById(customerId).lean();
        customerEmail = customer?.email || "";
      }
      if (!customerEmail) {
        customerEmail = String(req.body.customerEmail || "").trim();
      }

      const emailResult = await sendInvoiceEmail({
        order: order[0],
        to: customerEmail,
        businessName: req.user.businessName || "SmartBill",
      });
      emailSent = emailResult.success;
      emailMessage = emailResult.message;
    } catch (emailError) {
      emailSent = false;
      emailMessage = emailError.message || "Failed to send invoice email.";
    }

    return res.status(201).json({
      message: "Order created successfully.",
      order: order[0],
      emailSent,
      emailMessage,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Log the full error (message + stack) so failures are easier to diagnose.
    console.error("CREATE ORDER ERROR:", error.message);
    if (error.stack) console.error(error.stack);

    // Detect duplicate invoice number collisions explicitly.
    if (error && error.code === 11000) {
      console.error(
        "Duplicate invoice number collision detected:",
        error.keyValue,
      );
    }

    return res.status(500).json({ message: "Failed to create order." });
  }
};

// ================= LIST ORDERS =================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ message: "OK", orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
};

// ================= GET SINGLE ORDER =================
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({ message: "OK", order });
  } catch (error) {
    console.error("GET ORDER ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch order." });
  }
};
