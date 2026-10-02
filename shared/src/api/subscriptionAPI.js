import axios from "axios";
import axiosClient, { resolveApiBaseUrl } from "./axiosClient";

const PUBLIC_API_BASE_URL = resolveApiBaseUrl();

export const FALLBACK_SUBSCRIPTION_PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 999,
    billingCycle: "monthly",
    maxUsers: 2,
    maxInvoicesPerMonth: 500,
    maxCustomers: 500,
    maxProducts: 500,
    features: {
      basicReports: true,
      advancedReports: false,
      gstReports: false,
      expenses: true,
      purchaseManagement: true,
      inventory: true,
      paymentTracking: true,
      paymentHistory: false,
      advancedPaymentHistory: false,
      invoiceCustomization: true,
      advancedInvoiceCustomization: false,
      unlimitedInvoiceCustomization: false,
      stockAlerts: true,
      advancedStockAlerts: false,
      enhancedStockMonitoring: false,
      dataExport: false,
    },
    status: "active",
  },
  {
    key: "pro",
    name: "Pro",
    price: 2499,
    billingCycle: "monthly",
    maxUsers: 10,
    maxInvoicesPerMonth: null,
    maxCustomers: 5000,
    maxProducts: 5000,
    features: {
      basicReports: true,
      advancedReports: true,
      gstReports: true,
      expenses: true,
      purchaseManagement: true,
      inventory: true,
      paymentTracking: true,
      paymentHistory: true,
      advancedPaymentHistory: false,
      invoiceCustomization: true,
      advancedInvoiceCustomization: true,
      unlimitedInvoiceCustomization: false,
      stockAlerts: true,
      advancedStockAlerts: true,
      enhancedStockMonitoring: false,
      dataExport: true,
    },
    status: "active",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 6999,
    billingCycle: "monthly",
    maxUsers: null,
    maxInvoicesPerMonth: null,
    maxCustomers: null,
    maxProducts: null,
    features: {
      basicReports: true,
      advancedReports: true,
      gstReports: true,
      expenses: true,
      purchaseManagement: true,
      inventory: true,
      paymentTracking: true,
      paymentHistory: true,
      advancedPaymentHistory: true,
      invoiceCustomization: true,
      advancedInvoiceCustomization: true,
      unlimitedInvoiceCustomization: true,
      stockAlerts: true,
      advancedStockAlerts: true,
      enhancedStockMonitoring: true,
      dataExport: true,
    },
    status: "active",
  },
];

const publicAxios = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 6000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const subscriptionAPI = {
  getPublicPlans: async () => {
    try {
      const response = await publicAxios.get("/subscription-plans", {
        params: {
          _t: Date.now(),
        },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        timeout: 6000,
      });

      if (
        response?.data?.success &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        return response.data;
      }

      return {
        success: true,
        count: FALLBACK_SUBSCRIPTION_PLANS.length,
        data: FALLBACK_SUBSCRIPTION_PLANS,
      };
    } catch (err) {
      // Gracefully fall back to local subscription plans on timeout or server wake-up delay
      return {
        success: true,
        count: FALLBACK_SUBSCRIPTION_PLANS.length,
        data: FALLBACK_SUBSCRIPTION_PLANS,
      };
    }
  },

  /** Get prorated upgrade/downgrade pricing preview with optional coupon discount */
  getUpgradePreview: (newPlan, couponCode = "") => {
    const params = new URLSearchParams();
    if (newPlan) params.set("newPlan", newPlan);
    if (couponCode && String(couponCode).trim()) params.set("couponCode", String(couponCode).trim());
    return axiosClient
      .get(`/subscriptions/upgrade-preview?${params.toString()}`)
      .then((res) => res.data);
  },

  /** Create a Razorpay order. Pass isUpgrade + proratedAmount + couponCode for discounts. */
  createOrder: (planName, options = {}) => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("smartbill_token") : null;
    return publicAxios
      .post(
        "/subscriptions/create-order",
        { planName, ...options },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )
      .then((res) => res.data);
  },

  /** Verify Razorpay payment and activate/schedule plan */
  verifyPayment: (payload) => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("smartbill_token") : null;
    return publicAxios
      .post("/subscriptions/verify-payment", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => res.data);
  },

  /** Get current subscription status, usage and plan details */
  getSubscriptionStatus: () =>
    axiosClient.get("/subscriptions/status").then((res) => res.data),
};

export default subscriptionAPI;
