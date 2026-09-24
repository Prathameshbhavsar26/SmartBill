import { useState } from "react";
import { Bell, LogOut, MoreVertical, Plus, Menu, ShieldCheck, Store, Globe } from "lucide-react";
import { Btn, ConfirmDialog } from "@shared/components/common/ui";
import { getUserDisplayName, getUserInitials } from "@shared/utils/userUtils";
import { useCustomization } from "@shared/hooks/useCustomization";
import { getAdminUrl, getCrmUrl, getLandingUrl } from "@shared/utils/urlUtils";

const PAGE_LABELS = {
  dashboard: "Dashboard",
  "super-dashboard": "Admin Overview",
  businesses: "Businesses",
  customers: "Customers",
  suppliers: "Suppliers",
  products: "Products & Stock",
  pos: "Sales & Billing",
  purchase: "Purchase & Inward",
  inventory: "Inventory & Alerts",
  reports: "Reports & Analytics",
  expenses: "Expenses Tracking",
  users: "User Management",
  settings: "Business Settings",
  notifications: "Notifications",
  profile: "Profile Settings",
};

const SHORT_PAGE_LABELS = {
  dashboard: "Dashboard",
  "super-dashboard": "Admin",
  businesses: "Businesses",
  customers: "Customers",
  suppliers: "Suppliers",
  products: "Products",
  pos: "Billing",
  purchase: "Purchase",
  inventory: "Inventory",
  reports: "Reports",
  expenses: "Expenses",
  users: "Users",
  settings: "Settings",
  notifications: "Alerts",
  profile: "Profile",
};

export default function Topbar({ page, onLogout, onNav, role, notifCount, user, onMobileMenuToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { t, formatDate } = useCustomization();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);

  const fullTitle = t(`nav.${page}`) !== `nav.${page}` ? t(`nav.${page}`) : PAGE_LABELS[page] || "SmartBill";
  const shortTitle = SHORT_PAGE_LABELS[page] || fullTitle;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-2.5 sm:px-6 gap-2 sm:gap-4 flex-shrink-0 z-10">
      {/* Mobile hamburger menu button */}
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
          <span className="hidden sm:inline">{fullTitle}</span>
          <span className="sm:hidden">{shortTitle}</span>
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          {formatDate(new Date())}
        </p>
      </div>

      {role === "owner" && (
        <button
          type="button"
          onClick={() => onNav("pos")}
          style={{ backgroundColor: "var(--primary, #2563eb)", color: "#ffffff" }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer flex-shrink-0 min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5 text-white flex-shrink-0" />
          <span className="hidden sm:inline">{t("nav.new_invoice") || "New Invoice"}</span>
          <span className="sm:hidden">Bill</span>
        </button>
      )}


      <button
        onClick={() => onNav("notifications")}
        className={`relative w-8.5 h-8.5 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 ${
          page === "notifications"
            ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        }`}
        title="Notifications"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {notifCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] sm:min-w-[18px] sm:h-[18px] px-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 animate-in zoom-in-75">
            {notifCount > 99 ? "99+" : notifCount}
          </span>
        )}
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--primary, #2563eb)" }}
        >
          <span className="text-[11px] sm:text-xs font-bold text-white">{initials}</span>
        </div>
        <div className="hidden md:block max-w-[120px] lg:max-w-[160px]">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">{role}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="User actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-700">
              <div className="px-3 py-1.5">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{role}</p>
              </div>
              <div className="py-1">
                <a
                  href={getLandingUrl()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Home Website</span>
                </a>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>{t("nav.logout") || "Logout"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showLogoutConfirm && (
        <ConfirmDialog
          message="Are you sure you really want to logout?"
          confirmText="Logout"
          onConfirm={() => {
            setShowLogoutConfirm(false);
            onLogout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </header>
  );
}



