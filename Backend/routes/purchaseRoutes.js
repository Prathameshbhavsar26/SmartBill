import express from "express";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
} from "../controller/purchaseController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPurchases);
router.get("/:id", getPurchaseById);
router.post("/", createPurchase);

export default router;
