import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  processOrderReturn,
} from "../controller/orderController.js";
import { protect } from "../middleware/mid.js";
import { checkInvoiceLimit } from "../middleware/checkPlanLimits.js";

const router = express.Router();

// All order routes require authentication.
router.use(protect);

router.post("/", checkInvoiceLimit, createOrder);
router.post("/return", processOrderReturn);
router.get("/", getOrders);
router.get("/:id", getOrder);

export default router;
