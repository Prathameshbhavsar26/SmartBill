/**
 * Plan Feature Matrix and Access Control Utilities
 */

export const PLAN_CONFIGS = {
  starter: {
    key: "starter",
    name: "Starter",
    price: 999,
    maxBusinesses: 1,
    maxUsers: 2,
    maxInvoicesPerMonth: 500,
    features: {
      basicReports: true,
      emailSupport: true,
      advancedReports: false,
      gstFiling: false,
      prioritySupport: false,
      barcodeScanner: false,
      apiAccess: false,
      customIntegrations: false,
      dedicatedManager: false,
    },
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: 2499,
    maxBusinesses: 3,
    maxUsers: 10,
    maxInvoicesPerMonth: Infinity,
    features: {
      basicReports: true,
      emailSupport: true,
      advancedReports: true,
      gstFiling: true,
      prioritySupport: true,
      barcodeScanner: true,
      apiAccess: false,
      customIntegrations: false,
      dedicatedManager: false,
    },
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    price: 6999,
    maxBusinesses: Infinity,
    maxUsers: Infinity,
    maxInvoicesPerMonth: Infinity,
    features: {
      basicReports: true,
      emailSupport: true,
      advancedReports: true,
      gstFiling: true,
      prioritySupport: true,
      barcodeScanner: true,
      apiAccess: true,
      customIntegrations: true,
      dedicatedManager: true,
    },
  },
};

/**
 * Returns normalized plan key for user ('starter', 'pro', 'enterprise').
 * Superadmin always returns 'enterprise'.
 */
export function getUserPlanKey(user) {
  if (!user || user.role === "superadmin") return "enterprise";
  const plan = user.subscription?.plan || "starter";
  const normalized = String(plan).toLowerCase().replace(/\s*plan\s*/gi, "").trim();
  return PLAN_CONFIGS[normalized] ? normalized : "starter";
}

/**
 * Returns full plan configuration object for the user.
 */
export function getUserPlan(user) {
  const planKey = getUserPlanKey(user);
  return PLAN_CONFIGS[planKey] || PLAN_CONFIGS.starter;
}

/**
 * Checks if current user's plan unlocks a specific feature key.
 * Superadmin has access to all features.
 *
 * @param {object} user - Authenticated user object
 * @param {string} featureKey - e.g. 'advancedReports', 'gstFiling', 'barcodeScanner', 'apiAccess'
 * @returns {boolean}
 */
export function hasPlanFeature(user, featureKey) {
  if (!user || user.role === "superadmin") return true;
  const plan = getUserPlan(user);
  return Boolean(plan.features?.[featureKey]);
}

/**
 * Returns human readable error or requirement for locked feature.
 */
export function getRequiredPlanForFeature(featureKey) {
  switch (featureKey) {
    case "advancedReports":
    case "gstFiling":
    case "barcodeScanner":
    case "prioritySupport":
      return "Pro";
    case "apiAccess":
    case "customIntegrations":
    case "dedicatedManager":
      return "Enterprise";
    default:
      return "Pro";
  }
}



