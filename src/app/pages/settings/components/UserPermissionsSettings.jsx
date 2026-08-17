import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  Check,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Eye,
  Sliders,
  Settings,
  ShoppingCart,
  Truck,
  Package,
  FileText,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Edit2,
  Save,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  MODULE_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from "../../../utils/permissions";
import {
  fetchEmployees,
  updateEmployee,
} from "../../../api/employeeAPI";

// Permission module categorized with clear business descriptions and icons
export const PERMISSION_CATEGORIES = [
  {
    category: "Sales & Customer Relations",
    icon: ShoppingCart,
    description: "Manage billing, checkout point-of-sale, invoices & client CRM",
    modules: [
      {
        key: "dashboard",
        label: "Executive Dashboard",
        desc: "View business metrics, daily revenue charts & live activity ticker",
      },
      {
        key: "customers",
        label: "Customers Directory",
        desc: "Add, view, edit customer records, credit balances & billing history",
      },
      {
        key: "pos",
        label: "Point of Sale (POS) & Invoicing",
        desc: "Generate sales invoices, barcode scan items, apply discounts & collect payments",
      },
    ],
  },
  {
    category: "Inventory & Purchases",
    icon: Package,
    description: "Stock management, suppliers directory & procurement bills",
    modules: [
      {
        key: "products",
        label: "Products Catalog",
        desc: "Manage item listings, prices, SKU/HSN codes & tax percentages",
      },
      {
        key: "inventory",
        label: "Stock & Inventory Control",
        desc: "Track stock levels, low-stock reorders & inventory valuations",
      },
      {
        key: "suppliers",
        label: "Suppliers Directory",
        desc: "Manage vendor contacts, supplier ledgers & payment accounts",
      },
      {
        key: "purchase",
        label: "Purchase Invoices",
        desc: "Record incoming purchase invoices & update inventory stock levels",
      },
    ],
  },
  {
    category: "Finance & Analytics",
    icon: TrendingUp,
    description: "Financial reports, operational expenses & tax records",
    modules: [
      {
        key: "expenses",
        label: "Expense Tracking",
        desc: "Record and categorize overhead business expenses & operational costs",
      },
      {
        key: "reports",
        label: "Financial & Tax Reports",
        desc: "View & export Sales, Purchases, P&L statements & GSTR tax reports",
      },
    ],
  },
  {
    category: "Administration & System",
    icon: Settings,
    description: "Staff access permissions, security & business configuration",
    modules: [
      {
        key: "users",
        label: "Staff & User Management",
        desc: "Invite employees, assign roles & reset staff passwords",
      },
      {
        key: "settings",
        label: "System & Business Settings",
        desc: "Configure company details, GSTIN, invoice templates & payment gateways",
      },
    ],
  },
];

const ROLES_INFO = {
  Owner: {
    title: "Business Owner / Superadmin",
    badge: "Full Access",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    desc: "Unrestricted access to all business modules, financial data, and security controls.",
    locked: true,
  },
  Manager: {
    title: "Store / Operations Manager",
    badge: "Operations Lead",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    desc: "Can oversee sales, inventory, suppliers, purchases and operational expenses.",
  },
  Accountant: {
    title: "Accountant / Auditor",
    badge: "Financial Control",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    desc: "Dedicated access to financial records, GST reports, P&L, sales and expenses.",
  },
  Cashier: {
    title: "Cashier / Front-desk Staff",
    badge: "Restricted POS",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    desc: "Limited strictly to customer lookup, products listing and generating sales invoices at checkout.",
  },
};

