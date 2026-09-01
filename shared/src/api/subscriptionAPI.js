import axios from "axios";
import axiosClient from "./axiosClient";

const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

const publicAxios = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const subscriptionAPI = {
  getPublicPlans: async () => {
    const response = await publicAxios.get("/subscription-plans", {
      params: {
        _t: Date.now(),
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return response.data;
  },

  /** Get prorated upgrade/downgrade pricing preview */
  getUpgradePreview: (newPlan) =>
    axiosClient
      .get(`/subscriptions/upgrade-preview?newPlan=${newPlan}`)
      .then((res) => res.data),

  /** Create a Razorpay order. Pass isUpgrade + proratedAmount for mid-cycle changes. */
  createOrder: (planName, options = {}) =>
    publicAxios
      .post("/subscriptions/create-order", { planName, ...options })
      .then((res) => res.data),

  /** Verify Razorpay payment and activate/schedule plan */
  verifyPayment: (payload) =>
    publicAxios
      .post("/subscriptions/verify-payment", payload)
      .then((res) => res.data),

  /** Get current subscription status, usage and plan details */
  getSubscriptionStatus: () =>
    axiosClient.get("/subscriptions/status").then((res) => res.data),
};

export default subscriptionAPI;
