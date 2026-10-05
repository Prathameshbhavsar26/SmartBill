import Region from "../models/Region.js";

/**
 * Resolves a matching Region entity for a given State name against active region configurations.
 * Matching order (case-insensitive):
 * 1. Match against Region.states array items (e.g. "Maharashtra")
 * 2. Match against Region.name (e.g. "Maharashtra")
 * 3. Match against Region.code (e.g. "MAHARASHTRA")
 */
export const matchRegionByState = async (stateName, preloadedRegions = null) => {
  if (!stateName || typeof stateName !== "string" || !stateName.trim()) {
    return null;
  }

  const cleanState = stateName.trim().toLowerCase();
  const regions = preloadedRegions || (await Region.find({ status: "Active" }).lean());

  for (const reg of regions) {
    // 1. Check in states array
    if (Array.isArray(reg.states)) {
      const stateMatch = reg.states.some(
        (s) => s && String(s).trim().toLowerCase() === cleanState
      );
      if (stateMatch) return reg;
    }

    // 2. Check region name
    if (reg.name && String(reg.name).trim().toLowerCase() === cleanState) {
      return reg;
    }

    // 3. Check region code
    if (reg.code && String(reg.code).trim().toLowerCase() === cleanState) {
      return reg;
    }
  }

  return null;
};
