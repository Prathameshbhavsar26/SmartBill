import { BarChart2, ChevronRight, Menu, UserCircle, X } from "lucide-react";
import { NAV_GROUPS, SUPER_ADMIN_ITEMS } from "./navConfig";

export default function Sidebar({ page, onNav, role, collapsed, onToggle }) {
  const isSuperAdmin = role === "superadmin";

  return (
    <aside
      className="flex flex-col bg-slate-900 transition-all duration-300 z-20 flex-shrink-0"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-slate-800 h-16 px-4 gap-3 flex-shrink-0`}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-4 h-4 text-white" />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Smart Bill</p>
            <p className="text-[10px] text-slate-500 capitalize">
              {role.replace("-", " ")}
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {isSuperAdmin ? (
          <div className="space-y-0.5 px-3">
            {SUPER_ADMIN_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = page === key;
              return (
                <button
                  key={key}
                  onClick={() => onNav(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                  {collapsed && (
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl">
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="px-6 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5 px-3">
                  {group.items.map(({ key, label, icon: Icon }) => {
                    const active = page === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onNav(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                        {collapsed && (
                          <span className="absolute left-14 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl">
                            {label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-4 h-4 text-blue-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Admin User
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                admin@business.in
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
