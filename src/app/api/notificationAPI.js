import axiosClient from "./axiosClient";

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
  const token = localStorage.getItem("smartbill_token") || "";
  const rawBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
  const url = `${rawBase}/notifications/stream?token=${encodeURIComponent(token)}`;
  return url;
};
