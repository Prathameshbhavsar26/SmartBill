import PartySettings from "../models/PartySettings.js";

// GET /api/settings/party
export const getPartySettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let partySettings = await PartySettings.findOne({ userId });

    if (!partySettings) {
      partySettings = await PartySettings.create({
        userId,
        enableGrouping: true,
        trackBalance: false,
        shippingAddress: true,
      });
    }

    return res.status(200).json({
      message: "Party settings retrieved successfully.",
      partySettings,
    });
  } catch (error) {
    console.error("GET PARTY SETTINGS ERROR:", error);
    return res.status(500).json({
      message: "Failed to retrieve party settings.",
    });
  }
};

// PUT /api/settings/party
export const updatePartySettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const { enableGrouping, trackBalance, shippingAddress } = req.body;

    const partySettings = await PartySettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          enableGrouping: enableGrouping ?? true,
          trackBalance: trackBalance ?? false,
          shippingAddress: shippingAddress ?? true,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Party settings saved successfully.",
      partySettings,
    });
  } catch (error) {
    console.error("UPDATE PARTY SETTINGS ERROR:", error);
    return res.status(400).json({
      message: error.message || "Failed to save party settings.",
    });
  }
};

export default {
  getPartySettings,
  updatePartySettings,
};
