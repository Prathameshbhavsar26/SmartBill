import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      default: "",
    },

    businessName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
    },

    businessType: {
      type: String,
      default: "Retail",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "owner",
    },

    department: {
      type: String,
      default: "",
    },

    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
