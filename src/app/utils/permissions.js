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
 * Resolves full permissions object for the given user.
 * Owners and Superadmins always receive full permissions.
 */
export function getUserPermissions(user) {
  if (!user || user.role === "owner" || user.role === "superadmin") {
    return { ...ROLE_DEFAULT_PERMISSIONS.Owner };
  }

  // If user object contains permissions directly
  if (user.permissions && typeof user.permissions === "object") {
    return { ...ROLE_DEFAULT_PERMISSIONS.Cashier, ...user.permissions };
  }

  // Check stored employees in localStorage for matching user email
  try {
    const rawUser = localStorage.getItem("smartbill_user");
    const parsedUser = rawUser ? JSON.parse(rawUser) : user;
    const userKey = parsedUser?._id || parsedUser?.id || parsedUser?.email;
    const storageKey = userKey
      ? `smartbill_employees_${userKey}`
      : "smartbill_employees_default";
    const saved =
      localStorage.getItem(storageKey) ||
      localStorage.getItem("smartbill_employees");

    if (saved) {
      const employees = JSON.parse(saved);
      const match = employees.find(
        (e) =>
          e.email?.toLowerCase() === (parsedUser?.email || user?.email)?.toLowerCase()
      );
      if (match && match.permissions) {
        return { ...ROLE_DEFAULT_PERMISSIONS.Cashier, ...match.permissions };
      }
    }
  } catch (err) {
    console.warn("Error resolving user permissions:", err);
  }

  // Fallback by role name
  const roleName = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Cashier";
  return {
    ...ROLE_DEFAULT_PERMISSIONS.Cashier,
    ...(ROLE_DEFAULT_PERMISSIONS[roleName] || {}),
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
