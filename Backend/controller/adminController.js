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

    // Aggregate revenue per owner from Order collection using totalOrderValue
    const revenueByOwner = await Order.aggregate([
      {
        $group: {
          _id: "$ownerId",
          totalRevenue: { $sum: "$totalOrderValue" },
        },
      },
    ]);

    const revenueMap = new Map(
      revenueByOwner.map((item) => [String(item._id), Number(item.totalRevenue) || 0])
    );

    // Aggregate employee count per owner
    const employeeCounts = await User.aggregate([
      { $match: { ownerId: { $ne: null } } },
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]);

    const employeeMap = new Map(
      employeeCounts.map((item) => [String(item._id), Number(item.count) || 0])
    );

    // Map each owner to business card format with employee count and revenue
    const businessList = owners.map((owner) => {
      const ownerIdStr = owner._id.toString();
      const employeeCount = employeeMap.get(ownerIdStr) || 0;
      const revenue = revenueMap.get(ownerIdStr) || 0;

      const rawPlan = owner.subscription?.plan || "starter";
      const formattedPlan =
        rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1);

      return {
        _id: owner._id,
        id: ownerIdStr,
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
    });

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
