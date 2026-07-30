import { useState } from "react";
import { Bell, LogOut, MoreVertical, Plus, UserCircle } from "lucide-react";
import { Btn } from "../components/common/ui";

export const PAGE_LABELS = {
  dashboard: "Dashboard",
  "super-dashboard": "Admin Overview",
  businesses: "Businesses",

  customers: "Customers",
  suppliers: "Suppliers",
  products: "Products",
  pos: "Sales & Billing",
  purchase: "Purchase",
  inventory: "Inventory",
  reports: "Reports",
  expenses: "Expenses",
  users: "User Management",
  settings: "Business Settings",
  notifications: "Notifications",
  profile: "Profile",
};
export default function Topbar({ page, onLogout, onNav, role, notifCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-900">
          {PAGE_LABELS[page]}
        </h1>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {role === "owner" && (
        <Btn
          variant="primary"
          size="sm"
          onClick={() => onNav("pos")}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          New Invoice
        </Btn>
      )}

      <button
        onClick={() => onNav("notifications")}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {notifCount}
          </span>
        )}
      </button>

      <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">AU</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-800">Admin User</p>
          <p className="text-[10px] text-slate-500 capitalize">{role}</p>
        </div>
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
