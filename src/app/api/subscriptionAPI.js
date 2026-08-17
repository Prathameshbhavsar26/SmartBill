import axiosClient from "./axiosClient";

export const subscriptionAPI = {
  /** Get prorated upgrade/downgrade pricing preview */
  getUpgradePreview: (newPlan) =>
    axiosClient
      .get(`/subscriptions/upgrade-preview?newPlan=${newPlan}`)
      .then((res) => res.data),

  /** Create a Razorpay order. Pass isUpgrade + proratedAmount for mid-cycle changes. */
  createOrder: (planName, options = {}) =>
    axiosClient
      .post("/subscriptions/create-order", { planName, ...options })
      .then((res) => res.data),

  /** Verify Razorpay payment and activate/schedule plan */
  verifyPayment: (payload) =>
    axiosClient
      .post("/subscriptions/verify-payment", payload)
      .then((res) => res.data),

  /** Get current subscription status, usage and plan details */
  getSubscriptionStatus: () =>
    axiosClient.get("/subscriptions/status").then((res) => res.data),
};

export default subscriptionAPI;
