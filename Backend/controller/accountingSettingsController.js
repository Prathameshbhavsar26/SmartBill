import AccountingSettings from "../models/AccountingSettings.js";

// @desc    Get Accounting Settings
// @route   GET /api/settings/accounting
// @access  Private
export const getAccountingSettings = async (req, res) => {
  try {
    const uId = req.user._id;
    let settings = await AccountingSettings.findOne({
      $or: [{ userId: uId }, { ownerId: uId }],
    });

    if (!settings) {
      try {
        settings = await AccountingSettings.create({
          userId: uId,
        });
      } catch (createErr) {
        if (createErr.code === 11000) {
          settings = await AccountingSettings.findOne({
            $or: [{ userId: uId }, { ownerId: uId }],
          });
        } else {
          throw createErr;
        }
      }
    }

    res.status(200).json(settings || {});
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
    const uId = req.user._id;
    const settings = await AccountingSettings.findOneAndUpdate(
      { $or: [{ userId: uId }, { ownerId: uId }] },
      { ...req.body, userId: uId },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error updating accounting settings:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
