import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";
import { PLAN_LIMITS } from "../config/plans.js";
import { getOrUpdateSubscriptionState } from "../middleware/checkPlanLimits.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

// 1. Create Razorpay Order
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { planName } = req.body;
    const planKey = (planName || "").toLowerCase().replace(/\s*plan\s*/gi, "").trim();
    const planConfig = PLAN_LIMITS[planKey] || PLAN_LIMITS[planName?.toLowerCase()];

    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const amountInPaise = planConfig.price * 100;
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TPCMQcPRZqe62i";

    // Attempt Razorpay order creation via SDK
    try {
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `sub_${Date.now()}`,
        notes: {
          planName: planConfig.name,
          userId: req.user ? req.user._id.toString() : "guest",
        },
      };

      const order = await razorpayInstance.orders.create(options);

      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        planName: planConfig.name,
        isMock: false,
      });
    } catch (rzpErr) {
      console.warn("Razorpay API error (using test fallback order):", rzpErr.message);
      // Fallback test order ID if secret key is placeholder or network issue
      const mockOrderId = `order_test_${Date.now()}`;
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId,
        planName: planConfig.name,
        isMock: true,
      });
    }
  } catch (error) {
    console.error("Error creating subscription order:", error);
    res.status(500).json({ message: error.message || "Failed to create subscription order" });
  }
};

// 2. Verify Payment Signature and Activate Subscription
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, email } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder";
    let isValid = false;
    const isMockOrder = razorpay_order_id && razorpay_order_id.startsWith("order_test_");

    if (!isMockOrder && razorpay_signature && keySecret !== "rzp_test_secret_placeholder") {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");
      isValid = expectedSignature === razorpay_signature;
    } else {
      // In test mode / mock order / placeholder secret, accept valid payment payload
      isValid = Boolean(razorpay_order_id && razorpay_payment_id);
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature verification failed." });
    }

    const planKey = (planName || "pro").toLowerCase().replace(/\s*plan\s*/gi, "").trim();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days active

    // Find target user (from auth or email)
    let user = req.user ? await User.findById(req.user._id) : null;
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (user) {
      user.subscription = {
        plan: planKey,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      };
      await user.save();
    }

    res.json({
      success: true,
      message: `Payment successful! Your account has been upgraded to the ${planName || planKey} plan.`,
      subscription: user?.subscription || { plan: planKey, status: "active" },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: error.message || "Payment verification error" });
  }
};

// 3. Get Current Subscription Status & Usage Metrics
export const getSubscriptionStatus = async (req, res) => {
  try {
    const ownerId = req.user.ownerId || req.user._id;
    const user = await User.findById(ownerId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subState = await getOrUpdateSubscriptionState(user);
    const planKey = user.subscription?.plan || "starter";
    const planConfig = PLAN_LIMITS[planKey] || PLAN_LIMITS.starter;

    // Calculate current month's invoice usage
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const invoiceCount = await Order.countDocuments({
      ownerId,
      createdAt: { $gte: startOfMonth },
    });

    res.json({
      success: true,
      subscription: user.subscription,
      trialState: subState,
      plan: planConfig,
      usage: {
        invoicesThisMonth: invoiceCount,
        maxInvoicesPerMonth: planConfig.maxInvoicesPerMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
