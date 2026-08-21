import express from "express";

import {
  getPublicSubscriptionPlans,
} from "../controller/subscriptionPlanController.js";

const router = express.Router();

/*
 * Public endpoint.
 * No authentication required.
 */

router.get(
  "/",
  getPublicSubscriptionPlans
);

export default router;