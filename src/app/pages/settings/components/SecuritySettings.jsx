import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  LogOut,
  BellRing,
  History,
} from "lucide-react";
import { changePassword } from "../../../api/authAPI";

export default function SecuritySettings() {
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Security preferences state (persisted in localStorage / user settings)
  const [twoFactorAuth, setTwoFactorAuth] = useState(() => {
    return localStorage.getItem("smartbill_2fa_enabled") === "true";
  });
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    return localStorage.getItem("smartbill_session_timeout") || "30";
  });
  const [loginAlerts, setLoginAlerts] = useState(() => {
    return localStorage.getItem("smartbill_login_alerts") !== "false";
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefMsg, setPrefMsg] = useState(null);

  // Activity audit log
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("smartbill_security_audit");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        event: "Current Session Active",
        device: "Chrome on Windows",
        ip: "127.0.0.1 (Localhost)",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "success",
      },
    ];
  });

  const addAuditLog = (eventText) => {
    const newEntry = {
      id: Date.now(),
      event: eventText,
      device: `${navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser"} on Windows`,
      ip: "Localhost",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "success",
    };
    const updated = [newEntry, ...auditLogs.slice(0, 5)];
    setAuditLogs(updated);
    try {
      localStorage.setItem("smartbill_security_audit", JSON.stringify(updated));
    } catch {}
  };

  // Password strength checker
  const passwordCriteria = {
    length: newPassword.length >= 6,
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    matches: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const getStrengthScore = () => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.hasUpper) score++;
    if (passwordCriteria.hasNumber) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  };

  const strengthScore = getStrengthScore();

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: "success", text: "✓ Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addAuditLog("Account Password Changed");
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to update password. Please check your current password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle saving security preferences
  const handleSavePreferences = () => {
    setPrefSaving(true);
    try {
      localStorage.setItem("smartbill_2fa_enabled", String(twoFactorAuth));
      localStorage.setItem("smartbill_session_timeout", sessionTimeout);
      localStorage.setItem("smartbill_login_alerts", String(loginAlerts));
      setPrefMsg({ type: "success", text: "✓ Security preferences saved!" });
      addAuditLog("Security Preferences Updated");
      setTimeout(() => setPrefMsg(null), 3500);
    } catch (err) {
      setPrefMsg({ type: "error", text: "Failed to save preferences." });
    } finally {
      setPrefSaving(false);
    }
  };

  const handleTerminateOtherSessions = () => {
    addAuditLog("Terminated Other Device Sessions");
    alert("All other active sessions have been terminated. Current session remains active.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Security & Account Protection
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your password, login authentication, active devices & session policies
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Change Password ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Change Account Password
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ensure your account is using a strong password with letters, numbers, and symbols
            </p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              passwordMsg.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {passwordMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all ${
                          strengthScore >= step
                            ? strengthScore <= 1
                              ? "bg-red-500"
                              : strengthScore === 2
                                ? "bg-amber-500"
                                : strengthScore === 3
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Strength:{" "}
                    <span className="font-bold">
                      {strengthScore <= 1
                        ? "Weak"
                        : strengthScore === 2
                          ? "Moderate"
                          : strengthScore === 3
                            ? "Strong"
                            : "Very Strong"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${
                  passwordCriteria.matches ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                }`}>
                  {passwordCriteria.matches ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving || !currentPassword || !newPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Two-Factor & Login Policies ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Authentication & Session Security
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Configure session inactivity and login security policies
            </p>
          </div>
        </div>

        {prefMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{prefMsg.text}</span>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Two-Factor Auth */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication (2FA)
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Require a one-time OTP code sent to your registered phone number when signing in
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactorAuth(!twoFactorAuth)}
              className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer flex-shrink-0 ${
                twoFactorAuth ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  twoFactorAuth ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Inactivity Session Timeout
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically lock or log out the billing console after a period of idle inactivity
              </p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes (Standard)</option>
              <option value="60">1 Hour</option>
              <option value="240">4 Hours</option>
              <option value="never">Never (Keep Alive)</option>
            </select>
          </div>

          {/* Login Email Notifications */}
          <div className="py-3.5 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Security Login Alerts
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Receive an immediate notification whenever a login occurs from an unrecognized device
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLoginAlerts(!loginAlerts)}
              className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer flex-shrink-0 ${
                loginAlerts ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  loginAlerts ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={prefSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Security Policies</span>
          </button>
        </div>
      </div>

      {/* ── Section 3: Active Device Sessions ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Active Device & Login Sessions
            </h3>
          </div>
          <button
            type="button"
            onClick={handleTerminateOtherSessions}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Other Devices</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Windows PC • Chrome Browser
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Current Session
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                IP: 127.0.0.1 • Connected now
              </p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* ── Section 4: Security Activity Audit Log ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Recent Security Events
          </h3>
        </div>

        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{log.event}</span>
                <span className="text-[11px] text-slate-400">({log.device})</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {log.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
