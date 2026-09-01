import { useState } from "react";
import { Lock, LogIn, Mail, AlertCircle, ShieldCheck } from "lucide-react";
import { loginUser } from "@shared/api/authAPI";
import { setUserToStorage } from "@shared/utils/userUtils";
import { Input, Btn, Toast } from "@shared/components/common/ui";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      
      if (data.requireOtp) {
         setError("2FA is currently not supported on the lightweight admin login.");
         setLoading(false);
         return;
      }

      const loggedInUser = data.user;
      localStorage.setItem("smartbill_token", data.token);
      setUserToStorage(loggedInUser);
      setToast({ msg: "Login successful", type: "success" });
      setTimeout(() => {
        onLogin(loggedInUser.role, loggedInUser);
      }, 500);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-slate-900/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to manage the platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Input
              label="Admin Email"
              value={email}
              onChange={(v) => setEmail(v)}
              icon={<Mail className="w-4 h-4" />}
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(v) => setPassword(v)}
              icon={<Lock className="w-4 h-4" />}
            />

            <Btn
              variant="primary"
              size="lg"
              onClick={handleLogin}
              className="w-full justify-center mt-6 !bg-slate-900 hover:!bg-slate-800 focus:ring-slate-900/20"
              disabled={loading}
              icon={
                loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )
              }
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </Btn>
          </form>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Secure admin access. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
