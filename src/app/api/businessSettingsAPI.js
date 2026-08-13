import axiosClient from "./axiosClient";

/**
 * Fetch business profile for the logged-in user.
 */
export const fetchBusinessSettings = () =>
  axiosClient.get("/settings/business").then((res) => res.data);

/**
 * Save/update business profile.
 */
export const saveBusinessSettings = (payload) =>
  axiosClient.put("/settings/business", payload).then((res) => res.data);