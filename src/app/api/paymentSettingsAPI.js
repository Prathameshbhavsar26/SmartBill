import axiosClient from "./axiosClient";

/**
 * Fetch payment method settings for the logged-in user.
 */
export const fetchPaymentSettings = () =>
  axiosClient.get("/settings/payment").then((res) => res.data);

/**
 * Save/update payment method settings.
 */
export const savePaymentSettings = (payload) =>
  axiosClient.put("/settings/payment", payload).then((res) => res.data);

export default {
  fetchPaymentSettings,
  savePaymentSettings,
};
