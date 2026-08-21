import express from "express";
import { protect } from "../middleware/mid.js";
import {
  getAllBusinesses,
  updateBusinessStatus,
  getSystemSettings,
  updateSystemSettings,
  getAdminRevenueAnalytics,
  getSuperAdminDashboardStats,
} from "../controller/adminController.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[AdminRouter] ${req.method} ${req.originalUrl} (url: ${req.url})`);
  next();
});

// GET /api/admin/businesses - Fetch all owner accounts (SuperAdmin only)
router.get("/", protect, getAllBusinesses);
router.get("/businesses", protect, getAllBusinesses);

// GET /api/admin/revenue & /api/admin/revenue-analytics - Real-time revenue analytics
router.get("/revenue", protect, getAdminRevenueAnalytics);
router.get("/revenue-analytics", protect, getAdminRevenueAnalytics);

// GET /api/admin/dashboard-stats - Live SuperAdmin dashboard metrics
router.get("/dashboard-stats", protect, getSuperAdminDashboardStats);

// PUT /api/admin/businesses/:id/status - Update business status (SuperAdmin only)
router.put("/businesses/:id/status", protect, updateBusinessStatus);
router.put("/:id/status", protect, updateBusinessStatus);

// GET /api/admin/businesses/settings/system - Fetch system settings (SuperAdmin only)
router.get("/settings/system", protect, getSystemSettings);

// PUT /api/admin/businesses/settings/system - Update system settings (SuperAdmin only)
router.put("/settings/system", protect, updateSystemSettings);

export default router;
