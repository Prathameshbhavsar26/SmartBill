import axiosClient from "./axiosClient";

export const adminAPI = {
  /**
   * Fetch all registered business owner records for SuperAdmin
   */
  getAllBusinesses: async () => {
    const res = await axiosClient.get("/admin/businesses");
    return res.data;
  },

  /**
   * Update status (Active / Suspended) and suspension reason for a business owner
   */
  updateBusinessStatus: async (businessId, status, reason = "") => {
    const res = await axiosClient.put(`/admin/businesses/${businessId}/status`, {
      status,
      reason,
    });
    return res.data;
  },

  /**
   * Fetch SuperAdmin System Settings from MongoDB
   */
  getSystemSettings: async () => {
    const res = await axiosClient.get("/admin/businesses/settings/system");
    return res.data;
  },

  /**
   * Update SuperAdmin System Settings in MongoDB
   */
  updateSystemSettings: async (settingsData) => {
    const res = await axiosClient.put(
      "/admin/businesses/settings/system",
      settingsData
    );
    return res.data;
  },
};

export default adminAPI;
