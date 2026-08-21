import express from "express";

import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../controller/subscriptionPlanController.js";

import { protect } from "../middleware/mid.js";

const router = express.Router();

// All subscription plan management routes require authentication.
router.use(protect);

// SuperAdmin-only checks are handled inside the controller.
router.get("/", getSubscriptionPlans);

router.post("/", createSubscriptionPlan);

router.put("/:id", updateSubscriptionPlan);

router.delete("/:id", deleteSubscriptionPlan);

export default router;