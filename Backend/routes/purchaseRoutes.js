import express from "express";

import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  markPurchaseAsPaid,
} from "../controller/purchaseController.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Get all purchases
router.get("/", getPurchases);

// Get single purchase
router.get("/:id", getPurchaseById);

// Create purchase
router.post("/", createPurchase);

// Mark an unpaid/partially paid purchase as fully paid
router.put("/:id/mark-paid", markPurchaseAsPaid);

export default router;