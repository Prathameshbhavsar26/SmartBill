import BusinessSettings from "../models/BusinessSettings.js";

// GET /api/settings/business
export const getBusinessSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let business = await BusinessSettings.findOne({ userId });

    // If no business settings exist yet, create empty/default settings
    if (!business) {
      business = await BusinessSettings.create({
        userId,
        businessName: "",
        ownerName: "",
        phone: "",
        email: "",
        businessType: "Retail",
        financialYear: "April",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      });
    }

    return res.status(200).json({
      message: "Business settings retrieved successfully.",
      businessSettings: business,
    });
  } catch (error) {
    console.error("GET BUSINESS SETTINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to retrieve business information.",
    });
  }
};

// PUT /api/settings/business
export const updateBusinessSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const {
      businessName,
      ownerName,
      phone,
      email,
      businessType,
      financialYear,
      address,
      city,
      state,
      pincode,
      country,
    } = req.body;

    const business = await BusinessSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          businessName: businessName ?? "",
          ownerName: ownerName ?? "",
          phone: phone ?? "",
          email: email ?? "",
          businessType: businessType ?? "Retail",
          financialYear: financialYear ?? "April",
          address: address ?? "",
          city: city ?? "",
          state: state ?? "",
          pincode: pincode ?? "",
          country: country ?? "",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Business information saved successfully.",
      businessSettings: business,
    });
  } catch (error) {
    console.error("UPDATE BUSINESS SETTINGS ERROR:", error);

    return res.status(400).json({
      message:
        error.message || "Failed to save business information.",
    });
  }
};

export default {
  getBusinessSettings,
  updateBusinessSettings,
};