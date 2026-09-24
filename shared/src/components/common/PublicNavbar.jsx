import React, { useState, useEffect } from "react";
import { BarChart2, X, Menu, ShieldCheck, Store, ArrowRight, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCrmUrl, getAdminUrl } from "../../utils/urlUtils";
import { Btn } from "./ui";

export default function PublicNavbar({ onNav }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("smartbill_user");
      const token = localStorage.getItem("smartbill_token");
      return (raw && token) ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem("smartbill_user");
        const token = localStorage.getItem("smartbill_token");
        setCurrentUser((raw && token) ? JSON.parse(raw) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("userUpdated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("userUpdated", handleSync);
    };
  }, []);

  const handleAuthNav = (path) => {
    if (onNav) {
      onNav(path);
    } else {
      window.location.href = getCrmUrl(`/${path}`);
    }
  };

  const isSuperAdmin = currentUser?.role === "superadmin" || String(currentUser?.role || "").toLowerCase().includes("admin");

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-8 justify-between md:justify-start">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">Smart Bill</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 flex-1">
            {["Features", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href={`/#${l.toLowerCase()}`}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                {l}
              </a>
            ))}
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {currentUser ? (
              isSuperAdmin ? (
                <>
                  <a
                    href={getAdminUrl("/admin")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open SuperAdmin Panel</span>
                  </a>
                </>
              ) : (
                <>
                  <a
                    href={getCrmUrl("/app")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Store className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </a>
                </>
              )
            ) : (
              <>
                <Btn 
                  variant="ghost" 
                  onClick={() => handleAuthNav("login")}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Sign In</span>
                </Btn>
                <Btn variant="primary" onClick={() => handleAuthNav("register")}>
                  Start Free Trial
                </Btn>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden ml-auto text-slate-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 px-6 py-4 space-y-3 bg-white animate-in slide-in-from-top-2 shadow-lg">
            {["Features", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href={`/#${l.toLowerCase()}`}
                className="block text-sm font-medium text-slate-700 py-1.5 hover:text-blue-600 transition-colors"
                onClick={() => setMobileMenu(false)}
              >
                {l}
              </a>
            ))}
            
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {currentUser ? (
                <div className="space-y-2 pt-1">
                  <a
                    href={isSuperAdmin ? getAdminUrl("/admin") : getCrmUrl("/app")}
                    className="w-full py-2.5 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                    onClick={() => setMobileMenu(false)}
                  >
                    {isSuperAdmin ? <ShieldCheck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    <span>{isSuperAdmin ? "Open SuperAdmin Dashboard" : "Open Store Dashboard"}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("smartbill_token");
                      localStorage.removeItem("smartbill_user");
                      setCurrentUser(null);
                      setMobileMenu(false);
                      handleAuthNav("login");
                    }}
                    className="w-full py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-slate-200 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Btn
                    variant="outline"
                    onClick={() => {
                      setMobileMenu(false);
                      handleAuthNav("login");
                    }}
                    className="flex-1 justify-center flex items-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sign In</span>
                  </Btn>
                  <Btn
                    variant="primary"
                    onClick={() => {
                      setMobileMenu(false);
                      handleAuthNav("register");
                    }}
                    className="flex-1 justify-center"
                  >
                    Try Free
                  </Btn>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
  );
}
