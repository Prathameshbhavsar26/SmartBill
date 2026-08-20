import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["warning", "error", "success", "info"],
      default: "info",
    },
    category: {
      type: String,
      enum: [
        "stock",
        "sale",
        "payment",
        "subscription",
        "expense",
        "purchase",
        "customer",
        "system",
      ],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by owner sorted by newest first
notificationSchema.index({ ownerId: 1, createdAt: -1 });
notificationSchema.index({ ownerId: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
