import express from "express";
import { protect } from "../middleware/mid.js";
import {
  getAllBusinesses,
  updateBusinessStatus,
  getSystemSettings,
  updateSystemSettings,
} from "../controller/adminController.js";

const router = express.Router();

// GET /api/admin/businesses - Fetch all owner accounts (SuperAdmin only)
router.get("/", protect, getAllBusinesses);

// PUT /api/admin/businesses/:id/status - Update business status (SuperAdmin only)
router.put("/:id/status", protect, updateBusinessStatus);

// GET /api/admin/businesses/settings/system - Fetch system settings (SuperAdmin only)
router.get("/settings/system", protect, getSystemSettings);

// PUT /api/admin/businesses/settings/system - Update system settings (SuperAdmin only)
router.put("/settings/system", protect, updateSystemSettings);

export default router;
