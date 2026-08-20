import AccountingSettings from "../models/AccountingSettings.js";

// @desc    Get Accounting Settings
// @route   GET /api/settings/accounting
// @access  Private
export const getAccountingSettings = async (req, res) => {
  try {
    let settings = await AccountingSettings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = await AccountingSettings.create({
        userId: req.user._id,
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error getting accounting settings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update Accounting Settings
// @route   PUT /api/settings/accounting
// @access  Private
export const updateAccountingSettings = async (req, res) => {
  try {
    let settings = await AccountingSettings.findOne({ userId: req.user._id });

    if (settings) {
      settings = await AccountingSettings.findOneAndUpdate(
        { userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      settings = await AccountingSettings.create({
        userId: req.user._id,
        ...req.body,
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error updating accounting settings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
