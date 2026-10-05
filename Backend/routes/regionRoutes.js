import express from "express";
import { protect } from "../middleware/mid.js";
import {
  getRegions,
  createRegion,
  updateRegion,
  deleteRegion,
  getRegionData,
  assignEntityRegion,
} from "../controller/regionController.js";

const router = express.Router();

// GET /api/admin/regions - Fetch all regions with summary stats
router.get("/", protect, getRegions);

// GET /api/admin/regions/data - Fetch region-wise businesses and vendors (fast query)
router.get("/data", protect, getRegionData);

// POST /api/admin/regions - Create new region
router.post("/", protect, createRegion);

// POST /api/admin/regions/assign - Assign region to a business or vendor
router.post("/assign", protect, assignEntityRegion);

// PUT /api/admin/regions/:id - Update existing region
router.put("/:id", protect, updateRegion);

// DELETE /api/admin/regions/:id - Delete region
router.delete("/:id", protect, deleteRegion);

export default router;
