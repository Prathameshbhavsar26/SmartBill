import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    accentColor: {
      type: String,
      default: "#3b82f6",
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid hex color code!`,
      },
    },
    sidebarStyle: {
      type: String,
      enum: ["expanded", "compact", "auto"],
      default: "expanded",
    },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large", "xlarge"],
      default: "medium",
    },
    language: {
      type: String,
      enum: ["English", "Hindi", "Marathi"],
      default: "English",
    },
    dateFormat: {
      type: String,
      enum: ["DD-MM-YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "YYYY-MM-DD"],
      default: "DD-MM-YYYY",
    },
    timeFormat: {
      type: String,
      enum: ["12-hour", "24-hour"],
      default: "24-hour",
    },
    numberFormat: {
      type: String,
      enum: ["Indian", "International"],
      default: "Indian",
    },
    currency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Customization", customizationSchema);
