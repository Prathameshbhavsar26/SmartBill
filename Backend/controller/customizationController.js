import Customization from "../models/Customization.js";

const DEFAULT_CUSTOMIZATION = {
  theme: "light",
  accentColor: "#3b82f6",
  sidebarStyle: "expanded",
  fontSize: "medium",
  language: "English",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "24-hour",
  numberFormat: "Indian",
  currency: "INR",
};

/**
 * GET /api/settings/customization
 * Retrieve customization settings for the logged-in user.
 */
export const getCustomization = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let custom = await Customization.findOne({ userId });

    if (!custom) {
      custom = await Customization.create({
        userId,
        ...DEFAULT_CUSTOMIZATION,
      });
    }

    return res.status(200).json({
      message: "Customization retrieved successfully.",
      customization: custom,
    });
  } catch (error) {
    console.error("GET CUSTOMIZATION ERROR:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to retrieve customization settings." });
  }
};

/**
 * PUT /api/settings/customization
 * Update customization settings for the logged-in user.
 */
export const updateCustomization = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      theme,
      accentColor,
      sidebarStyle,
      fontSize,
      language,
      dateFormat,
      timeFormat,
      numberFormat,
      currency,
    } = req.body;

    const payload = {};
    if (theme) payload.theme = theme;
    if (accentColor) payload.accentColor = accentColor;
    if (sidebarStyle) payload.sidebarStyle = sidebarStyle;
    if (fontSize) payload.fontSize = fontSize;
    if (language) payload.language = language;
    if (dateFormat) payload.dateFormat = dateFormat;
    if (timeFormat) payload.timeFormat = timeFormat;
    if (numberFormat) payload.numberFormat = numberFormat;
    if (currency) payload.currency = currency;

    const custom = await Customization.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Customization settings updated successfully.",
      customization: custom,
    });
  } catch (error) {
    console.error("UPDATE CUSTOMIZATION ERROR:", error.message);
    return res.status(400).json({
      message: error.message || "Failed to update customization settings.",
    });
  }
};

/**
 * POST /api/settings/customization/reset
 * Reset customization settings to defaults for the logged-in user.
 */
export const resetCustomization = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const custom = await Customization.findOneAndUpdate(
      { userId },
      { $set: DEFAULT_CUSTOMIZATION },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Customization settings reset to defaults.",
      customization: custom,
    });
  } catch (error) {
    console.error("RESET CUSTOMIZATION ERROR:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to reset customization settings." });
  }
};
