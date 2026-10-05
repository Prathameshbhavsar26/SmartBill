import Region from "../models/Region.js";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";
import mongoose from "mongoose";

const INTERNAL_ADMIN_ROLES = ["superadmin", "admin", "support", "billing", "super_admin", "support_admin", "billing_admin"];
const EMPLOYEE_ROLES = ["cashier", "manager", "accountant", "sales"];

/**
 * Returns clean match query for Business Owners (excluding internal admins and employee sub-accounts)
 */
const getBusinessQuery = (additionalFilters = null) => {
  const baseMatch = {
    $and: [
      { role: { $nin: INTERNAL_ADMIN_ROLES } },
      {
        $or: [
          { role: "owner" },
          { ownerId: null },
          { ownerId: { $exists: false } },
        ],
      },
    ],
  };

  if (!additionalFilters || Object.keys(additionalFilters).length === 0) {
    return baseMatch;
  }

  return {
    $and: [baseMatch, additionalFilters],
  };
};

/**
 * Synchronous state-to-region matcher using preloaded active regions.
 * Matches State string against Region.states array, Region.name, or Region.code (case-insensitive).
 */
const matchRegionByStateSync = (stateName, regions = []) => {
  if (!stateName || typeof stateName !== "string" || !stateName.trim()) {
    return null;
  }
  const cleanState = stateName.trim().toLowerCase();

  for (const reg of regions) {
    if (Array.isArray(reg.states)) {
      const stateMatch = reg.states.some(
        (s) => s && String(s).trim().toLowerCase() === cleanState
      );
      if (stateMatch) return reg;
    }
    if (reg.name && String(reg.name).trim().toLowerCase() === cleanState) {
      return reg;
    }
    if (reg.code && String(reg.code).trim().toLowerCase() === cleanState) {
      return reg;
    }
  }
  return null;
};

/**
 * GET /api/admin/regions
 * Fetch all regions with fast aggregated business & vendor counts.
 * Uses unified Region configuration system for both Businesses (User) and Vendors (Supplier)
 * determined independently from each entity's own State field.
 */
export const getRegions = async (req, res) => {
  try {
    const ownerMatch = getBusinessQuery();

    const [regions, rawBusinesses, rawVendors] = await Promise.all([
      Region.find({}).sort({ createdAt: -1 }).lean(),
      User.find(ownerMatch).select("state region regionId regionAssignmentType").lean(),
      Supplier.find({}).select("state region regionId regionAssignmentType").lean(),
    ]);

    const activeRegions = regions.filter((r) => r.status === "Active");

    // Resolve Business Owner counts dynamically (auto-assigned by State vs manual override)
    const bMap = new Map();
    let unassignedBusinesses = 0;

    rawBusinesses.forEach((b) => {
      let resolvedCode = b.region || "";
      let resolvedId = b.regionId ? String(b.regionId) : "";

      if (b.regionAssignmentType !== "manual") {
        const matched = matchRegionByStateSync(b.state, activeRegions);
        if (matched) {
          resolvedCode = matched.code;
          resolvedId = String(matched._id);
        } else {
          resolvedCode = "";
          resolvedId = "";
        }
      }

      if (!resolvedCode && !resolvedId) {
        unassignedBusinesses++;
      } else {
        if (resolvedId) bMap.set(resolvedId, (bMap.get(resolvedId) || 0) + 1);
        if (resolvedCode && resolvedCode !== resolvedId) {
          bMap.set(resolvedCode, (bMap.get(resolvedCode) || 0) + 1);
        }
      }
    });

    // Resolve Vendor counts dynamically (auto-assigned by Vendor State independently)
    const vMap = new Map();
    let unassignedVendors = 0;

    rawVendors.forEach((v) => {
      let resolvedCode = v.region || "";
      let resolvedId = v.regionId ? String(v.regionId) : "";

      if (v.regionAssignmentType !== "manual") {
        const matched = matchRegionByStateSync(v.state, activeRegions);
        if (matched) {
          resolvedCode = matched.code;
          resolvedId = String(matched._id);
        } else {
          resolvedCode = "";
          resolvedId = "";
        }
      }

      if (!resolvedCode && !resolvedId) {
        unassignedVendors++;
      } else {
        if (resolvedId) vMap.set(resolvedId, (vMap.get(resolvedId) || 0) + 1);
        if (resolvedCode && resolvedCode !== resolvedId) {
          vMap.set(resolvedCode, (vMap.get(resolvedCode) || 0) + 1);
        }
      }
    });

    const enrichedRegions = regions.map((reg) => {
      const regIdStr = String(reg._id);
      const regCodeStr = String(reg.code);
      const bCountByVal = Math.max(bMap.get(regIdStr) || 0, bMap.get(regCodeStr) || 0);
      const vCountByVal = Math.max(vMap.get(regIdStr) || 0, vMap.get(regCodeStr) || 0);
      return {
        ...reg,
        businessCount: bCountByVal,
        vendorCount: vCountByVal,
        totalEntities: bCountByVal + vCountByVal,
      };
    });

    const totalBusinesses = rawBusinesses.length;
    const totalVendors = rawVendors.length;

    return res.status(200).json({
      success: true,
      regions: enrichedRegions,
      summary: {
        totalRegions: enrichedRegions.length,
        activeRegions: activeRegions.length,
        totalBusinesses,
        totalVendors,
        unassignedBusinesses,
        unassignedVendors,
      },
    });
  } catch (error) {
    console.error("[getRegions Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch regions",
    });
  }
};

