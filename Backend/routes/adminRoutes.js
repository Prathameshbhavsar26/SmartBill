import express from "express";
import { protect } from "../middleware/mid.js";
import {
  getAllBusinesses,
  updateBusinessStatus,
} from "../controller/adminController.js";

const router = express.Router();

// GET /api/admin/businesses - Fetch all owner accounts (SuperAdmin only)
router.get("/", protect, getAllBusinesses);

// PUT /api/admin/businesses/:id/status - Update business status (SuperAdmin only)
router.put("/:id/status", protect, updateBusinessStatus);

export default router;
