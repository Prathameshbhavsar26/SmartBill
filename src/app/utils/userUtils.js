/**
 * Fields that are known to be large (base64 images, embedded document arrays, etc.)
 * and should NOT be persisted in localStorage to avoid quota errors.
 */
const LARGE_USER_FIELDS = [
  "logoUrl",
  "signatureUrl",
  "products",
  "customers",
  "orders",
  "invoices",
  "purchases",
  "expenses",
  "inventory",
  "notifications",
  "auditLogs",
  "transactions",
];

/**
 * Return a lean copy of the user object safe for localStorage.
 * Strips any fields whose serialised value exceeds ~50 KB or which are
 * known to be large (see LARGE_USER_FIELDS).
 *
 * @param {object} user - Full user object from API
 * @returns {object} - Trimmed copy suitable for localStorage
 */
export const safeUserForStorage = (user) => {
  if (!user || typeof user !== "object") return user;

  const clone = { ...user };

  // Remove known large fields
  for (const field of LARGE_USER_FIELDS) {
    delete clone[field];
  }

  // Safety net: remove any remaining field whose serialised size exceeds 50 KB
  const MAX_FIELD_BYTES = 50 * 1024;
  for (const key of Object.keys(clone)) {
    try {
      const serialised = JSON.stringify(clone[key]);
      if (serialised && serialised.length > MAX_FIELD_BYTES) {
        delete clone[key];
      }
    } catch {
      delete clone[key];
    }
  }

  return clone;
};

/**
 * Persist user to localStorage using only safe/essential fields.
 * Gracefully handles quota errors by attempting a minimal fallback.
 *
 * @param {object} user - User object to store
 */
export const setUserToStorage = (user) => {
  const lean = safeUserForStorage(user);
  try {
    localStorage.setItem("smartbill_user", JSON.stringify(lean));
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      // Last resort: store only the absolute minimum identity fields
      const minimal = {
        _id: lean._id,
        id: lean.id,
        role: lean.role,
        email: lean.email,
        firstName: lean.firstName,
        lastName: lean.lastName,
        businessName: lean.businessName,
        subscription: lean.subscription,
        plan: lean.plan,
      };
      try {
        localStorage.setItem("smartbill_user", JSON.stringify(minimal));
      } catch {
        console.error("localStorage quota exceeded even with minimal user data.");
      }
    } else {
      throw e;
    }
  }
};

/**
 * Get displayable name for a logged in user object.
 * Priority: First + Last Name > Name > Business Name > Email prefix > Fallback.
 */
export const getUserDisplayName = (user) => {
  if (!user) return "Admin User";
  const nameFromParts = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (nameFromParts) return nameFromParts;
  if (user.name && user.name.trim()) return user.name.trim();
  if (user.businessName && user.businessName.trim()) return user.businessName.trim();
  if (user.email && user.email.trim()) {
    const prefix = user.email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "Admin User";
};

/**
 * Extract up to 2 uppercase initials from a user's display name.
 */
export const getUserInitials = (name) => {
  if (!name || !name.trim()) return "AU";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0].toUpperCase();
};
