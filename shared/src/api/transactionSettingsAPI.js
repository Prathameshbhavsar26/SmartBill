import axiosClient from "./axiosClient";

/**
 * Fetch transaction settings for the logged-in user.
 */
export const fetchTransactionSettings = () =>
  axiosClient.get("/settings/transaction").then((res) => res.data);

/**
 * Save/update transaction settings.
 */
export const saveTransactionSettings = (payload) =>
  axiosClient.put("/settings/transaction", payload).then((res) => res.data);


