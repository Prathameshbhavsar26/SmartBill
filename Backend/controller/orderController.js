import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

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

    // Generate a unique invoice number.
    const count = await Order.countDocuments({ ownerId: req.user._id });
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

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

    return res.status(201).json({
      message: "Order created successfully.",
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("CREATE ORDER ERROR:", error.message);
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
