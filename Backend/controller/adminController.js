import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * GET /api/admin/businesses
 * Fetch all registered business owner accounts from MongoDB for SuperAdmin view.
 * Excludes passwords and sensitive authentication data.
 */
export const getAllBusinesses = async (req, res) => {
  try {
    // SuperAdmin access control
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        message: "Forbidden: SuperAdmin access required.",
      });
    }

    // Fetch all owners (users with role === 'owner' or top-level accounts excluding superadmins)
    const owners = await User.find({
      $or: [
        { role: "owner" },
        { ownerId: null, role: { $ne: "superadmin" } },
      ],
    })
      .select("-password -passwordResetToken -passwordResetExpires -twoFactorSecret")
      .sort({ createdAt: -1 })
      .lean();

    // Map each owner to business card format with employee count and revenue
    const businessList = await Promise.all(
      owners.map(async (owner) => {
        const employeeCount = await User.countDocuments({ ownerId: owner._id });

        const revAggregation = await Order.aggregate([
          { $match: { ownerId: owner._id } },
          { $group: { _id: null, totalSum: { $sum: "$total" } } },
        ]);

        const revenue = revAggregation[0]?.totalSum || 0;

        const rawPlan = owner.subscription?.plan || "starter";
        const formattedPlan =
          rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);

        return {
          _id: owner._id,
          id: owner._id.toString(),
          name: owner.businessName || `${owner.firstName} ${owner.lastName}'s Business`,
          owner: `${owner.firstName} ${owner.lastName}`.trim(),
          ownerEmail: owner.email,
          ownerPhone: owner.phone || "N/A",
          ownerCity: owner.city || "N/A",
          plan: formattedPlan,
          users: employeeCount + 1, // Owner + employees
          revenue: revenue,
          status: owner.status || "Active",
          suspensionReason: owner.suspensionReason || "",
          joined: owner.createdAt
            ? new Date(owner.createdAt).toISOString().split("T")[0]
            : "N/A",
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: businessList.length,
      data: businessList,
    });
  } catch (error) {
    console.error("GET ALL BUSINESSES ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to retrieve business records.",
    });
  }
};

/**
 * PUT /api/admin/businesses/:id/status
 * Update an owner/business status (Active / Suspended) and suspension reason.
 */
export const updateBusinessStatus = async (req, res) => {
  try {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({
        message: "Forbidden: SuperAdmin access required.",
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["Active", "Suspended", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value. Allowed: Active, Suspended, Inactive.",
      });
    }

    const owner = await User.findById(id);

    if (!owner) {
      return res.status(404).json({
        message: "Business owner account not found.",
      });
    }

    owner.status = status;
    if (status === "Suspended") {
      owner.suspensionReason = String(reason || "").trim();
    } else if (status === "Active") {
      owner.suspensionReason = "";
    }

    await owner.save();

    return res.status(200).json({
      success: true,
      message: `Business status updated to ${status}.`,
      data: {
        id: owner._id,
        status: owner.status,
        suspensionReason: owner.suspensionReason,
      },
    });
  } catch (error) {
    console.error("UPDATE BUSINESS STATUS ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to update business status.",
    });
  }
};
