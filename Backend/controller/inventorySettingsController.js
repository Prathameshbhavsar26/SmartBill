import InventorySettings from "../models/InventorySettings.js";
import { syncRealtimeAlerts, broadcastToOwner } from "../services/notificationService.js";

export const getInventorySettings = async (req, res) => {
  try {
    const ownerId = req.user.ownerId || req.user._id;
    let settings = await InventorySettings.findOne({ userId: ownerId }).lean();
    if (!settings) {
      settings = await InventorySettings.create({ userId: ownerId });
    }
    return res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error("GET INVENTORY SETTINGS ERROR:", err.message);
    return res.status(500).json({ message: "Failed to fetch inventory settings." });
  }
};

export const updateInventorySettings = async (req, res) => {
  try {
    const ownerId = req.user.ownerId || req.user._id;
    const settings = await InventorySettings.findOneAndUpdate(
      { userId: ownerId },
      { $set: req.body },
      { new: true, upsert: true }
    );

    // Synchronize and broadcast low stock alerts with new threshold in real-time
    await syncRealtimeAlerts(ownerId);

    // Broadcast inventory settings update to all live tabs
    broadcastToOwner(ownerId, {
      type: "INVENTORY_SETTINGS_UPDATED",
      settings,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Inventory settings updated successfully.",
      settings,
    });
  } catch (err) {
    console.error("UPDATE INVENTORY SETTINGS ERROR:", err.message);
    return res.status(500).json({ message: "Failed to update inventory settings." });
  }
};
