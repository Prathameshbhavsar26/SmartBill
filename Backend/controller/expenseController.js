import Expense from "../models/Expense.js";
import { createNotification } from "../services/notificationService.js";

// ================= CREATE EXPENSE =================

export const createExpense = async (req, res) => {
  try {
    const {
      category,
      description,
      amount,
      date,
      paymentMode,
      reference,
      status,
    } = req.body;

    // Make sure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Validate description
    if (!description || !String(description).trim()) {
      return res.status(400).json({
        message: "Description is required.",
        field: "description",
      });
    }

    // Validate amount
    const amountNumber = Number(amount);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0.",
        field: "amount",
      });
    }

    // Create expense for the logged-in user
    const created = await Expense.create({
      user: req.user.id,

      category: String(category || "Other").trim(),

      description: String(description).trim(),

      amount: amountNumber,

      date: date || new Date(),

      paymentMode: String(paymentMode || "Cash").trim(),

      reference: String(reference ?? "").trim(),

      status: status === "Pending" ? "Pending" : "Paid",
    });

    // Return clean expense object
    const expense = {
      id: created._id.toString(),
      category: created.category,
      description: created.description,
      amount: created.amount,
      date: created.date,
      paymentMode: created.paymentMode,
      reference: created.reference,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    try {
      const ownerId = req.user._id || req.user.id || req.user.ownerId;
      await createNotification({
        ownerId,
        userId: req.user.actualUserId || req.user._id || req.user.id,
        title: "Expense Logged",
        message: `Expense of ₹${amountNumber.toLocaleString("en-IN")} logged under '${created.category}'.`,
        type: "info",
        category: "expense",
        link: "expenses",
        metadata: {
          expenseId: created._id,
          amount: amountNumber,
          category: created.category,
        },
      });
    } catch (notifErr) {
      console.error("Expense notification error:", notifErr.message);
    }

    return res.status(201).json({
      message: "Expense created successfully.",
      expense,
    });
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);

    return res.status(500).json({
      message: "Unable to create expense. Please try again.",
    });
  }
};

// ================= LIST EXPENSES =================

export const listExpenses = async (req, res) => {
  try {
    // Make sure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // IMPORTANT:
    // Only fetch expenses belonging to the logged-in user.
    const expenses = await Expense.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    const mapped = expenses.map((e) => ({
      id: e._id.toString(),
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: e.date,
      paymentMode: e.paymentMode,
      reference: e.reference,
      status: e.status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return res.status(200).json({
      expenses: mapped,
    });
  } catch (error) {
    console.error("LIST EXPENSES ERROR:", error);

    return res.status(500).json({
      message: "Unable to load expenses. Please try again.",
    });
  }
};