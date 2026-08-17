import express from "express";
import { protect } from "../middleware/mid.js";

import {
  getTransactionSettings,
  updateTransactionSettings,
} from "../controller/transactionSettingsController.js";

const router = express.Router();

// All transaction settings routes require login
router.use(protect);

// GET /api/settings/transaction
router.get("/", getTransactionSettings);

// PUT /api/settings/transaction
router.put("/", updateTransactionSettings);

export default router;