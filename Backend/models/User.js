import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    businessName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

phone: {
      type: String,
      required: true,
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
      enum: ["owner", "superadmin"],
      default: "owner",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);