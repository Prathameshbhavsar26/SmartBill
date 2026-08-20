import express from "express";
import { protect } from "../middleware/mid.js";
import {
  getPaymentSettings,
  updatePaymentSettings,
} from "../controller/paymentSettingsController.js";

const router = express.Router();

router.get("/", protect, getPaymentSettings);
router.put("/", protect, updatePaymentSettings);

export default router;
