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
 * Resolves permissions object for the given user.
 * Owners and Superadmins always receive full permissions.
 * Employees receive the specific module permissions granted to them by the owner.
 */
export function getUserPermissions(user) {
  if (!user || user.role === "owner" || user.role === "superadmin") {
    return { ...ROLE_DEFAULT_PERMISSIONS.Owner };
  }

  // If user object contains specific permissions saved by owner
  if (user.permissions && typeof user.permissions === "object" && Object.keys(user.permissions).length > 0) {
    return { ...user.permissions };
  }

  // Fallback by role name
  const roleName = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Cashier";

  return {
    ...(ROLE_DEFAULT_PERMISSIONS[roleName] || ROLE_DEFAULT_PERMISSIONS.Cashier),
  };
}

/**
 * Checks whether the current user has permission to access a specific page module.
 */
export function hasPermission(user, pageKey) {
  if (!user || user.role === "owner" || user.role === "superadmin") return true;
  if (!pageKey || pageKey === "profile" || pageKey === "notifications") return true;

  const permissions = getUserPermissions(user);
  return Boolean(permissions[pageKey]);
}
