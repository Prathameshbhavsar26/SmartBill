import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global_system_settings",
      unique: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    autoBackup: {
      type: Boolean,
      default: true,
    },
    debugMode: {
      type: Boolean,
      default: false,
    },
    backupFrequency: {
      type: String,
      enum: ["hourly", "daily", "weekly", "monthly", "manual", "disabled"],
      default: "daily",
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SystemSettings", systemSettingsSchema);
