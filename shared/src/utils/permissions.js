export const MODULE_PERMISSIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "customers", label: "Customers" },
  { key: "suppliers", label: "Suppliers" },
  { key: "products", label: "Products" },
  { key: "pos", label: "Sales & Billing (POS)" },
  { key: "purchase", label: "Purchases" },
  { key: "inventory", label: "Inventory" },
  { key: "expenses", label: "Expenses" },
  { key: "reports", label: "Reports" },
  { key: "users", label: "User Management" },
  { key: "settings", label: "Settings" },
];

export const ROLE_DEFAULT_PERMISSIONS = {
  Owner: {
    dashboard: true,
    customers: true,
    suppliers: true,
    products: true,
    pos: true,
    purchase: true,
    inventory: true,
    expenses: true,
    reports: true,
    users: true,
    settings: true,
  },
  Manager: {
    dashboard: true,
    customers: true,
    suppliers: true,
    products: true,
    pos: true,
    purchase: true,
    inventory: true,
    expenses: true,
    reports: true,
    users: false,
    settings: false,
  },
  Cashier: {
    dashboard: true,
    customers: true,
    suppliers: false,
    products: true,
    pos: true,
    purchase: false,
    inventory: false,
    expenses: false,
    reports: false,
    users: false,
    settings: false,
  },
  Accountant: {
    dashboard: true,
    customers: true,
    suppliers: true,
    products: false,
    pos: true,
    purchase: true,
    inventory: false,
    expenses: true,
    reports: true,
    users: false,
    settings: false,
  },
};

/**
 * Helper to determine if user is a primary business owner or superadmin.
 */
export function isOwnerOrSuperAdmin(user) {
  if (!user) return true;
  const roleStr = String(user.role || "").toLowerCase().replace(/[-_\s]/g, "");
  const userId = String(user._id || user.id || "");
  const ownerId = String(user.ownerId || "");

  // If user is owner, superadmin, admin, user, retail, or has no ownerId, or ownerId matches own user ID
  if (
    roleStr === "owner" ||
    roleStr === "businessowner" ||
    roleStr === "superadmin" ||
    roleStr === "admin" ||
    roleStr === "user" ||
    !ownerId ||
    ownerId === "null" ||
    ownerId === "undefined" ||
    (userId && ownerId === userId)
  ) {
    return true;
  }

  // Only restrict secondary employee sub-accounts created under an owner
  return false;
}

/**
 * Resolves permissions object for the given user.
 * Owners and Superadmins always receive full permissions.
 * Employees receive default role permissions merged with specific module overrides.
 */
export function getUserPermissions(user) {
  if (isOwnerOrSuperAdmin(user)) {
    return { ...ROLE_DEFAULT_PERMISSIONS.Owner };
  }

  const roleName = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
    : "Cashier";

  const defaultPerms =
    ROLE_DEFAULT_PERMISSIONS[roleName] || ROLE_DEFAULT_PERMISSIONS.Owner;

  if (
    user.permissions &&
    typeof user.permissions === "object" &&
    Object.keys(user.permissions).length > 0
  ) {
    return {
      ...defaultPerms,
      ...user.permissions,
    };
  }

  return { ...defaultPerms };
}

/**
 * Checks whether the current user has permission to access a specific page module.
 */
export function hasPermission(user, pageKey) {
  if (isOwnerOrSuperAdmin(user)) return true;
  if (
    !pageKey ||
    pageKey === "profile" ||
    pageKey === "notifications" ||
    pageKey === "dashboard" ||
    ["features", "pricing", "changelog", "roadmap", "about", "blog", "careers", "press", "help-center", "api-docs", "status", "contact"].includes(pageKey)
  ) {
    return true;
  }

  const permissions = getUserPermissions(user);
  if (
    pageKey === "pos" ||
    pageKey === "sales" ||
    pageKey === "billing" ||
    pageKey === "sales-billing"
  ) {
    return Boolean(permissions.pos);
  }
  return Boolean(permissions[pageKey]);
}



