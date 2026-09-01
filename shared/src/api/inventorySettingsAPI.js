import axiosClient from "./axiosClient";

/**
 * Fetch inventory settings for the current business owner.
 */
export const getInventorySettings = async () => {
  const res = await axiosClient.get("/settings/inventory");
  return res.data;
};

/**
 * Update inventory settings for the current business owner.
 */
export const updateInventorySettings = async (data) => {
  const res = await axiosClient.put("/settings/inventory", data);
  return res.data;
};

export default {
  getInventorySettings,
  updateInventorySettings,
};