/**
 * POST /api/admin/regions
 * Create a new region
 */
export const createRegion = async (req, res) => {
  try {
    const { name, code, country, states, cities, currency, taxSettings, status, notes } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Region name and region code are required.",
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const existing = await Region.findOne({ code: cleanCode }).lean();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Region with code '${cleanCode}' already exists.`,
      });
    }

    const region = await Region.create({
      name: String(name).trim(),
      code: cleanCode,
      country: country ? String(country).trim() : "India",
      states: Array.isArray(states) ? states.map((s) => String(s).trim()) : [],
      cities: Array.isArray(cities) ? cities.map((c) => String(c).trim()) : [],
      currency: currency || { code: "INR", symbol: "₹", position: "before" },
      taxSettings: taxSettings || { taxType: "GST", taxLabel: "GSTIN", defaultTaxRate: 18 },
      status: status === "Inactive" ? "Inactive" : "Active",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Region created successfully.",
      region,
    });
  } catch (error) {
    console.error("[createRegion Error]", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Region code already exists. Please use a unique region code.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create region",
    });
  }
};

/**
 * PUT /api/admin/regions/:id
 * Update an existing region
 */
export const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, country, states, cities, currency, taxSettings, status, notes } = req.body;

    const region = await Region.findById(id);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Region not found.",
      });
    }

    if (code && String(code).trim().toUpperCase() !== region.code) {
      const cleanCode = String(code).trim().toUpperCase();
      const existing = await Region.findOne({ code: cleanCode, _id: { $ne: id } }).lean();
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Region code '${cleanCode}' is already in use by another region.`,
        });
      }
      region.code = cleanCode;
    }

    if (name) region.name = String(name).trim();
    if (country !== undefined) region.country = String(country).trim();
    if (Array.isArray(states)) region.states = states.map((s) => String(s).trim());
    if (Array.isArray(cities)) region.cities = cities.map((c) => String(c).trim());
    if (currency) region.currency = { ...region.currency, ...currency };
    if (taxSettings) region.taxSettings = { ...region.taxSettings, ...taxSettings };
    if (status) region.status = status;
    if (notes !== undefined) region.notes = notes;

    await region.save();

    return res.status(200).json({
      success: true,
      message: "Region updated successfully.",
      region,
    });
  } catch (error) {
    console.error("[updateRegion Error]", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Region code already exists. Please use a unique region code.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update region",
    });
  }
};

/**
 * DELETE /api/admin/regions/:id
 * Delete a region
 */
export const deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const region = await Region.findById(id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Region not found.",
      });
    }

    // Unassign entities linked to this region
    await Promise.all([
      User.updateMany({ regionId: id }, { $set: { regionId: null, region: "", regionAssignmentType: "automatic" } }),
      Supplier.updateMany({ regionId: id }, { $set: { regionId: null, region: "", regionAssignmentType: "automatic" } }),
      Region.findByIdAndDelete(id),
    ]);

    return res.status(200).json({
      success: true,
      message: "Region deleted successfully and unassigned from entities.",
    });
  } catch (error) {
    console.error("[deleteRegion Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete region",
    });
  }
};

