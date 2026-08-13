import express from "express";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
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

router.post("/create-order", optionalAuth, createSubscriptionOrder);
router.post("/verify-payment", optionalAuth, verifySubscriptionPayment);
router.get("/status", authMiddleware, getSubscriptionStatus);

export default router;
