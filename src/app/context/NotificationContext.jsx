import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import {
  getNotifications as fetchNotificationsAPI,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
  deleteNotification as apiDeleteNotification,
  clearAllNotifications as apiClearAll,
  getNotificationStreamUrl,
} from "../api/notificationAPI";

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  connected: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearAllNotifications: async () => {},
  refresh: async () => {},
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export function NotificationProvider({ children, onNav }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch initial notifications from database
  const refresh = useCallback(async () => {
    const token = localStorage.getItem("smartbill_token");
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await fetchNotificationsAPI();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount ?? res.notifications.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.warn("[Notifications] Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const res = await apiMarkAsRead(id);
      if (res && typeof res.unreadCount === "number") {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error("[Notifications] markAsRead error:", err);
      refresh();
    }
  }, [refresh]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      await apiMarkAllAsRead();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("[Notifications] markAllAsRead error:", err);
      refresh();
    }
  }, [refresh]);

  // Delete single notification
  const deleteNotification = useCallback(async (id) => {
    try {
      setNotifications((prev) =>
        prev.filter((n) => n._id !== id && n.id !== id)
      );

      const res = await apiDeleteNotification(id);
      if (res && typeof res.unreadCount === "number") {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error("[Notifications] deleteNotification error:", err);
      refresh();
    }
  }, [refresh]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);

      await apiClearAll();
      toast.success("All notifications cleared");
    } catch (err) {
      console.error("[Notifications] clearAllNotifications error:", err);
      refresh();
    }
  }, [refresh]);

  // Connect to real-time SSE stream
  useEffect(() => {
    let isSubscribed = true;

    const connectSSE = () => {
      const token = localStorage.getItem("smartbill_token");
      if (!token) {
        setConnected(false);
        return;
      }

      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (_) {}
      }

      try {
        const streamUrl = getNotificationStreamUrl();
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onopen = () => {
          if (!isSubscribed) return;
          setConnected(true);
        };

        es.onmessage = (event) => {
          if (!isSubscribed || !event.data) return;

          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case "CONNECTED":
                setConnected(true);
                if (typeof data.unreadCount === "number") {
                  setUnreadCount(data.unreadCount);
                }
                break;

              case "NEW_NOTIFICATION": {
                const newNotif = data.notification;
                if (!newNotif) break;

                // Prepend new notification to live state
                setNotifications((prev) => {
                  const exists = prev.some(
                    (item) =>
                      (item._id && item._id === newNotif._id) ||
                      (item.id && item.id === newNotif._id)
                  );
                  if (exists) return prev;
                  return [newNotif, ...prev];
                });

                if (typeof data.unreadCount === "number") {
                  setUnreadCount(data.unreadCount);
                } else {
                  setUnreadCount((prev) => prev + 1);
                }

                // Trigger real-time interactive toast alert
                const toastFn =
                  newNotif.type === "error"
                    ? toast.error
                    : newNotif.type === "warning"
                    ? toast.warning
                    : newNotif.type === "success"
                    ? toast.success
                    : toast.info;

                toastFn(newNotif.title, {
                  description: newNotif.message,
                  duration: 5000,
                  action:
                    newNotif.link && onNav
                      ? {
                          label: "View",
                          onClick: () => onNav(newNotif.link),
                        }
                      : undefined,
                });
                break;
              }

              case "NOTIFICATION_READ":
                setNotifications((prev) =>
                  prev.map((n) =>
                    n._id === data.notificationId || n.id === data.notificationId
                      ? { ...n, read: true }
                      : n
                  )
                );
                if (typeof data.unreadCount === "number") {
                  setUnreadCount(data.unreadCount);
                }
                break;

              case "ALL_READ":
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                );
                setUnreadCount(0);
                break;

              case "NOTIFICATION_DELETED":
                setNotifications((prev) =>
                  prev.filter(
                    (n) =>
                      n._id !== data.notificationId && n.id !== data.notificationId
                  )
                );
                if (typeof data.unreadCount === "number") {
                  setUnreadCount(data.unreadCount);
                }
                break;

              case "ALL_CLEARED":
                setNotifications([]);
                setUnreadCount(0);
                break;

              case "UNREAD_COUNT_UPDATED":
                if (typeof data.unreadCount === "number") {
                  setUnreadCount(data.unreadCount);
                }
                break;

              default:
                break;
            }
          } catch (parseErr) {
            console.debug("[SSE] parse warning:", parseErr.message);
          }
        };

        es.onerror = () => {
          if (!isSubscribed) return;
          setConnected(false);
          try {
            es.close();
          } catch (_) {}

          // Attempt reconnection after 5 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isSubscribed) connectSSE();
          }, 5000);
        };
      } catch (err) {
        console.error("[SSE] Connection setup error:", err.message);
        setConnected(false);
      }
    };

    refresh();
    connectSSE();

    const handleAuthChange = () => {
      refresh();
      connectSSE();
    };

    window.addEventListener("userUpdated", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (_) {}
      }
      window.removeEventListener("userUpdated", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refresh, onNav]);

  const value = {
    notifications,
    unreadCount,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
