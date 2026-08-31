import axios from "axios";
import axiosClient from "./axiosClient";

/*
|--------------------------------------------------------------------------
| Public API client
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Do NOT use the authenticated axiosClient for public subscription plans.
|
| After login/register, axiosClient may contain:
| - Authorization headers
| - token interceptors
| - 401 handling
| - redirect/logout logic
|
| The subscription plans endpoint is PUBLIC.
|
*/

const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";


const publicAxios = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});


/*
|--------------------------------------------------------------------------
| Public subscription API
|--------------------------------------------------------------------------
*/

export const subscriptionAPI = {

  /*
  |--------------------------------------------------------------------------
  | Get public subscription plans
  |--------------------------------------------------------------------------
  |
  | This request intentionally does NOT use axiosClient.
  |
  */

  getPublicPlans: async () => {

    const response = await publicAxios.get(
      "/subscription-plans",
      {
        /*
         * Prevent browser/proxy caching.
         *
         * The timestamp also guarantees that every request
         * is treated as a fresh request.
         */
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
  | Authenticated subscription APIs
  |--------------------------------------------------------------------------
  |
  | These continue using the normal axiosClient because
  | they require authentication.
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


  createOrder: (planName, options = {}) =>
    axiosClient
      .post("/subscriptions/create-order", {
        planName,
        ...options,
      })
      .then((res) => res.data),


  verifyPayment: (payload) =>
    axiosClient
      .post("/subscriptions/verify-payment", payload)
      .then((res) => res.data),


  getSubscriptionStatus: () =>
    axiosClient
      .get("/subscriptions/status")
      .then((res) => res.data),
};


export default subscriptionAPI;