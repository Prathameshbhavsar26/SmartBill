import axiosClient from "./axiosClient";

export const adminAPI = {
  /**
   * Fetch all registered business owner records for SuperAdmin
   */
  getAllBusinesses: async (config = {}) => {
    const res = await axiosClient.get("/admin/businesses", config);
    return res.data;
  },

  /**
   * Fetch customer details for a specific business
   */
  getBusinessCustomers: async (businessId) => {
    const res = await axiosClient.get(`/admin/businesses/${businessId}/customers`);
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
   * Grant module permissions & issue secure temporary password for a business owner
   */
  grantBusinessAccess: async (businessId, permissions) => {
    const res = await axiosClient.put(`/admin/businesses/${businessId}/access`, {
      permissions,
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

  /**
   * Fetch SuperAdmin Vendor Settings from MongoDB
   */
  getVendorSettings: async (config = {}) => {
    const res = await axiosClient.get("/admin/businesses/settings/vendor", config);
    return res.data;
  },

  /**
   * Update SuperAdmin Vendor Settings in MongoDB
   */
  updateVendorSettings: async (settingsData) => {
    const res = await axiosClient.put(
      "/admin/businesses/settings/vendor",
      settingsData
    );
    return res.data;
  },

  /**
   * Fetch multi-dimensional real-time revenue analytics across all business owners
   */
  getRevenueAnalytics: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.timeframe) query.append("timeframe", params.timeframe);
    if (params.businessId && params.businessId !== "all") query.append("businessId", params.businessId);

    const url = `/admin/revenue${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await axiosClient.get(url);
    return res.data;
  },

  /**
   * Fetch live KPI dashboard summary stats for SuperAdmin
   */
  getDashboardStats: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.range) query.append("range", params.range);

    const url = `/admin/dashboard-stats${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await axiosClient.get(url);
    return res.data;
  },

  /**
   * Fetch all regions with summary stats
   */
  getRegions: async () => {
    const res = await axiosClient.get("/admin/regions");
    return res.data;
  },

  /**
   * Fetch region-wise businesses & vendors with search and filters
   */
  getRegionData: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.regionId) query.append("regionId", params.regionId);
    if (params.regionCode) query.append("regionCode", params.regionCode);
    if (params.entityType) query.append("entityType", params.entityType);
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const res = await axiosClient.get(`/admin/regions/data?${query.toString()}`);
    return res.data;
  },

  /**
   * Create a new region
   */
  createRegion: async (regionData) => {
    const res = await axiosClient.post("/admin/regions", regionData);
    return res.data;
  },

  /**
   * Update an existing region
   */
  updateRegion: async (id, regionData) => {
    const res = await axiosClient.put(`/admin/regions/${id}`, regionData);
    return res.data;
  },

  /**
   * Delete a region
   */
  deleteRegion: async (id) => {
    const res = await axiosClient.delete(`/admin/regions/${id}`);
    return res.data;
  },

  /**
   * Assign a region to a business or vendor
   */
  assignRegion: async (payload) => {
    const res = await axiosClient.post("/admin/regions/assign", payload);
    return res.data;
  },
};

export default adminAPI;



