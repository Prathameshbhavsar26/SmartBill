import express from "express";
import {
  streamNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controller/notificationController.js";
import { protect } from "../middleware/mid.js";

const router = express.Router();

// All notification endpoints require authentication
router.use(protect);

// Real-time SSE stream endpoint
router.get("/stream", streamNotifications);

// REST notification management
router.get("/", getNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/clear-all", clearAllNotifications);
router.delete("/:id", deleteNotification);

export default router;
