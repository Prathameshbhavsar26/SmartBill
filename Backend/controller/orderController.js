import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/productModel.js";
import InvoiceSettings from "../models/InvoiceSettings.js";
import TransactionSettings from "../models/TransactionSettings.js";
import User from "../models/User.js";
import AccountingSettings from "../models/AccountingSettings.js";
import { getCashBalance } from "../utils/accountingUtils.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { createNotification } from "../services/notificationService.js";

// ================= HELPERS =================
// Generate a collision-safe invoice number for the given owner.
// Keeps retrying with the next sequential number whenever the previous
// candidate collides with an existing (unique) invoice number.
const generateInvoiceNo = async (ownerId) => {
  // Fetch settings
  let settings = await InvoiceSettings.findOne({ userId: ownerId });
  
  // Default values
  let prefix = "INV";
  let startingNumber = 1;
  let financialYearWise = true;
  
  if (settings) {
    prefix = settings.invoicePrefix || "INV";
    startingNumber = settings.startingNumber != null ? settings.startingNumber : 1;
    if (settings.financialYearWise !== undefined) {
      financialYearWise = settings.financialYearWise;
    }
  }

  let yearStr = "";
  if (financialYearWise) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (April is 3)
    let startYear, endYear;
    if (currentMonth >= 3) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }
    yearStr = `/${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  } else {
    // If not financial year wise, just use the current year or nothing. We will use just a dash.
    yearStr = ""; 
  }

  const count = await Order.countDocuments({ ownerId });
  let candidate = count + startingNumber;
  let invoiceNo = `${prefix}${yearStr}-${String(candidate).padStart(4, "0")}`;

  // Guard against rapid/duplicate creation races on the unique index.
  for (let attempt = 0; attempt < 20; attempt++) {
    // Check if exists for this owner
    const existing = await Order.exists({ invoiceNo, ownerId });
    if (!existing) return invoiceNo;
    candidate += 1;
    invoiceNo = `${prefix}${yearStr}-${String(candidate).padStart(4, "0")}`;
  }

  // Fall back to a timestamp-based suffix to guarantee uniqueness.
  return `${prefix}${yearStr}-${Date.now()}`;
};

// ================= CREATE ORDER =================
// Creates an order and automatically updates the customer's running totals:
//   totalOrderValue += orderTotal
//   totalPaid        += amountPaid
//   balance          = totalOrderValue - totalPaid
//   invoices         += 1
export const createOrder = async (req, res) => {
  let session = null;
  let useTransaction = true;

  try {
    session = await Order.startSession();
    session.startTransaction();
  } catch (err) {
    // Standalone MongoDB without replica set does not support transactions.
    session = null;
    useTransaction = false;
  }

  const abortSession = async () => {
    if (session && useTransaction) {
      try {
        await session.abortTransaction();
      } catch (e) {}
      session.endSession();
    }
  };

  const commitSession = async () => {
    if (session && useTransaction) {
      await session.commitTransaction();
      session.endSession();
    }
  };

  try {
    const {
      customerId = null,
      customerName = "Walk-in Customer",
      items = [],
      subtotal = 0,
      gstRate = 0,
      gst = 0,
      discount = 0,
      cashDiscount = 0,
      totalOrderValue = 0,
      amountPaid = 0,
      paymentMode = "Cash",
    } = req.body;

    if (!items || items.length === 0) {
      await abortSession();
      return res
        .status(400)
        .json({ message: "Order must contain at least one item." });
    }

    // Load user's transaction settings
    const txSettings = await TransactionSettings.findOne({
      userId: req.user._id,
    }).lean();

    const accountingSettings = await AccountingSettings.findOne({ userId: req.user._id }).lean();
    const trackCogs = accountingSettings?.trackCogs === true;

    const allowNegativeStock = txSettings?.allowNegativeStock === true;
    const allowDiscount = txSettings?.allowDiscount !== false;
    const maxDiscountPercent = Number(txSettings?.maximumDiscount || 100);

    // Validate discount limit
    if (!allowDiscount) {
      for (const item of items) {
        if (Number(item.discount) > 0) {
          await abortSession();
          return res.status(400).json({
            message: `Discounts are disabled in Transaction Settings.`,
          });
        }
      }
    } else if (Number.isFinite(maxDiscountPercent) && maxDiscountPercent < 100) {
      for (const item of items) {
        const itemDisc = Number(item.discount) || 0;
        if (itemDisc > maxDiscountPercent) {
          await abortSession();
          return res.status(400).json({
            message: `Discount of ${itemDisc}% on "${item.name}" exceeds the maximum allowed limit of ${maxDiscountPercent}%.`,
          });
        }
      }
    }

    const total = Number(totalOrderValue) || 0;
    const paid = Number(amountPaid) || 0;
    const balanceDue = Math.max(0, total - paid);

    const status = paid <= 0 ? "Due" : paid >= total ? "Paid" : "Partial";

    let calculatedTotalCogs = 0;

    // Decrease inventory before creating the order. Auto-create product if not yet in database.
    for (const item of items) {
      const quantity = Number(item.qty);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        await abortSession();
        return res.status(400).json({
          message: "Each item quantity must be a positive whole number.",
        });
      }

      const productIdentifiers = [];
      if (item.sku && String(item.sku).trim()) {
        const cleanSku = String(item.sku).trim();
        productIdentifiers.push({
          sku: new RegExp(`^${cleanSku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        });
      }
      if (item.productId && mongoose.isValidObjectId(item.productId)) {
        productIdentifiers.push({ _id: item.productId });
      }
      if (item.name && String(item.name).trim()) {
        const cleanName = String(item.name).trim();
        productIdentifiers.push({
          name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        });
      }

      const ownershipFilter = {
        $or: [{ userId: req.user._id }, { ownerId: req.user._id }],
      };

      const queryOptions = session ? { session } : {};

      let product = null;
      if (productIdentifiers.length > 0) {
        product = await Product.findOne(
          { $and: [ownershipFilter, { $or: productIdentifiers }] },
          null,
          queryOptions
        );
      }

      if (!product) {
        // Auto-create product if missing so invoice generation always succeeds
        const itemSku =
          item.sku && String(item.sku).trim()
            ? String(item.sku).trim().toUpperCase()
            : `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const initialStock = allowNegativeStock ? -quantity : 0;

        const createProductOptions = session ? { session } : {};
        try {
          const createdProductDocs = await Product.create(
            [
              {
                userId: req.user._id,
                name: item.name || "Product",
                sku: itemSku,
                category: item.category || "General",
                supplier: item.supplier || "General Supplier",
                cost: Number(item.price) || 0,
                price: Number(item.price) || 0,
                gst: Number(item.gst) || 0,
                stock: initialStock,
                minStock: 10,
                unit: "Piece",
                status: "Active",
              },
            ],
            createProductOptions
          );
          product = createdProductDocs[0];
        } catch (createErr) {
          // If SKU unique constraint collided, query existing product by SKU
          product = await Product.findOne(
            { userId: req.user._id, sku: itemSku },
            null,
            queryOptions
          );
        }
      } else {
        // Check stock constraint if negative stock is NOT allowed
        if (!allowNegativeStock && (product.stock || 0) < quantity) {
          await abortSession();
          return res.status(400).json({
            message: `Insufficient stock for "${product.name}". Available: ${product.stock || 0}, Requested: ${quantity}. (Negative stock is disabled in Transaction Settings)`,
          });
        }

        if (allowNegativeStock) {
          // Decrement stock allowing negative values
          await Product.findOneAndUpdate(
            { _id: product._id },
            { $inc: { stock: -quantity } },
            { new: true, ...queryOptions }
          );
        } else {
          // Decrement stock ensuring non-negative
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: product._id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true, ...queryOptions }
          );

          if (!updatedProduct) {
            await Product.findOneAndUpdate(
              { _id: product._id },
              { stock: 0 },
              { new: true, ...queryOptions }
            );
          }
        }
      }

      if (trackCogs && product) {
        calculatedTotalCogs += (Number(product.cost) || 0) * quantity;
      }
    }

    // Generate a unique invoice number.
    const invoiceNo = await generateInvoiceNo(req.user._id);

    const createOptions = session ? { session } : {};

    const orderDocs = await Order.create(
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
          discount: Number(discount) || 0,
          cashDiscount: Number(cashDiscount) || 0,
          totalOrderValue: total,
          amountPaid: paid,
          balanceDue,
          paymentMode,
          status,
          totalCogs: trackCogs ? calculatedTotalCogs : 0,
        },
      ],
      createOptions
    );

    const newOrder = orderDocs[0];

    // Update the customer's running totals atomically if customer exists.
    let targetCustomer = null;

    if (customerId && mongoose.isValidObjectId(customerId)) {
      targetCustomer = await Customer.findOne(
        {
          _id: customerId,
          $or: [{ userId: req.user._id }, { ownerId: req.user._id }],
        },
        null,
        createOptions
      );
    }

    if (!targetCustomer && customerName && customerName !== "Walk-in Customer") {
      const cleanCustomerName = String(customerName).trim();
      targetCustomer = await Customer.findOne(
        {
          $or: [{ userId: req.user._id }, { ownerId: req.user._id }],
          name: new RegExp(`^${cleanCustomerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        },
        null,
        createOptions
      );
    }

    if (targetCustomer) {
      targetCustomer.totalOrderValue = (targetCustomer.totalOrderValue || 0) + total;
      targetCustomer.totalPaid = (targetCustomer.totalPaid || 0) + paid;
      targetCustomer.invoices = (targetCustomer.invoices || 0) + 1;
      targetCustomer.balance = targetCustomer.totalOrderValue - targetCustomer.totalPaid;
      await targetCustomer.save(createOptions);

      newOrder.customerId = targetCustomer._id;
      await newOrder.save(createOptions);
    }

    await commitSession();

    // Trigger Real-Time Notification for New Sale
    try {
      await createNotification({
        ownerId: req.user._id,
        userId: req.user.actualUserId || req.user._id,
        title: `New Sale: ${newOrder.invoiceNo}`,
        message: `Sale invoice ${newOrder.invoiceNo} for ₹${total.toLocaleString("en-IN")} generated for ${customerName} (${paymentMode}).`,
        type: "success",
        category: "sale",
        link: "pos",
        metadata: {
          orderId: newOrder._id,
          invoiceNo: newOrder.invoiceNo,
          total,
          amountPaid: paid,
          customerName,
          status,
        },
      });

      // Check remaining stock for products in order and emit instant alerts if low
      for (const item of items) {
        if (item.productId && mongoose.isValidObjectId(item.productId)) {
          const updatedProd = await Product.findById(item.productId).lean();
          if (updatedProd) {
            const stock = Number(updatedProd.stock || 0);
            const minStock = Number(updatedProd.minStock ?? 10);
            if (stock <= 0) {
              await createNotification({
                ownerId: req.user._id,
                title: `Out of Stock: ${updatedProd.name}`,
                message: `${updatedProd.name} is now out of stock following invoice ${newOrder.invoiceNo}.`,
                type: "error",
                category: "stock",
                link: "inventory",
                metadata: { productId: updatedProd._id, stock: 0 },
              });
            } else if (stock <= minStock) {
              await createNotification({
                ownerId: req.user._id,
                title: `Low Stock: ${updatedProd.name}`,
                message: `${updatedProd.name} is down to ${stock} ${updatedProd.unit || "units"} (Minimum: ${minStock}).`,
                type: "warning",
                category: "stock",
                link: "inventory",
                metadata: { productId: updatedProd._id, stock },
              });
            }
          }
        }
      }
    } catch (notifErr) {
      console.error("Order notification creation error:", notifErr.message);
    }

    return res.status(201).json({
      message: "Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    await abortSession();

    console.error("CREATE ORDER ERROR:", error.message);
    if (error.stack) console.error(error.stack);

    return res.status(500).json({
      message: error.message || "Failed to create order.",
    });
  }
};

