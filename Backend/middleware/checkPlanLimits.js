import Order from "../models/Order.js";
import User from "../models/User.js";
import { PLAN_LIMITS } from "../config/plans.js";

/**
 * Helper to evaluate and update trial/subscription status for a user.
 */
export const getOrUpdateSubscriptionState = async (user) => {
  if (!user || user.role === "superadmin") {
    return { isExpired: false, status: "active", daysLeft: Infinity };
  }

  // Auto-initialize missing subscription for legacy users
  if (!user.subscription || !user.subscription.trialEndsAt) {
    const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
    const trialEndsAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    user.subscription = {
      plan: "starter",
      status: Date.now() > trialEndsAt ? "expired" : "trialing",
      trialEndsAt,
      currentPeriodStart: createdAt,
    };
    await user.save();
  }

  // Active subscription check
  if (user.subscription.status === "active") {
    if (user.subscription.currentPeriodEnd && new Date() > new Date(user.subscription.currentPeriodEnd)) {
      user.subscription.status = "expired";
      await user.save();
      return { isExpired: true, status: "expired", daysLeft: 0 };
    }
    return { isExpired: false, status: "active", daysLeft: Infinity };
  }

  // Trialing check
  const trialEndsAt = new Date(user.subscription.trialEndsAt);
  const now = new Date();

  if (now > trialEndsAt) {
    if (user.subscription.status !== "expired") {
      user.subscription.status = "expired";
      await user.save();
    }
    return { isExpired: true, status: "expired", daysLeft: 0 };
  }

  const diffMs = trialEndsAt - now;
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return { isExpired: false, status: "trialing", daysLeft };
};

// Enforce active trial or valid subscription before critical actions
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const ownerId = req.user.ownerId || req.user._id;
    const user = await User.findById(ownerId);

    const subState = await getOrUpdateSubscriptionState(user);

    if (subState.isExpired) {
      return res.status(403).json({
        message: "Your 14-day free trial has expired. Please purchase a plan to continue using SmartBill.",
        trialExpired: true,
        upgradeRequired: true,
      });
    }

    req.subscriptionState = subState;
    next();
  } catch (error) {
    console.error("Error in requireActiveSubscription middleware:", error);
    next();
  }
};

// Check if user has exceeded monthly invoice limit
export const checkInvoiceLimit = async (req, res, next) => {
  try {
    const ownerId = req.user.ownerId || req.user._id;
    const user = await User.findById(ownerId);

    if (!user) return next();

    const subState = await getOrUpdateSubscriptionState(user);

    if (subState.isExpired) {
      return res.status(403).json({
        message: "Your 14-day free trial has expired. Please purchase a plan to continue.",
        trialExpired: true,
        upgradeRequired: true,
      });
    }

    const planKey = user.subscription?.plan || "starter";
    const planConfig = PLAN_LIMITS[planKey] || PLAN_LIMITS.starter;

    if (planConfig.maxInvoicesPerMonth !== Infinity) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const invoiceCount = await Order.countDocuments({
        ownerId,
        createdAt: { $gte: startOfMonth },
      });

      if (invoiceCount >= planConfig.maxInvoicesPerMonth) {
        return res.status(403).json({
          message: `Monthly invoice limit reached (${planConfig.maxInvoicesPerMonth}). Please upgrade your plan to issue more invoices.`,
          limitReached: true,
          currentPlan: planKey,
        });
      }
    }
    next();
  } catch (error) {
    console.error("Error in checkInvoiceLimit middleware:", error);
    next();
  }
};

// Check if plan includes a specific feature key (e.g. 'gstFiling', 'barcodeScanner', 'advancedReports')
export const requireFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      const ownerId = req.user.ownerId || req.user._id;
      const user = await User.findById(ownerId);

      if (!user) return next();

      const subState = await getOrUpdateSubscriptionState(user);

      if (subState.isExpired) {
        return res.status(403).json({
          message: "Your 14-day free trial has expired. Please purchase a plan to unlock this feature.",
          trialExpired: true,
          upgradeRequired: true,
        });
      }

      const planKey = user.subscription?.plan || "starter";
      const planConfig = PLAN_LIMITS[planKey] || PLAN_LIMITS.starter;

      if (!planConfig.features?.[featureKey]) {
        return res.status(403).json({
          message: `This feature requires a Pro or Enterprise subscription.`,
          featureLocked: true,
          requiredFeature: featureKey,
          currentPlan: planKey,
        });
      }
      next();
    } catch (error) {
      console.error("Error in requireFeature middleware:", error);
      next();
    }
  };
};
