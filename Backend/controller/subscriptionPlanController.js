import SubscriptionPlan from "../models/SubscriptionPlan.js";

/**
 * GET /api/admin/subscription-plans
 * Get all subscription plans.
 * SuperAdmin only.
 */
export const getSubscriptionPlans = async (req, res) => {
  try {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        message: "Forbidden: SuperAdmin access required.",
      });
    }

    const plans = await SubscriptionPlan.find()
      .sort({ price: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error("GET SUBSCRIPTION PLANS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch subscription plans.",
    });
  }
};

/**
 * POST /api/admin/subscription-plans
 * Create a new subscription plan.
 * SuperAdmin only.
 */
export const createSubscriptionPlan = async (req, res) => {
  try {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        message: "Forbidden: SuperAdmin access required.",
      });
    }

    const {
      key,
      name,
      price,
      billingCycle,
      maxBusinesses,
      maxUsers,
      maxInvoicesPerMonth,
      features,
      status,
    } = req.body;

    if (!key || !name || price === undefined) {
      return res.status(400).json({
        message: "Plan key, name and price are required.",
      });
    }

    const normalizedKey = String(key).toLowerCase().trim();

    const existingPlan = await SubscriptionPlan.findOne({
      key: normalizedKey,
    });

    if (existingPlan) {
      return res.status(409).json({
        message: "A subscription plan with this key already exists.",
      });
    }

    const plan = await SubscriptionPlan.create({
      key: normalizedKey,
      name: String(name).trim(),
      price,
      billingCycle: billingCycle || "monthly",
      maxBusinesses,
      maxUsers,
      maxInvoicesPerMonth,
      features,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully.",
      data: plan,
    });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION PLAN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to create subscription plan.",
    });
  }
};

/**
 * PUT /api/admin/subscription-plans/:id
 * Update an existing subscription plan.
 * SuperAdmin only.
 */
export const updateSubscriptionPlan = async (req, res) => {
  try {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        message: "Forbidden: SuperAdmin access required.",
      });
    }

    const { id } = req.params;

    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found.",
      });
    }

    const allowedFields = [
      "name",
      "price",
      "billingCycle",
      "maxBusinesses",
      "maxUsers",
      "maxInvoicesPerMonth",
      "features",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        plan[field] = req.body[field];
      }
    });

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully.",
      data: plan,
    });
  } catch (error) {
    console.error("UPDATE SUBSCRIPTION PLAN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to update subscription plan.",
    });
  }
};

/**
 * DELETE /api/admin/subscription-plans/:id
 * Delete a subscription plan.
 * SuperAdmin only.
 */
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        message: "Forbidden: SuperAdmin access required.",
      });
    }

    const { id } = req.params;

    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found.",
      });
    }

    // Do not allow deletion of plans currently used by users.
    const User = (await import("../models/User.js")).default;

    const usersUsingPlan = await User.countDocuments({
      "subscription.plan": plan.key,
    });

    if (usersUsingPlan > 0) {
      return res.status(400).json({
        message: `Cannot delete this plan because ${usersUsingPlan} user(s) are currently subscribed to it.`,
      });
    }

    await SubscriptionPlan.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE SUBSCRIPTION PLAN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete subscription plan.",
    });
  }
};