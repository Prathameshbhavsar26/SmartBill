import express from "express";
import {
  getAccountingSettings,
  updateAccountingSettings,
} from "../controller/accountingSettingsController.js";
import { authMiddleware as protect } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAccountingSettings)
  .put(protect, updateAccountingSettings);

export default router;
