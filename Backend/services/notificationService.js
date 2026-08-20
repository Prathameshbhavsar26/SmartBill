import Notification from "../models/Notification.js";
import Product from "../models/productModel.js";
import User from "../models/User.js";

/**
 * In-memory registry of active Server-Sent Events (SSE) connections.
 * Maps ownerId (string) -> Set of active Express `res` streams.
 */
const sseClients = new Map();

/**
 * Registers an active client connection for real-time Server-Sent Events.
 */
export const registerSSEClient = async (ownerId, req, res) => {
  const ownerKey = String(ownerId);

  // Set SSE response headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Flush headers immediately if supported
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  // Register the response stream in our client map
  if (!sseClients.has(ownerKey)) {
    sseClients.set(ownerKey, new Set());
  }
  sseClients.get(ownerKey).add(res);

  // Run live sync for low stock / trial alerts on initial connection
  try {
    await syncRealtimeAlerts(ownerId);
  } catch (err) {
    console.error("[NotificationService] initial syncRealtimeAlerts error:", err.message);
  }

  // Calculate current unread count
  const unreadCount = await Notification.countDocuments({
    ownerId,
    read: false,
  }).catch(() => 0);

  // Send initial handshake message
  res.write(
    `data: ${JSON.stringify({
      type: "CONNECTED",
      message: "Real-time notification stream active.",
      unreadCount,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Heartbeat ping interval every 25 seconds to keep proxies & browser sockets alive
  const pingInterval = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}\n\n`);
    } catch (_) {
      clearInterval(pingInterval);
    }
  }, 25000);

  // Clean up on client disconnect
  const cleanup = () => {
    clearInterval(pingInterval);
    const clientSet = sseClients.get(ownerKey);
    if (clientSet) {
      clientSet.delete(res);
      if (clientSet.size === 0) {
        sseClients.delete(ownerKey);
      }
    }
  };

  req.on("close", cleanup);
  res.on("finish", cleanup);
  res.on("error", cleanup);
};

/**
 * Broadcasts an SSE payload to all active client streams for the given ownerId.
 */
export const broadcastToOwner = (ownerId, payload) => {
  if (!ownerId) return;
  const ownerKey = String(ownerId);
  const clientSet = sseClients.get(ownerKey);

  if (clientSet && clientSet.size > 0) {
    const dataStr = `data: ${JSON.stringify(payload)}\n\n`;
    for (const clientRes of clientSet) {
      try {
        clientRes.write(dataStr);
      } catch (err) {
        console.warn("[NotificationService] SSE write failed, cleaning up socket:", err.message);
        clientSet.delete(clientRes);
      }
    }
  }
};

/**
 * Broadcasts an updated unread count to all active client tabs.
 */
export const broadcastUnreadCount = async (ownerId) => {
  try {
    if (!ownerId) return;
    const unreadCount = await Notification.countDocuments({
      ownerId,
      read: false,
    });
    broadcastToOwner(ownerId, {
      type: "UNREAD_COUNT_UPDATED",
      unreadCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[NotificationService] broadcastUnreadCount error:", error.message);
  }
};

/**
 * Creates a single persistent notification, stores it in MongoDB,
 * and immediately broadcasts it to all connected SSE clients in real-time.
 */
export const createNotification = async ({
  ownerId,
  userId = null,
  title,
  message,
  type = "info",
  category = "system",
  link = "",
  metadata = {},
}) => {
  try {
    if (!ownerId || !title || !message) return null;

    const notification = await Notification.create({
      ownerId,
      userId: userId || ownerId,
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      category,
      link,
      metadata,
      read: false,
    });

    const unreadCount = await Notification.countDocuments({
      ownerId,
      read: false,
    }).catch(() => 0);

    // Push real-time notification to all active client sessions immediately!
    broadcastToOwner(ownerId, {
      type: "NEW_NOTIFICATION",
      notification: notification.toObject ? notification.toObject() : notification,
      unreadCount,
      timestamp: new Date().toISOString(),
    });

    return notification;
  } catch (error) {
    console.error("[NotificationService] createNotification error:", error.message);
    return null;
  }
};

/**
 * Scans real-time live business data (products, trial status) and generates
 * persistent alerts if not already generated.
 */
export const syncRealtimeAlerts = async (ownerId) => {
  try {
    if (!ownerId) return;

    // 1. Sync Low Stock & Out of Stock Alerts
    const products = await Product.find({
      $or: [{ userId: ownerId }, { ownerId: ownerId }],
      status: { $ne: "Inactive" },
    }).lean();

    // Get all existing unread stock notifications for this owner
    const existingStockNotifs = await Notification.find({
      ownerId,
      category: "stock",
      read: false,
    }).lean();

    const existingProductAlertMap = new Set();
    for (const notif of existingStockNotifs) {
      if (notif.metadata?.productId) {
        existingProductAlertMap.add(notif.metadata.productId.toString());
      }
    }

    for (const prod of products) {
      const stock = Number(prod.stock || 0);
      const minStock = Number(prod.minStock ?? 10);
      const prodIdStr = prod._id.toString();

      if (stock <= 0) {
        if (!existingProductAlertMap.has(prodIdStr)) {
          await createNotification({
            ownerId,
            title: `Out of Stock: ${prod.name}`,
            message: `${prod.name} (SKU: ${prod.sku || "N/A"}) is completely out of stock. Replenish inventory now.`,
            type: "error",
            category: "stock",
            link: "inventory",
            metadata: { productId: prodIdStr, sku: prod.sku, stock: 0 },
          });
          existingProductAlertMap.add(prodIdStr);
        }
      } else if (stock <= minStock) {
        if (!existingProductAlertMap.has(prodIdStr)) {
          await createNotification({
            ownerId,
            title: `Low Stock Alert: ${prod.name}`,
            message: `${prod.name} has only ${stock} ${prod.unit || "units"} remaining (Minimum threshold: ${minStock}).`,
            type: "warning",
            category: "stock",
            link: "inventory",
            metadata: { productId: prodIdStr, sku: prod.sku, stock },
          });
          existingProductAlertMap.add(prodIdStr);
        }
      }
    }

    // 2. Sync Trial / Subscription Expiry Alerts
    const user = await User.findById(ownerId).lean();
    if (user && user.subscriptionStatus === "trial" && user.trialEndsAt) {
      const now = new Date();
      const trialEnds = new Date(user.trialEndsAt);
      const msLeft = trialEnds.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

      if (daysLeft <= 3 && daysLeft >= 0) {
        const existingTrialNotif = await Notification.findOne({
          ownerId,
          category: "subscription",
          read: false,
          "metadata.trialDaysLeft": daysLeft,
        }).lean();

        if (!existingTrialNotif) {
          await createNotification({
            ownerId,
            title: daysLeft === 0 ? "Trial Expires Today" : `Trial Ends in ${daysLeft} Day${daysLeft > 1 ? "s" : ""}`,
            message: `Your SmartBill 14-day free trial will end ${daysLeft === 0 ? "today" : `in ${daysLeft} day(s)`}. Upgrade to retain uninterrupted access.`,
            type: "warning",
            category: "subscription",
            link: "settings",
            metadata: { trialAlert: true, trialDaysLeft: daysLeft },
          });
        }
      }
    }
  } catch (error) {
    console.error("[NotificationService] syncRealtimeAlerts error:", error.message);
  }
};