/**
 * GET /api/admin/regions/data
 * Unified query to fetch Region-wise Businesses and Vendors under the same Region configuration system.
 * Automatically maps Business and Vendor regions independently from each entity's own State field,
 * while allowing SuperAdmin manual override.
 */
export const getRegionData = async (req, res) => {
  try {
    const {
      regionId,
      regionCode,
      entityType = "all",
      search = "",
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(10, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [activeRegions, targetRegion] = await Promise.all([
      Region.find({ status: "Active" }).lean(),
      regionId && mongoose.Types.ObjectId.isValid(regionId)
        ? Region.findById(regionId).lean()
        : regionCode && regionCode !== "all" && regionCode !== "unassigned"
        ? Region.findOne({ code: String(regionCode).toUpperCase() }).lean()
        : Promise.resolve(null),
    ]);

    // Build base business query
    let businessQuery = getBusinessQuery();
    if (search && String(search).trim() !== "") {
      const searchRegex = new RegExp(String(search).trim(), "i");
      businessQuery = getBusinessQuery({
        $or: [
          { businessName: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { city: searchRegex },
          { state: searchRegex },
          { gstin: searchRegex },
        ],
      });
    }

    // Build base vendor query
    let vendorMatch = {};
    if (search && String(search).trim() !== "") {
      const searchRegex = new RegExp(String(search).trim(), "i");
      vendorMatch = {
        $or: [
          { name: searchRegex },
          { contact: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { city: searchRegex },
          { state: searchRegex },
          { gst: searchRegex },
        ],
      };
    }

    const fetchBusinesses = entityType === "all" || entityType === "business" || entityType === "businesses";
    const fetchVendors = entityType === "all" || entityType === "vendor" || entityType === "vendors";

    const [rawBusinesses, rawVendors] = await Promise.all([
      fetchBusinesses
        ? User.find(businessQuery)
            .select("firstName lastName businessName email phone city state country gstin status region regionId regionAssignmentType createdAt")
            .sort({ createdAt: -1 })
            .lean()
        : Promise.resolve([]),
      fetchVendors
        ? Supplier.find(vendorMatch)
            .select("name contact email phone city state address gst status region regionId regionAssignmentType ownerId createdAt")
            .sort({ createdAt: -1 })
            .lean()
        : Promise.resolve([]),
    ]);

    // Format & normalize Business Owners with automatic State-to-Region resolution + manual override
    let formattedBusinesses = rawBusinesses.map((b) => {
      let effectiveRegId = b.regionId || null;
      let effectiveRegCode = b.region || "";
      const assignmentType = b.regionAssignmentType || "automatic";

      if (assignmentType !== "manual") {
        const matched = matchRegionByStateSync(b.state, activeRegions);
        if (matched) {
          effectiveRegId = matched._id;
          effectiveRegCode = matched.code;
        } else {
          effectiveRegId = null;
          effectiveRegCode = "";
        }
      }

      return {
        id: String(b._id),
        _id: b._id,
        entityType: "Business",
        name: b.businessName || `${b.firstName || ""} ${b.lastName || ""}`.trim() || "Unnamed Business",
        contactPerson: `${b.firstName || ""} ${b.lastName || ""}`.trim(),
        email: b.email || "",
        phone: b.phone || "",
        city: b.city || "",
        state: b.state || "",
        country: b.country || "India",
        region: effectiveRegCode || "Unassigned",
        regionId: effectiveRegId,
        regionAssignmentType: assignmentType,
        taxId: b.gstin || "",
        status: b.status || "Active",
        createdAt: b.createdAt,
      };
    });

    // Format & normalize Vendors with automatic State-to-Region resolution + manual override
    let formattedVendors = rawVendors.map((v) => {
      let effectiveRegId = v.regionId || null;
      let effectiveRegCode = v.region || "";
      const assignmentType = v.regionAssignmentType || "automatic";

      if (assignmentType !== "manual") {
        const matched = matchRegionByStateSync(v.state, activeRegions);
        if (matched) {
          effectiveRegId = matched._id;
          effectiveRegCode = matched.code;
        } else {
          effectiveRegId = null;
          effectiveRegCode = "";
        }
      }

      return {
        id: String(v._id),
        _id: v._id,
        entityType: "Vendor",
        name: v.name || "Unnamed Vendor",
        contactPerson: v.contact || "",
        email: v.email || "",
        phone: v.phone || "",
        city: v.city || "",
        state: v.state || "",
        country: "India",
        region: effectiveRegCode || "Unassigned",
        regionId: effectiveRegId,
        regionAssignmentType: assignmentType,
        taxId: v.gst || "",
        status: v.status || "Active",
        createdAt: v.createdAt,
      };
    });

    // Apply Region Code filtering for Businesses & Vendors (after auto state resolution)
    if (regionCode === "unassigned") {
      formattedBusinesses = formattedBusinesses.filter((b) => !b.regionId && b.region === "Unassigned");
      formattedVendors = formattedVendors.filter((v) => !v.regionId && v.region === "Unassigned");
    } else if (targetRegion) {
      const targetCodeUpper = String(targetRegion.code).toUpperCase();
      const targetIdStr = String(targetRegion._id);

      formattedBusinesses = formattedBusinesses.filter((b) => {
        if (b.regionId && String(b.regionId) === targetIdStr) return true;
        if (b.region && String(b.region).toUpperCase() === targetCodeUpper) return true;
        return false;
      });

      formattedVendors = formattedVendors.filter((v) => {
        if (v.regionId && String(v.regionId) === targetIdStr) return true;
        if (v.region && String(v.region).toUpperCase() === targetCodeUpper) return true;
        return false;
      });
    }

    let combined = [...formattedBusinesses, ...formattedVendors];

    // Safe sort comparator preventing NaN corruption from missing createdAt
    combined.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const totalCount = combined.length;
    const paginatedItems = combined.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      data: paginatedItems,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum) || 1,
        businessCount: formattedBusinesses.length,
        vendorCount: formattedVendors.length,
      },
    });
  } catch (error) {
    console.error("[getRegionData Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch region data",
    });
  }
};

