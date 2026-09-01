import axiosClient from "./axiosClient";

/**
 * Fetch customization settings for the authenticated user from Backend API.
 */
export const fetchCustomizationAPI = () =>
  axiosClient.get("/settings/customization").then((res) => res.data);

/**
 * Update customization settings for the authenticated user via Backend API.
 */
export const saveCustomizationAPI = (payload) =>
  axiosClient.put("/settings/customization", payload).then((res) => res.data);

/**
 * Reset customization settings to defaults for the authenticated user via Backend API.
 */
export const resetCustomizationAPI = () =>
  axiosClient.post("/settings/customization/reset").then((res) => res.data);



