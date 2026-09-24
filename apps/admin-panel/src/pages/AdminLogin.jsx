import { useState } from "react";
import { Lock, LogIn, Mail, AlertCircle, ShieldCheck, Check, ShieldAlert, X, ArrowRight } from "lucide-react";
import { loginUser } from "@shared/api/authAPI";
import { setUserToStorage } from "@shared/utils/userUtils";
import { getLandingUrl } from "@shared/utils/urlUtils";
import { Input, Btn, Toast } from "@shared/components/common/ui";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suspensionNotice, setSuspensionNotice] = useState(null);
  const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    
    setError("");
    setSuspensionNotice(null);
    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      
      if (data.requireOtp) {
         setError("2FA is currently not supported on the lightweight admin login.");
         setLoading(false);
         return;
      }

      const loggedInUser = data.user;
      const isAdminRole = (r) => {
        if (!r) return false;
        const norm = String(r).toLowerCase().replace(/[-_\s]/g, "");
        return norm.includes("admin") || norm === "superadmin" || norm === "support" || norm === "billing";
      };

      if (!isAdminRole(loggedInUser?.role)) {
        setError("Access denied: This portal is strictly restricted to SuperAdmin platform administrators.");
        setLoading(false);
        return;
      }

      localStorage.setItem("smartbill_token", data.token);
      setUserToStorage(loggedInUser);
      setToast({ msg: "Admin login successful", type: "success" });
      setTimeout(() => {
        onLogin(loggedInUser.role, loggedInUser);
      }, 500);
    } catch (err) {
      if (
        err.isSuspended ||
        err.status === 403 && (err.suspensionReason || /suspended/i.test(err.message))
      ) {
        let reason = err.suspensionReason || "";
        if (!reason && err.message && /reason:\s*/i.test(err.message)) {
          const match = err.message.match(/reason:\s*(.*)$/i);
          if (match && match[1]) reason = match[1].trim();
        }
        setSuspensionNotice({
          reason: reason || err.suspensionReason || "",
          message: err.message || "This account has been suspended by administration.",
        });
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Left panel */}
      <div 
        className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden p-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/billing_software_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]"></div>

        <div className="flex items-center gap-2.5 mb-10 relative z-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Smart Bill SuperAdmin</span>
        </div>
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold mb-4">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Governance</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
              Master Platform
              <br />
              Administration
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Secure administrative access for overseeing multi-tenant merchants, subscription tiers, platform revenue, and system health.
            </p>
            <div className="space-y-3">
              {[
                "Global merchant & tenant management",
                "Subscription plans & tier limits",
                "Coupon creation & revenue analytics",
                "Live system alerts & user audit logs",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-indigo-300" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
        <div className="w-full max-w-md">
          <a
            href={getLandingUrl()}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mb-6 sm:mb-8 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to home
          </a>

          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold mb-2 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform SuperAdmin Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">SuperAdmin Sign In</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Sign in to manage the SmartBill SaaS platform & merchants</p>
          </div>

          {error && (
            <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Authentication Error</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Simple 2-Line Suspension Reason Alert */}
          {suspensionNotice && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-red-900">
                  Account Suspended
                </div>
                <div className="text-[11px] text-red-800 mt-0.5 break-words">
                  <span className="font-medium text-red-950">Reason:</span>{" "}
                  {suspensionNotice.reason ? `"${suspensionNotice.reason}"` : "This account has been suspended by administration."}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuspensionNotice(null)}
                className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email Address"
              type="email"
              placeholder="admin@smartbill.com"
              value={email}
              onChange={(val) => {
                const v = typeof val === "string" ? val : val?.target?.value ?? "";
                setEmail(v);
                setSuspensionNotice(null);
                setError("");
              }}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(val) => {
                const v = typeof val === "string" ? val : val?.target?.value ?? "";
                setPassword(v);
                setSuspensionNotice(null);
                setError("");
              }}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Btn
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5 shadow-md shadow-indigo-500/10 mt-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
              disabled={loading}
              icon={
                loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )
              }
            >
              {loading ? "Authenticating..." : "Access SuperAdmin Dashboard"}
            </Btn>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Secure admin access. Authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
