import mongoose from "mongoose";

const partySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    enableGrouping: {
      type: Boolean,
      default: true,
    },
    trackBalance: {
      type: Boolean,
      default: false,
    },
    shippingAddress: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PartySettings ||
  mongoose.model("PartySettings", partySettingsSchema);