export default function UserPermissionsSettings() {
  const [activeView, setActiveView] = useState("roles"); // "roles" | "users"
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [rolePermissions, setRolePermissions] = useState(() => {
    try {
      const saved = localStorage.getItem("smartbill_custom_role_permissions");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...ROLE_DEFAULT_PERMISSIONS };
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empPermissions, setEmpPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEmployeeList = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetchEmployees();
      if (res && Array.isArray(res.employees)) {
        setEmployees(res.employees);
        if (res.employees.length > 0 && !selectedEmployee) {
          const first = res.employees[0];
          setSelectedEmployee(first);
          setEmpPermissions({
            ...(ROLE_DEFAULT_PERMISSIONS[first.role] || ROLE_DEFAULT_PERMISSIONS.Cashier),
            ...(first.permissions || {}),
          });
        }
      }
    } catch (err) {
      console.error("Error loading employees in permissions:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    loadEmployeeList();
  }, []);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    const defaults = ROLE_DEFAULT_PERMISSIONS[emp.role] || ROLE_DEFAULT_PERMISSIONS.Cashier;
    setEmpPermissions({
      ...defaults,
      ...(emp.permissions || {}),
    });
  };

  // Toggle role permission
  const handleToggleRolePerm = (modKey) => {
    if (selectedRole === "Owner") return; // Owner is always 100%
    setRolePermissions((prev) => {
      const currentRolePerms = prev[selectedRole] || { ...ROLE_DEFAULT_PERMISSIONS[selectedRole] };
      return {
        ...prev,
        [selectedRole]: {
          ...currentRolePerms,
          [modKey]: !currentRolePerms[modKey],
        },
      };
    });
  };

  // Toggle employee permission
  const handleToggleEmpPerm = (modKey) => {
    if (selectedEmployee?.role === "Owner") return;
    setEmpPermissions((prev) => ({
      ...prev,
      [modKey]: !prev[modKey],
    }));
  };

  // Apply Role Preset to current editing employee
  const handleApplyRolePresetToEmp = (roleName) => {
    const defaults = rolePermissions[roleName] || ROLE_DEFAULT_PERMISSIONS[roleName] || ROLE_DEFAULT_PERMISSIONS.Cashier;
    setEmpPermissions({ ...defaults });
    showToast(`Applied ${roleName} default permissions`, "info");
  };

  // Toggle all in a category
  const handleCategoryToggleRole = (modules, turnOn) => {
    if (selectedRole === "Owner") return;
    setRolePermissions((prev) => {
      const current = { ...(prev[selectedRole] || ROLE_DEFAULT_PERMISSIONS[selectedRole]) };
      modules.forEach((m) => {
        current[m.key] = turnOn;
      });
      return {
        ...prev,
        [selectedRole]: current,
      };
    });
  };

  const handleCategoryToggleEmp = (modules, turnOn) => {
    if (selectedEmployee?.role === "Owner") return;
    setEmpPermissions((prev) => {
      const next = { ...prev };
      modules.forEach((m) => {
        next[m.key] = turnOn;
      });
      return next;
    });
  };

  // Save Role Matrix Settings
  const handleSaveRoleMatrix = () => {
    try {
      localStorage.setItem(
        "smartbill_custom_role_permissions",
        JSON.stringify(rolePermissions)
      );
      showToast("✓ Role permission defaults saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save role permissions", "error");
    }
  };

  // Reset Role to System Defaults
  const handleResetRoleDefaults = () => {
    setRolePermissions((prev) => ({
      ...prev,
      [selectedRole]: { ...ROLE_DEFAULT_PERMISSIONS[selectedRole] },
    }));
    showToast(`Reset ${selectedRole} to factory defaults`, "info");
  };

  // Save Employee Customized Permissions
  const handleSaveEmployeePermissions = async () => {
    if (!selectedEmployee) return;
    setSaving(true);
    try {
      const empId = selectedEmployee.id || selectedEmployee._id;
      await updateEmployee(empId, {
        permissions: empPermissions,
      });
      showToast(`✓ Permissions updated for ${selectedEmployee.name}`, "success");
      await loadEmployeeList();
    } catch (err) {
      showToast(err.message || "Failed to update employee permissions", "error");
    } finally {
      setSaving(false);
    }
  };

  const currentRolePerms =
    selectedRole === "Owner"
      ? ROLE_DEFAULT_PERMISSIONS.Owner
      : rolePermissions[selectedRole] || ROLE_DEFAULT_PERMISSIONS[selectedRole] || {};

  const currentEmpPerms = selectedEmployee?.role === "Owner" ? ROLE_DEFAULT_PERMISSIONS.Owner : empPermissions;

  const countActivePerms = (permsObj) => {
    return Object.values(permsObj || {}).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
          toastMessage.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
            : toastMessage.type === "info"
              ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
              : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Role-Based Access Control & Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define security privileges for standard roles and override granular access per team member
              </p>
            </div>
          </div>

          {/* Sub-tabs: By Role vs By Team Member */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView("roles")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === "roles"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Role Profiles</span>
            </button>
            <button
              onClick={() => setActiveView("users")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === "users"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Members ({employees.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeView === "roles" ? (
        /* ═══════════════════════════════════════════════════════════════
           VIEW 1: ROLE PROFILES & PERMISSION MATRICES
           ═══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Role selector bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(ROLES_INFO).map((rKey) => {
              const r = ROLES_INFO[rKey];
              const isSelected = selectedRole === rKey;
              const perms = rKey === "Owner" ? ROLE_DEFAULT_PERMISSIONS.Owner : rolePermissions[rKey] || ROLE_DEFAULT_PERMISSIONS[rKey];
              const count = countActivePerms(perms);

              return (
                <div
                  key={rKey}
                  onClick={() => setSelectedRole(rKey)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 shadow-sm ring-1 ring-blue-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {rKey}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {r.desc}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Privileges:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {count} / {MODULE_PERMISSIONS.length} Enabled
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role Permissions Matrix Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {ROLES_INFO[selectedRole]?.title}
                  </h4>
                  {selectedRole === "Owner" && (
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                      Immutable System Superadmin
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle granular module access permissions assigned to employees with the <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRole}</span> role
                </p>
              </div>

              {selectedRole !== "Owner" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetRoleDefaults}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRoleMatrix}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Role Access</span>
                  </button>
                </div>
              )}
            </div>

            {/* Categorized Permissions Grid */}
            <div className="space-y-6">
              {PERMISSION_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const activeCountInCat = cat.modules.filter((m) => Boolean(currentRolePerms[m.key])).length;
                const allEnabledInCat = activeCountInCat === cat.modules.length;

                return (
                  <div
                    key={cat.category}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/20"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <CatIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {cat.category}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
                            — {cat.description}
                          </span>
                        </div>
                      </div>

                      {selectedRole !== "Owner" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCategoryToggleRole(cat.modules, !allEnabledInCat)}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            {allEnabledInCat ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Modules in Category */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                      {cat.modules.map((mod) => {
                        const isGranted = Boolean(currentRolePerms[mod.key]);
                        const isLocked = selectedRole === "Owner";

                        return (
                          <div
                            key={mod.key}
                            className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <div className="pr-4">
                              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{mod.label}</span>
                                <span className="text-[10px] font-mono text-slate-400 uppercase font-normal">
                                  ({mod.key})
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {mod.desc}
                              </p>
                            </div>

                            {/* Switch */}
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              <span className={`text-[11px] font-semibold font-mono ${
                                isGranted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                              }`}>
                                {isGranted ? "Allowed" : "Restricted"}
                              </span>
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => handleToggleRolePerm(mod.key)}
                                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                  isGranted ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                                    isGranted ? "right-1" : "left-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           VIEW 2: TEAM MEMBERS & INDIVIDUAL PERMISSION OVERRIDES
           ═══════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Team Members Roster */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Staff Members
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {employees.length} active
              </span>
            </div>

            {loadingEmployees ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                <span className="text-xs">Loading staff roster...</span>
              </div>
            ) : employees.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No employees found. Add staff members in User Management to customize permissions.
              </div>
            ) : (
              <div className="space-y-2">
                {employees.map((emp) => {
                  const isSelected = (selectedEmployee?.id || selectedEmployee?._id) === (emp.id || emp._id);
                  const permsCount = countActivePerms({
                    ...(ROLE_DEFAULT_PERMISSIONS[emp.role] || {}),
                    ...(emp.permissions || {}),
                  });

                  return (
                    <div
                      key={emp.id || emp._id}
                      onClick={() => handleSelectEmployee(emp)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm"
                          : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {(emp.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {emp.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {emp.email || emp.department || emp.role}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {emp.role || "Cashier"}
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {permsCount} active
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 2-Columns: Selected Employee Permissions Customizer */}
          <div className="lg:col-span-2 space-y-5">
            {selectedEmployee ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                      {(selectedEmployee.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedEmployee.name}
                        </h4>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {selectedEmployee.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedEmployee.email} • {selectedEmployee.department || "General Staff"}
                      </p>
                    </div>
                  </div>

                  {selectedEmployee.role !== "Owner" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEmployeePermissions}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save Permissions</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Presets Bar */}
                {selectedEmployee.role !== "Owner" && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-500" /> Apply Preset:
                    </span>
                    {["Cashier", "Manager", "Accountant"].map((presetRole) => (
                      <button
                        key={presetRole}
                        type="button"
                        onClick={() => handleApplyRolePresetToEmp(presetRole)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-all cursor-pointer"
                      >
                        {presetRole}
                      </button>
                    ))}
                  </div>
                )}

                {/* Categorized Permissions Grid for Employee */}
                <div className="space-y-5">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const activeCountInCat = cat.modules.filter((m) => Boolean(currentEmpPerms[m.key])).length;
                    const allEnabledInCat = activeCountInCat === cat.modules.length;

                    return (
                      <div
                        key={cat.category}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/20"
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <CatIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {cat.category}
                            </span>
                          </div>

                          {selectedEmployee.role !== "Owner" && (
                            <button
                              type="button"
                              onClick={() => handleCategoryToggleEmp(cat.modules, !allEnabledInCat)}
                              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              {allEnabledInCat ? "Deselect All" : "Select All"}
                            </button>
                          )}
                        </div>

                        {/* Modules in Category */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                          {cat.modules.map((mod) => {
                            const isGranted = Boolean(currentEmpPerms[mod.key]);
                            const isLocked = selectedEmployee.role === "Owner";

                            return (
                              <div
                                key={mod.key}
                                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <div className="pr-4">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    {mod.label}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {mod.desc}
                                  </p>
                                </div>

                                {/* Switch */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => handleToggleEmpPerm(mod.key)}
                                    className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                      isGranted ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-sm ${
                                        isGranted ? "right-0.5" : "left-0.5"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs">Select a staff member from the roster to view or adjust permissions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
