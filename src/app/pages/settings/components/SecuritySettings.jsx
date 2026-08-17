import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Laptop,
} from "lucide-react";
import { changePassword, updateProfile } from "../../../api/authAPI";
import { setUserToStorage } from "../../../utils/userUtils";

export default function SecuritySettings() {
  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null); // { type: "success" | "error", text: string }

  // Security preferences states (synced with MongoDB user record)
  const [twoFactorAuth, setTwoFactorAuth] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("smartbill_user"));
      if (u && typeof u.twoFactorEnabled === "boolean") return u.twoFactorEnabled;
    } catch {}
    return localStorage.getItem("smartbill_2fa_enabled") === "true";
  });
  const [sessionTimeout, setSessionTimeout] = useState(() => {
    return localStorage.getItem("smartbill_session_timeout") || "30";
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefStatus, setPrefStatus] = useState(null);

  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordStatus({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Incorrect current password. Please try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle saving session preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefStatus(null);
    try {
      // 1. Persist twoFactorEnabled to MongoDB user record
      const res = await updateProfile({ twoFactorEnabled: twoFactorAuth });
      if (res.user) {
        setUserToStorage(res.user);
      }
      // 2. Save session preference locally
      localStorage.setItem("smartbill_2fa_enabled", String(twoFactorAuth));
      localStorage.setItem("smartbill_session_timeout", sessionTimeout);
      setPrefStatus({
        type: "success",
        text: `✓ Security preferences saved! Two-Factor Authentication is now ${
          twoFactorAuth ? "Enabled (OTP required on login)" : "Disabled"
        }.`,
      });
      setTimeout(() => setPrefStatus(null), 3500);
    } catch (err) {
      setPrefStatus({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to save security preferences.",
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── 1. Change Password Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Change Password
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Update your login password to keep your account safe.
        </p>

        {passwordStatus && (
          <div
            className={`p-3 rounded-lg border text-xs font-medium mb-4 flex items-center gap-2 ${
              passwordStatus.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
            }`}
          >
            {passwordStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{passwordStatus.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {savingPassword ? (
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

      {/* ── 2. Login & Session Policies Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Login & Session Security
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Control session timeout and extra verification rules.
        </p>

        {prefStatus && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{prefStatus.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-4">
          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-900 dark:text-slate-200">
                Two-Factor Authentication (OTP on Login)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Require OTP code sent to your phone when logging in
              </p>
            </div>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={(e) => setTwoFactorAuth(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
            />
          </div>

          {/* Session Inactivity Timeout */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-900 dark:text-slate-200">
                Auto Logout (Inactivity Timeout)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically logout when inactive
              </p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPrefs}
              className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. Active Session Status Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Current Device
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-slate-500" />
            <span>Windows PC • Web Browser</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Active Now
          </span>
        </div>
      </div>
    </div>
  );
}