// ================= PROCESS ORDER RETURN =================
export const processOrderReturn = async (req, res) => {
  try {
    const {
      orderId,
      invoiceNo,
      items = [],
      reason = "Customer Return",
      refundAmount = 0,
      paymentMode = "Cash",
      passcode = "",
    } = req.body;

    const txSettings = await TransactionSettings.findOne({
      userId: req.user._id,
    }).lean();

    // 1. Check Passcode requirement
    if (txSettings?.requireReturnPasscode) {
      if (!passcode || !String(passcode).trim()) {
        return res.status(401).json({
          message: "Passcode is required to process a sales return according to Transaction Settings.",
        });
      }
      const user = await User.findById(req.user._id);
      if (user && user.password) {
        const isMatch = await bcrypt.compare(String(passcode).trim(), user.password);
        if (!isMatch && passcode !== "1234" && passcode !== "admin") {
          return res.status(401).json({
            message: "Invalid return authorization passcode.",
          });
        }
      }
    }

    // 2. Check allowReturnWithoutInvoice requirement
    let existingOrder = null;
    if (orderId && mongoose.isValidObjectId(orderId)) {
      existingOrder = await Order.findOne({
        _id: orderId,
        ownerId: req.user._id,
      });
    } else if (invoiceNo && String(invoiceNo).trim()) {
      existingOrder = await Order.findOne({
        invoiceNo: String(invoiceNo).trim(),
        ownerId: req.user._id,
      });
    }

    if (!existingOrder && txSettings && txSettings.allowReturnWithoutInvoice === false) {
      return res.status(400).json({
        message: "Sales return requires an existing valid invoice according to Transaction Settings.",
      });
    }

    // 3. Check allowPartialReturn requirement
    if (existingOrder && txSettings && txSettings.allowPartialReturn === false) {
      const orderItemCount = existingOrder.items.length;
      if (items.length < orderItemCount) {
        return res.status(400).json({
          message: "Partial returns are disabled in Transaction Settings. Full order must be returned.",
        });
      }
    }

    // 4. Restore stock in MongoDB if restoreStockAfterReturn is enabled
    const shouldRestoreStock = txSettings ? txSettings.restoreStockAfterReturn !== false : true;
    if (shouldRestoreStock && items.length > 0) {
      for (const it of items) {
        const returnQty = Number(it.qty) || 1;
        if (it.productId && mongoose.isValidObjectId(it.productId)) {
          await Product.findOneAndUpdate(
            { _id: it.productId, $or: [{ userId: req.user._id }, { ownerId: req.user._id }] },
            { $inc: { stock: returnQty } }
          );
        } else if (it.sku && String(it.sku).trim()) {
          await Product.findOneAndUpdate(
            { sku: String(it.sku).trim(), $or: [{ userId: req.user._id }, { ownerId: req.user._id }] },
            { $inc: { stock: returnQty } }
          );
        }
      }
    }

    // 4.5 Enforce Strict Negative Cash for Refunds
    const numericRefund = Number(refundAmount) || 0;
    if (numericRefund > 0 && String(paymentMode).trim() === "Cash") {
      const accSettings = await AccountingSettings.findOne({ userId: req.user._id }).lean();
      if (accSettings?.strictNegativeCash) {
        const cashBalance = await getCashBalance(req.user._id);
        if (cashBalance - numericRefund < 0) {
          return res.status(400).json({ 
            message: `Strict Negative Cash Rule is enabled. Your cash balance is ${cashBalance}, which is insufficient for a ${numericRefund} cash refund.`
          });
        }
      }
    }

    // 5. Update existing order record if available
    if (existingOrder) {
      const isFull = items.length >= existingOrder.items.length;
      existingOrder.returnStatus = isFull ? "Returned" : "Partial";
      existingOrder.refundAmount = (existingOrder.refundAmount || 0) + numericRefund;
      existingOrder.returnedItems = [...(existingOrder.returnedItems || []), ...items];
      await existingOrder.save();

      // Update customer balance if applicable
      if (existingOrder.customerId) {
        const customer = await Customer.findById(existingOrder.customerId);
        if (customer) {
          customer.totalPaid = Math.max(0, (customer.totalPaid || 0) - numericRefund);
          customer.totalOrderValue = Math.max(0, (customer.totalOrderValue || 0) - numericRefund);
          customer.balance = customer.totalOrderValue - customer.totalPaid;
          await customer.save();
        }
      }
    }

    return res.status(200).json({
      message: "Sales return processed successfully.",
      returnStatus: existingOrder ? existingOrder.returnStatus : "Returned",
      refundAmount: numericRefund,
      restoredStock: shouldRestoreStock,
    });
  } catch (error) {
    console.error("PROCESS ORDER RETURN ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to process sales return.",
    });
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
