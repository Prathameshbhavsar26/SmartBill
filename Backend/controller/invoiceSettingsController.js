import InvoiceSettings from "../models/InvoiceSettings.js";

// @desc    Get invoice settings for user
// @route   GET /api/settings/invoice
// @access  Private
export const getInvoiceSettings = async (req, res) => {
  try {
    let settings = await InvoiceSettings.findOne({ userId: req.user._id });
    
    // Create defaults if they don't exist
    if (!settings) {
      settings = await InvoiceSettings.create({ userId: req.user._id });
    }
    
    res.status(200).json({ settings });
  } catch (error) {
    console.error("GET INVOICE SETTINGS ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch invoice settings." });
  }
};

// @desc    Update invoice settings
// @route   PUT /api/settings/invoice
// @access  Private
export const updateInvoiceSettings = async (req, res) => {
  try {
    const data = req.body;
    
    let settings = await InvoiceSettings.findOne({ userId: req.user._id });
    
    if (settings) {
      // Update existing
      settings = await InvoiceSettings.findOneAndUpdate(
        { userId: req.user._id },
        { $set: data },
        { new: true, runValidators: true }
      );
    } else {
      // Create new with passed data
      settings = await InvoiceSettings.create({
        ...data,
        userId: req.user._id
      });
    }
    
    res.status(200).json({ message: "Invoice settings updated successfully", settings });
  } catch (error) {
    console.error("UPDATE INVOICE SETTINGS ERROR:", error.message);
    res.status(500).json({ message: "Failed to update invoice settings." });
  }
};
