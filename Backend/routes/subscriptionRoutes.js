import express from "express";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
  getUpgradePreview,
} from "../controller/subscriptionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Optional auth helper middleware: sets req.user if token is present, but doesn't block unauthenticated callers
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authMiddleware(req, res, next);
  }
  next();
};

// Prorated upgrade/downgrade preview (requires auth — reads current plan from user record)
router.get("/upgrade-preview", authMiddleware, getUpgradePreview);

router.post("/create-order", optionalAuth, createSubscriptionOrder);
router.post("/verify-payment", optionalAuth, verifySubscriptionPayment);
router.get("/status", authMiddleware, getSubscriptionStatus);

export default router;