/**
 * POST /api/admin/regions/assign
 * Fast assignment of Region to a Business or Vendor.
 * Sets regionAssignmentType = "manual" to override automatic state matching.
 */
export const assignEntityRegion = async (req, res) => {
  try {
    const { entityId, entityType, regionId, regionCode } = req.body;

    if (!entityId || !entityType) {
      return res.status(400).json({
        success: false,
        message: "Entity ID and entity type (Business or Vendor) are required.",
      });
    }

    let targetRegion = null;
    if (regionId && mongoose.Types.ObjectId.isValid(regionId)) {
      targetRegion = await Region.findById(regionId).lean();
    } else if (regionCode && regionCode !== "unassigned") {
      targetRegion = await Region.findOne({ code: String(regionCode).toUpperCase() }).lean();
    }

    const regIdToSet = targetRegion ? targetRegion._id : null;
    const regCodeToSet = targetRegion ? targetRegion.code : "";

    if (entityType === "Business") {
      const user = await User.findById(entityId);
      if (!user) return res.status(404).json({ success: false, message: "Business not found." });

      // Mark assignment as manual override
      user.regionAssignmentType = "manual";
      user.regionId = regIdToSet;
      user.region = regCodeToSet;
      await user.save();
    } else if (entityType === "Vendor") {
      const supplier = await Supplier.findById(entityId);
      if (!supplier) return res.status(404).json({ success: false, message: "Vendor not found." });

      // Mark assignment as manual override
      supplier.regionAssignmentType = "manual";
      supplier.regionId = regIdToSet;
      supplier.region = regCodeToSet;
      await supplier.save();
    } else {
      return res.status(400).json({ success: false, message: "Invalid entity type." });
    }

    return res.status(200).json({
      success: true,
      message: `Region successfully assigned to ${entityType}.`,
      regionCode: regCodeToSet,
      assignmentType: "manual",
    });
  } catch (error) {
    console.error("[assignEntityRegion Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign region",
    });
  }
};
