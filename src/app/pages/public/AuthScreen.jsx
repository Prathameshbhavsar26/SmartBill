import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart2,
  Building2,
  Check,
  CheckCircle,
  Lock,
  LogIn,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import {
  Btn,
  Card,
  FixedPhoneInput,
  Input,
  Select,
  Toast,
} from "../../components/common/ui";
import { registerUser, loginUser, sendOtp, verifyOtp } from "../../api/authAPI";
import { setUserToStorage } from "../../utils/userUtils";

const PHONE_PREFIX = "+91 ";

const ADMIN_EMAIL = "gawaliomkar2005@gmail.com";

export default function AuthScreen({ view, onNav, onLogin }) {
  const [role, setRole] = useState("owner");

  // ---- Login state ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState("email"); // "email" | "phone"
  const [loginPhone, setLoginPhone] = useState(PHONE_PREFIX);

  // ---- Register state ----
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [biz, setBiz] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [bizType, setBizType] = useState("Retail");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // ---- OTP state ----
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  // ---- Error state ----
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPhoneError, setLoginPhoneError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [registerEmailError, setRegisterEmailError] = useState("");
  const [registerPasswordError, setRegisterPasswordError] = useState("");
  const [registerPhoneError, setRegisterPhoneError] = useState("");
  const [registerNameError, setRegisterNameError] = useState("");
  const [formError, setFormError] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isValidEmail = (raw) => {
    const trimmed = String(raw ?? "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const getLoginEmailError = (raw) => {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed) return "Email field is required.";
    if (!isValidEmail(trimmed)) return "Please enter a valid email address.";
    return "";
  };

  const validatePhone = (raw, required = true) => {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed || trimmed === PHONE_PREFIX || trimmed === "+91") {
      return required ? "Phone field is required." : "";
    }

    if (!trimmed.startsWith("+91")) {
      return "Phone must start with +91.";
    }

    const digitsPart = trimmed.slice(PHONE_PREFIX.length);
    if (!digitsPart) return required ? "Phone field is required." : "";
    if (!/^\d{10}$/.test(digitsPart)) {
      return "Phone number must be exactly 10 digits.";
    }

    return "";
  };

  // Strict validation used during registration.
  const validateRegisterPassword = (raw) => {
    const p = String(raw ?? "");
    if (!p.trim()) return "Password field is required.";

    if (p.length < 8) return "Password must be at least 8 characters.";
    if (p.length > 32) return "Password must be at most 32 characters.";

    if (!/[A-Z]/.test(p))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(p))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(p)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(p))
      return "Password must contain at least one special character.";

    return "";
  };

  // Simple check used at login so existing users are never blocked.
  const validateLoginPassword = (raw) => {
    if (!String(raw ?? "").trim()) return "Password field is required.";
    return "";
  };

  const handleLogin = async () => {
    // Super admin always signs in with email.
    const useEmail = role === "superadmin" || loginMethod === "email";
    const errEmail = useEmail ? getLoginEmailError(email) : "";
    const errPhone = !useEmail ? validatePhone(loginPhone) : "";
    const errPassword = validateLoginPassword(password);

    setLoginEmailError(errEmail);
    setLoginPhoneError(errPhone);
    setLoginPasswordError(errPassword);
    setFormError("");

    if (errEmail || errPhone || errPassword) return;

    setLoading(true);
    try {
      const payload = useEmail
        ? { email: email.trim(), password }
        : {
            phone: loginPhone.replace(PHONE_PREFIX, "").replace(/\D/g, ""),
            password,
          };
      const data = await loginUser(payload);

      // Force the panel based on the "Login As" toggle the user selected:
      // selecting "Super Admin" always opens the admin panel, and selecting
      // "Business Owner" always opens the business owner panel.
      const loggedInUser = data.user;

localStorage.setItem("smartbill_token", data.token);
setUserToStorage(loggedInUser);

showToast("Login successful", "success");

onLogin(loggedInUser.role, loggedInUser);
    } catch (err) {
      setFormError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const errEmail = getLoginEmailError(email);
    const errPassword = validateRegisterPassword(password);
    const errPhone = validatePhone(phone);
    const errName =
      !firstName.trim() || !lastName.trim()
        ? "First and last name are required."
        : "";

    setRegisterEmailError(errEmail);
    setRegisterPasswordError(errPassword);
    setRegisterPhoneError(errPhone);
    setRegisterNameError(errName);
    setFormError("");

    if (errEmail || errPassword || errPhone || errName) return;

    if (!phoneVerified) {
      setOtpError("Please verify your phone number with OTP first.");
      return;
    }

    setLoading(true);
    try {
      const pendingPlan = localStorage.getItem("pending_subscription_plan");
      const normalizedBizType = String(bizType ?? "Retail").trim();
      const data = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: biz.trim(),
        businessType: normalizedBizType,
        email: email.trim(),
        phone: phone.replace(PHONE_PREFIX, "").replace(/\D/g, ""),
        password,
        ...(pendingPlan ? { planName: pendingPlan } : {}),
      });

      if (pendingPlan) {
        localStorage.removeItem("pending_subscription_plan");
      }

      localStorage.setItem("smartbill_token", data.token);
      setUserToStorage(data.user);

      showToast(
        "Account created successfully. You're now signed in.",
        "success",
      );
      onLogin(data.user.role || "owner", data.user);
    } catch (err) {
      if (err.field === "email") {
        setRegisterEmailError(err.message);
      } else {
        setFormError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---- OTP handlers ----
  const getCleanPhone = () =>
    phone.replace(PHONE_PREFIX, "").replace(/\D/g, "");

  const handleSendOtp = async () => {
    const errPhone = validatePhone(phone);
    setRegisterPhoneError(errPhone);
    setOtpError("");
    if (errPhone) return;

    setOtpSending(true);
    try {
      const data = await sendOtp({ phone: getCleanPhone() });
      setOtpSent(true);
      setPhoneVerified(false);
      // No SMS provider is configured, so the backend returns the OTP in the
      // response for testing. Auto-fill it so the user can verify directly.
      setOtp(String(data?.otp ?? ""));
      showToast("OTP sent successfully. Check your phone.", "success");
    } catch (err) {
      if (err.field === "phone") {
        setRegisterPhoneError(err.message);
      }
      setOtpError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = String(otp ?? "").trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpVerifying(true);
    try {
      await verifyOtp({ phone: getCleanPhone(), otp: cleanOtp });
      setPhoneVerified(true);
      setOtpError("");
      showToast("Phone number verified successfully.", "success");
    } catch (err) {
      setOtpError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = () => {
    if (loading) return; // prevent duplicate submissions
    if (view === "login") {
      handleLogin();
    } else if (view === "register") {
      handleRegister();
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 bg-slate-900 relative overflow-hidden p-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="flex items-center gap-2.5 mb-10 relative z-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Smart Bill</span>
        </div>
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full">
            <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
              Manage your business
              <br />
              with confidence
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Complete billing, inventory, and accounting in one platform.
              GST-ready, cloud-based, and built for India.
            </p>
            <div className="space-y-3">
              {[
                "100% GST Compliant invoicing",
                "Real-time inventory tracking",
                "Profit & Loss statements",
                "Multi-user role access",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <button
            onClick={() => onNav("landing")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to home
          </button>

          {view === "login" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Sign in to your BillTrack account
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Login As
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["owner", "superadmin"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all capitalize ${role === r ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                      >
                        {r === "superadmin" ? "Super Admin" : "Business Owner"}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                {role === "owner" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Sign in with
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                      {["email", "phone"].map((m) => {
                        const active = loginMethod === m;
                        return (
                          <button
                            key={m}
                            onClick={() => {
                              setLoginMethod(m);
                              setLoginEmailError("");
                              setLoginPhoneError("");
                            }}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                          >
                            {m === "email" ? (
                              <Mail
                                className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`}
                              />
                            ) : (
                              <Phone
                                className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`}
                              />
                            )}
                            {m === "email" ? "Email" : "Mobile"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {role === "superadmin" || loginMethod === "email" ? (
                  <Input
                    label="Email Address"
                    value={email}
                    onChange={(v) => {
                      const trimmed = String(v ?? "").trimStart();
                      setEmail(trimmed);
                      if (trimmed && isValidEmail(trimmed))
                        setLoginEmailError("");
                      else setLoginEmailError(getLoginEmailError(trimmed));
                    }}
                    placeholder=""
                    icon={<Mail className="w-4 h-4" />}
                    error={loginEmailError}
                  />
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Mobile Number
                    </label>
                    <FixedPhoneInput
                      placeholder="+91"
                      icon={<Phone className="w-4 h-4" />}
                      value={loginPhone}
                      onChange={(value) => {
                        setLoginPhone(value);
                        setLoginPhoneError(validatePhone(value, false));
                      }}
                      error={loginPhoneError}
                    />
                  </div>
                )}
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    const err = validateLoginPassword(v);
                    if (!err) setLoginPasswordError("");
                    else setLoginPasswordError(err);
                  }}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={loginPasswordError}
                />
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-blue-600"
                    />
                    Remember me
                  </label>
                  <button
                    onClick={() => onNav("forgot")}
                    className="text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Btn
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="w-full justify-center"
                  disabled={loading}
                  icon={
                    loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )
                  }
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Btn>
              </div>
              <p className="text-xs text-center text-slate-500 mt-5">
                Don't have an account?{" "}
                <button
                  onClick={() => onNav("register")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Register Business
                </button>
              </p>
            </>
          )}

          {view === "register" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Start your 14-day free trial. No credit card needed.
              </p>
              <div className="space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(v) => {
                      setFirstName(v);
                      if (v.trim() && lastName.trim()) setRegisterNameError("");
                    }}
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(v) => {
                      setLastName(v);
                      if (v.trim() && firstName.trim())
                        setRegisterNameError("");
                    }}
                  />
                </div>
                {registerNameError && (
                  <p className="text-xs text-red-600 -mt-2">
                    {registerNameError}
                  </p>
                )}
                <Input
                  label="Business Name"
                  value={biz}
                  onChange={setBiz}
                  placeholder=""
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    const err = getLoginEmailError(v);
                    if (!err) setRegisterEmailError("");
                    else setRegisterEmailError(err);
                  }}
                  placeholder=""
                  icon={<Mail className="w-4 h-4" />}
                  error={registerEmailError}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Phone
                  </label>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <FixedPhoneInput
                        placeholder="+91"
                        icon={<Phone className="w-4 h-4" />}
                        value={phone}
                        onChange={(value) => {
                          setPhone(value);
                          setRegisterPhoneError(validatePhone(value, false));
                          if (phoneVerified) setPhoneVerified(false);
                        }}
                        error={registerPhoneError}
                      />
                    </div>
                    <Btn
                      variant="outline"
                      size="md"
                      onClick={handleSendOtp}
                      disabled={otpSending || phoneVerified}
                      className="h-[42px] whitespace-nowrap mt-[1px] shrink-0"
                      icon={
                        otpSending ? (
                          <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        ) : phoneVerified ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )
                      }
                    >
                      {phoneVerified
                        ? "Verified"
                        : otpSending
                          ? "Sending..."
                          : "Send OTP"}
                    </Btn>
                  </div>
                  {otpSent && (
                    <p className="text-xs text-emerald-600">
                      OTP sent to {phone}. Use the code shown below.
                    </p>
                  )}
                  {otpError && !otpSent && (
                    <p className="text-xs text-red-600 mt-0.5">{otpError}</p>
                  )}
                </div>

                {otpSent && !phoneVerified && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 -mt-1">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          label="Enter OTP"
                          value={otp}
                          onChange={(v) => {
                            setOtp(v.replace(/\D/g, "").slice(0, 6));
                            setOtpError("");
                          }}
                          placeholder="6-digit code"
                          inputClassName="tracking-widest"
                          error={otpError}
                        />
                      </div>
                      <Btn
                        variant="primary"
                        size="md"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying}
                        className="h-[42px] mt-[18px] shrink-0"
                        icon={
                          otpVerifying ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : undefined
                        }
                      >
                        {otpVerifying ? "Verifying..." : "Verify"}
                      </Btn>
                    </div>
                  </div>
                )}
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    const err = validateRegisterPassword(v);
                    if (!err) setRegisterPasswordError("");
                    else setRegisterPasswordError(err);
                  }}
                  placeholder="Min. 8 characters"
                  icon={<Lock className="w-4 h-4" />}
                  error={registerPasswordError}
                />
                <Select
                  label="Business Type"
                  value={bizType}
                  onChange={setBizType}
                  options={["Retail", "Wholesale"]}
                />
                <Btn
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="w-full justify-center"
                  disabled={loading}
                  icon={
                    loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : undefined
                  }
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Btn>
                <p className="text-[10px] text-slate-400 text-center">
                  By registering, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
              <p className="text-xs text-center text-slate-500 mt-4">
                Already registered?{" "}
                <button
                  onClick={() => onNav("login")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Reset your password
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter your email and we'll send a reset link.
              </p>
              {sent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900 mb-1">
                    Check your email
                  </p>
                  <p className="text-sm text-slate-500">
                    We sent a password reset link to {email}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    placeholder=""
                    icon={<Mail className="w-4 h-4" />}
                  />
                  <Btn
                    variant="primary"
                    size="lg"
                    onClick={() => setSent(true)}
                    className="w-full justify-center"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Reset Link
                  </Btn>
                </div>
              )}
              <p className="text-xs text-center text-slate-500 mt-4">
                <button
                  onClick={() => onNav("login")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  ← Back to Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
