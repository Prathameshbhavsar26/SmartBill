import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/productModel.js";
import InvoiceSettings from "../models/InvoiceSettings.js";
import mongoose from "mongoose";

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

    const total = Number(totalOrderValue) || 0;
    const paid = Number(amountPaid) || 0;
    const balanceDue = Math.max(0, total - paid);

    const status = paid <= 0 ? "Due" : paid >= total ? "Paid" : "Partial";

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
                stock: 0,
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
        // Decrement stock for existing product
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
          totalOrderValue: total,
          amountPaid: paid,
          balanceDue,
          paymentMode,
          status,
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

    return res.status(201).json({
      message: "Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    await abortSession();

    // Log the full error (message + stack) so failures are easier to diagnose.
    console.error("CREATE ORDER ERROR:", error.message);
    if (error.stack) console.error(error.stack);

    // Detect duplicate invoice number collisions explicitly.
    if (error && error.code === 11000) {
      console.error(
        "Duplicate invoice number collision detected:",
        error.keyValue
      );
    }

    return res.status(500).json({
      message: error.message || "Failed to create order.",
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
