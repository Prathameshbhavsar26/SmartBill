import axiosClient, { resolveApiBaseUrl } from "./axiosClient";

/**
 * Fetch all notifications for the authenticated user and their business.
 */
export const getNotifications = async () => {
  const response = await axiosClient.get("/notifications");
  return response.data;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationAsRead = async (id) => {
  const response = await axiosClient.put(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead = async () => {
  const response = await axiosClient.put("/notifications/read-all");
  return response.data;
};

/**
 * Delete a single notification.
 */
export const deleteNotification = async (id) => {
  const response = await axiosClient.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Clear all notifications for the current user.
 */
export const clearAllNotifications = async () => {
  const response = await axiosClient.delete("/notifications/clear-all");
  return response.data;
};

/**
 * Resolves the absolute URL for the Server-Sent Events real-time stream.
 */
export const getNotificationStreamUrl = () => {
  const token = (typeof localStorage !== "undefined" ? localStorage.getItem("smartbill_token") : "") || "";
  let rawBase = resolveApiBaseUrl().replace(/\/+$/, "");

  // If relative path (e.g. /api), resolve against current window origin
  if (rawBase.startsWith("/") && typeof window !== "undefined" && window.location) {
    rawBase = `${window.location.origin}${rawBase}`;
  }

  const url = `${rawBase}/notifications/stream?token=${encodeURIComponent(token)}`;
  return url;
};
