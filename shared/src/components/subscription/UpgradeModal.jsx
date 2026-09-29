import { useState, useEffect } from "react";
import {
  X,
  Zap,
  ArrowDownCircle,
  CheckCircle2,
  Loader2,
  Tag,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
  Check,
  Percent,
  ChevronDown,
  ChevronUp,
  Gift,
  ShieldCheck,
  Flame,
} from "lucide-react";
import subscriptionAPI from "@shared/api/subscriptionAPI";
import { validateCouponCode, getAvailableCoupons } from "@shared/api/couponAPI";
import { setUserToStorage } from "@shared/utils/userUtils";

const PLAN_COLORS = {
  starter: {
    bg: "from-slate-700 to-slate-800",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    accent: "text-slate-600 dark:text-slate-400",
  },
  pro: {
    bg: "from-blue-600 via-indigo-600 to-blue-700",
    badge: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accent: "text-blue-600 dark:text-blue-400",
  },
  enterprise: {
    bg: "from-amber-500 via-orange-600 to-amber-600",
    badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accent: "text-amber-600 dark:text-amber-400",
  },
};

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * UpgradeModal — Amazon-Style Checkout with Available Coupons & Instant Apply
 *
 * Props:
 *   preview           — data from getUpgradePreview API
 *   onClose           — called when modal dismissed
 *   onSuccess         — called with server response after payment verified
 *   userEmail         — used as fallback for Razorpay prefill
 *   initialCouponCode — optional coupon code to pre-apply
 */
