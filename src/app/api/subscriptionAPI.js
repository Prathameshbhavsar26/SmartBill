import axios from "axios";
import axiosClient from "./axiosClient";

/*
|--------------------------------------------------------------------------
| API URLs
|--------------------------------------------------------------------------
*/

const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Public API client
|--------------------------------------------------------------------------
|
| These APIs must work even when the user is NOT logged in.
|
*/

const publicAxios = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Authenticated API client
|--------------------------------------------------------------------------
|
| Used only for APIs that actually require a logged-in user.
|
*/

/*
|--------------------------------------------------------------------------
| Subscription API
|--------------------------------------------------------------------------
*/

const subscriptionAPI = {

  /*
  |--------------------------------------------------------------------------
  | Get public subscription plans
  |--------------------------------------------------------------------------
  */

  getPublicPlans: async () => {
    const response = await publicAxios.get(
      "/subscription-plans",
      {
        params: {
          _t: Date.now(),
        },

        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | Create Razorpay order
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This is intentionally using publicAxios.
  |
  | The user has NOT registered/logged in yet.
  |
  */

  createOrder: async (planName, options = {}) => {
    const response = await publicAxios.post(
      "/subscriptions/create-order",
      {
        planName,
        ...options,
      }
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | Verify Razorpay payment
  |--------------------------------------------------------------------------
  |
  | Payment verification happens before registration,
  | so this must also not depend on an expired login token.
  |
  */

  verifyPayment: async (payload) => {
    const response = await publicAxios.post(
      "/subscriptions/verify-payment",
      payload
    );

    return response.data;
  },


  /*
  |--------------------------------------------------------------------------
  | Authenticated subscription APIs
  |--------------------------------------------------------------------------
  |
  | These are for already logged-in users.
  |
  */

  getUpgradePreview: (newPlan) =>
    axiosClient
      .get(
        `/subscriptions/upgrade-preview?newPlan=${encodeURIComponent(
          newPlan
        )}`
      )
      .then((res) => res.data),


  getSubscriptionStatus: () =>
    axiosClient
      .get("/subscriptions/status")
      .then((res) => res.data),
};

export default subscriptionAPI;