export default function UpgradeModal({
  preview,
  onClose,
  onSuccess,
  userEmail,
  initialCouponCode = "",
}) {
  const [step, setStep] = useState("preview"); // "preview" | "processing" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  // Coupon state
  const [couponInput, setCouponInput] = useState(() => {
    return (
      initialCouponCode ||
      preview?.appliedCoupon?.code ||
      (() => {
        try {
          return sessionStorage.getItem("smartbill_claimed_coupon") || "";
        } catch {
          return "";
        }
      })()
    );
  });
  const [appliedCoupon, setAppliedCoupon] = useState(preview?.appliedCoupon || null);
  const [couponDiscount, setCouponDiscount] = useState(preview?.couponDiscount || 0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState(
    preview?.appliedCoupon ? `✓ Coupon "${preview.appliedCoupon.code}" applied!` : ""
  );

  // Available Coupons State (Amazon style)
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  if (!preview) return null;

  const {
    currentPlan,
    newPlan,
    isUpgrade,
    isActivePaid,
    daysRemaining,
    proratedCredit = 0,
    originalPrice = 0,
    effectiveDate,
  } = preview;

  const isDowngrade = !isUpgrade;

  // Calculate dynamic pricing
  const afterProrated = Math.max(0, originalPrice - proratedCredit);
  const activeCouponDiscount = appliedCoupon ? couponDiscount : 0;
  const finalPayableToday = Math.max(0, afterProrated - activeCouponDiscount);
  const totalSavings = proratedCredit + activeCouponDiscount;
  const totalSavingsPercent =
    originalPrice > 0 ? Math.round((totalSavings / originalPrice) * 100) : 0;

  const newPlanColors = PLAN_COLORS[newPlan?.key] || PLAN_COLORS.pro;
  const currentColors = PLAN_COLORS[currentPlan?.key] || PLAN_COLORS.starter;

  // Fetch all available coupons for this plan
  useEffect(() => {
    if (!isUpgrade) return;
    let isMounted = true;
    setLoadingCoupons(true);

    getAvailableCoupons({
      plan: newPlan?.key || "pro",
      amount: afterProrated || originalPrice,
    })
      .then((res) => {
        if (isMounted && res?.success && Array.isArray(res?.coupons)) {
          setAvailableCoupons(res.coupons);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch available coupons:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingCoupons(false);
      });

    return () => {
      isMounted = false;
    };
  }, [newPlan?.key, afterProrated, originalPrice, isUpgrade]);

  // Auto-apply initial coupon if provided and not yet applied
  useEffect(() => {
    const rawCode =
      initialCouponCode ||
      (() => {
        try {
          return sessionStorage.getItem("smartbill_claimed_coupon") || "";
        } catch {
          return "";
        }
      })();

    if (rawCode && isUpgrade && !appliedCoupon) {
      applyCoupon(rawCode);
    }
  }, [initialCouponCode, isUpgrade]);

  async function applyCoupon(codeToApply) {
    const cleanCode = (codeToApply || couponInput || "").trim().toUpperCase();
    if (!cleanCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccessMsg("");

    try {
      const res = await validateCouponCode(cleanCode, newPlan?.key || "pro", afterProrated);
      if (res && res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(Number(res.discountAmount) || 0);
        setCouponInput(res.coupon.code);
        setCouponSuccessMsg(
          res.discountAmount > 0
            ? `✓ Coupon "${res.coupon.code}" applied! You save ${formatINR(res.discountAmount)}.`
            : `✓ Coupon "${res.coupon.code}" applied successfully!`
        );
        try {
          sessionStorage.setItem("smartbill_claimed_coupon", res.coupon.code);
        } catch {}
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(res?.message || "Invalid coupon code");
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(
        err?.response?.data?.message || err?.message || "Invalid or expired coupon code"
      );
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponInput("");
    setCouponError("");
    setCouponSuccessMsg("");
    try {
      sessionStorage.removeItem("smartbill_claimed_coupon");
    } catch {}
  }

  async function handleProceed() {
    if (isDowngrade) {
      setStep("processing");
      try {
        const res = await subscriptionAPI.verifyPayment({
          razorpay_order_id: `order_downgrade_${Date.now()}`,
          razorpay_payment_id: `pay_downgrade_${Date.now()}`,
          planName: newPlan.key,
          isDowngrade: true,
        });
        setStep("success");
        if (onSuccess) onSuccess(res);
      } catch (err) {
        setErrorMsg(err?.response?.data?.message || "Failed to schedule downgrade.");
        setStep("error");
      }
      return;
    }

    // Upgrade — open Razorpay
    setStep("processing");
    const loaded = await loadRazorpay();
    if (!loaded) {
      setErrorMsg("Could not load payment gateway. Please check your internet connection.");
      setStep("error");
      return;
    }

    try {
      const orderData = await subscriptionAPI.createOrder(newPlan.key, {
        isUpgrade: true,
        proratedAmount: finalPayableToday,
        couponCode: appliedCoupon?.code || "",
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "SmartBill",
        description: `${newPlan.name} Plan${
          totalSavings > 0 ? ` (${formatINR(totalSavings)} total savings applied)` : ""
        }`,
        order_id: orderData.orderId,
        prefill: { email: userEmail || "" },
        theme: { color: "#2563EB" },
        handler: async (response) => {
          try {
            const verifyRes = await subscriptionAPI.verifyPayment({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id:
                response.razorpay_payment_id || `pay_mock_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "",
              planName: newPlan.key,
              isUpgrade: true,
              email: userEmail || "",
              couponCode: appliedCoupon?.code || "",
            });

            if (verifyRes?.token) {
              localStorage.setItem("smartbill_token", verifyRes.token);
            }
            if (verifyRes?.user) {
              setUserToStorage(verifyRes.user);
            }
            try {
              sessionStorage.removeItem("smartbill_claimed_coupon");
            } catch {}
            window.dispatchEvent(new Event("userUpdated"));

            setStep("success");
            if (onSuccess) onSuccess(verifyRes);
          } catch (err) {
            setErrorMsg(
              err?.response?.data?.message || err?.message || "Payment verification failed."
            );
            setStep("error");
          }
        },
        modal: {
          ondismiss: () => {
            if (step === "processing") setStep("preview");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setStep("preview");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to initiate payment.");
      setStep("error");
    }
  }

  // ── Success screen ──────────────────────────
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {isDowngrade ? "Downgrade Scheduled!" : "Payment Successful!"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
            {isDowngrade
              ? `Your ${currentPlan.name} plan continues until ${new Date(effectiveDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. After that, your plan will switch to ${newPlan.name}.`
              : `Congratulations! Your account is now active on the ${newPlan.name} plan. All elevated quotas, barcode tools, and reports are unlocked.`}
          </p>
          {appliedCoupon && !isDowngrade && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 mb-6 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
              🎉 You saved {formatINR(totalSavings)} with coupon <strong className="font-mono">{appliedCoupon.code}</strong>!
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl py-3.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-[1.01]"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Error screen ────────────────────────────
  if (step === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300 dark:border-red-800">
            <X className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">{errorMsg}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("preview")}
              className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-900 dark:bg-slate-800 text-white font-semibold rounded-2xl py-3 hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const visibleCoupons = showAllCoupons
    ? availableCoupons
    : availableCoupons.slice(0, 3);

  // ── Preview / Checkout Screen ────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 dark:bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-6 animate-in zoom-in-95">
        {/* Header Banner */}
        <div
          className={`bg-gradient-to-r ${isDowngrade ? "from-slate-700 to-slate-800" : newPlanColors.bg} px-6 py-5 relative text-white`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            {isDowngrade ? (
              <TrendingDown className="w-6 h-6 text-white" />
            ) : (
              <div className="p-1.5 bg-white/15 rounded-xl backdrop-blur-xs">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            )}
            <div>
              <h2 className="text-white font-black text-lg sm:text-xl tracking-tight">
                {isDowngrade ? "Plan Downgrade" : "Plan Checkout & Payment"}
              </h2>
              <p className="text-white/80 text-xs font-medium">
                {currentPlan?.name || "Starter"} Plan → {newPlan?.name || "Pro"} Plan
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Plan Comparison Box */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Current Plan</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${currentColors.badge}`}>
                {currentPlan?.name || "Starter"}
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                {formatINR(currentPlan?.price || 0)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </p>
            </div>

            <div
              className={`border-2 ${isDowngrade ? "border-slate-400 dark:border-slate-600" : "border-blue-500 dark:border-blue-500"} rounded-2xl p-3.5 bg-gradient-to-br ${
                isDowngrade
                  ? "from-slate-50 to-slate-100 dark:from-slate-800/90"
                  : "from-blue-50/70 via-indigo-50/50 to-blue-50/30 dark:from-blue-950/40 dark:to-slate-800/70"
              }`}
            >
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">Target Plan</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${newPlanColors.badge}`}>
                {newPlan?.name}
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                {formatINR(newPlan?.price)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </p>
            </div>
          </div>

          {/* Downgrade Info Box */}
          {isDowngrade && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Downgrade scheduled at billing cycle end
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Your <strong>{currentPlan.name}</strong> plan continues until{" "}
                  <strong>
                    {new Date(effectiveDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                  . No payment is required today — your plan will switch automatically.
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              AMAZON-STYLE AVAILABLE OFFERS & COUPONS SECTION
              ══════════════════════════════════════════════════════════ */}
          {isUpgrade && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-gradient-to-b from-slate-50/90 to-white dark:from-slate-800/40 dark:to-slate-900/60 space-y-3.5">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Available Offers & Coupons
                      {availableCoupons.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 px-1.5 py-0.2 rounded-full">
                          {availableCoupons.length} Active
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Tap any offer to apply instant savings to your payment
                    </p>
                  </div>
                </div>

                {appliedCoupon && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    Applied
                  </span>
                )}
              </div>

              {/* List of Available Coupons (Amazon Style Cards) */}
              {loadingCoupons ? (
                <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Checking applicable offers & deals...</span>
                </div>
              ) : availableCoupons.length > 0 ? (
                <div className="space-y-2.5">
                  {visibleCoupons.map((coupon) => {
                    const isCurrentApplied =
                      appliedCoupon &&
                      appliedCoupon.code.toUpperCase() === coupon.code.toUpperCase();

                    const discountBadgeText =
                      coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% OFF`
                        : coupon.discountType === "flat"
                        ? `FLAT ₹${coupon.discountValue} OFF`
                        : `+${coupon.discountValue} DAYS TRIAL`;

                    return (
                      <div
                        key={coupon._id || coupon.code}
                        className={`group relative border-2 rounded-2xl p-3 transition-all ${
                          isCurrentApplied
                            ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10"
                            : "border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            {/* Code + Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-lg tracking-wider border ${
                                  isCurrentApplied
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                                }`}
                              >
                                {coupon.code}
                              </span>

                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-600/40">
                                {discountBadgeText}
                              </span>

                              {coupon.isFeaturedBanner && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-300/40 flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 fill-current" />
                                  Popular
                                </span>
                              )}
                            </div>

                            {/* Title & Description */}
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 pt-0.5">
                              {coupon.title}
                            </p>
                            {coupon.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                {coupon.description}
                              </p>
                            )}

                            {/* Terms */}
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                              {coupon.minOrderAmount > 0 && (
                                <span>Min spend: ₹{coupon.minOrderAmount}</span>
                              )}
                              {coupon.maxDiscountAmount > 0 && (
                                <span>Max cap: ₹{coupon.maxDiscountAmount}</span>
                              )}
                              {coupon.expiryDate && (
                                <span>
                                  Valid till{" "}
                                  {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex-shrink-0 self-center">
                            {isCurrentApplied ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Applied
                                </span>
                                <button
                                  type="button"
                                  onClick={handleRemoveCoupon}
                                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => applyCoupon(coupon.code)}
                                disabled={couponLoading}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-blue-500/20 flex items-center gap-1"
                              >
                                {couponLoading && couponInput === coupon.code ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <span>Apply</span>
                                    <Sparkles className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Show more/less toggle */}
                  {availableCoupons.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      className="w-full text-center py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {showAllCoupons ? (
                        <>
                          Show fewer offers <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          View all {availableCoupons.length} available offers{" "}
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-1">
                  No public promotions active at this moment. You can still enter an exclusive promo code below.
                </p>
              )}

              {/* Manual Promo Code Input Box */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Have another promo / coupon code?
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyCoupon(couponInput);
                        }
                      }}
                      placeholder="Enter promo code (e.g. WELCOME50)"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs uppercase font-mono tracking-wider text-slate-900 dark:text-white placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => applyCoupon(couponInput)}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {couponLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Apply Code"
                    )}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-2 font-semibold flex items-center gap-1">
                    <X className="w-3 h-3 flex-shrink-0" /> {couponError}
                  </p>
                )}

                {couponSuccessMsg && !couponError && appliedCoupon && (
                  <div className="mt-2.5 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        {couponSuccessMsg}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PRICE BREAKDOWN TABLE & LIVE CALCULATION
              ══════════════════════════════════════════════════════════ */}
          {isUpgrade && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Order Summary
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Monthly Plan</span>
              </div>

              <div className="space-y-1.5 text-xs divide-y divide-slate-200/60 dark:divide-slate-700/60 pt-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300 pb-1.5">
                  <span>{newPlan.name} Plan Original Price</span>
                  <span className="font-mono font-medium">{formatINR(originalPrice)}</span>
                </div>

                {isActivePaid && proratedCredit > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 py-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Unused balance from {currentPlan.name} ({daysRemaining}d)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      − {formatINR(proratedCredit)}
                    </span>
                  </div>
                )}

                {appliedCoupon && activeCouponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold py-1.5">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-500" />
                      Coupon Discount ({appliedCoupon.code})
                    </span>
                    <span className="font-mono">− {formatINR(activeCouponDiscount)}</span>
                  </div>
                )}

                <div className="pt-2.5 flex justify-between items-center text-slate-900 dark:text-white">
                  <div>
                    <p className="font-extrabold text-sm">Final Amount to Pay Today</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      All taxes & instant discounts included
                    </p>
                  </div>
                  <div className="text-right">
                    {totalSavings > 0 && (
                      <span className="line-through text-xs text-slate-400 font-mono block">
                        {formatINR(originalPrice)}
                      </span>
                    )}
                    <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">
                      {formatINR(finalPayableToday)}
                    </span>
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl px-3 py-2 mt-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      🎉 Total savings on this order: {formatINR(totalSavings)} ({totalSavingsPercent}% OFF)!
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Assurance Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit Encrypted Checkout • Verified by Razorpay</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={step === "processing"}
              className="flex-1 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl py-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={step === "processing"}
              className={`flex-1 font-black rounded-2xl py-3.5 text-xs transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 text-white shadow-lg hover:scale-[1.01] active:scale-95 ${
                isDowngrade
                  ? "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-slate-900/20"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-600/30"
              }`}
            >
              {step === "processing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting Gateway...
                </>
              ) : isDowngrade ? (
                <>
                  <ArrowDownCircle className="w-4 h-4" />
                  Confirm Downgrade
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatINR(finalPayableToday)} Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
