import { useState, useEffect } from "react";
import { Sparkles, Clock, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import subscriptionAPI from "../../api/subscriptionAPI";
import { PLANS } from "../../constants/landing";
import { setUserToStorage } from "../../utils/userUtils";

export default function TrialBanner({ user, onNav }) {
  const [subData, setSubData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    if (!user || user.role === "superadmin") return;

    subscriptionAPI
      .getSubscriptionStatus()
      .then((res) => {
        if (res?.success) {
          setSubData(res);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch subscription status:", err.message);
      });
  }, [user]);

  if (!user || user.role === "superadmin") return null;

  const trialState = subData?.trialState;
  const subscription = subData?.subscription || user?.subscription;
  const planName = subscription?.plan ? subscription.plan.toUpperCase() : "STARTER";
  const isExpired = trialState?.isExpired || subscription?.status === "expired";
  const daysLeft = trialState?.daysLeft ?? 14;
  const isActive = subscription?.status === "active";

  const handleBuyPlan = async (plan) => {
    try {
      setLoadingPlan(plan.name);
      const res = await subscriptionAPI.createOrder(plan.name);
      const razorpayKey = res.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TPCMQcPRZqe62i";

      const executePaymentVerification = async (payload) => {
        try {
          const verifyRes = await subscriptionAPI.verifyPayment(payload);

          // ✅ CRITICAL: Fetch fresh profile from backend and update localStorage
          // BEFORE reloading so the new plan is reflected immediately on next boot.
          try {
            const { getProfile } = await import("../../api/authAPI");
            const profileRes = await getProfile();
            if (profileRes?.user) {
              setUserToStorage(profileRes.user);
              window.dispatchEvent(new Event("userUpdated"));
            } else if (verifyRes?.subscription) {
              // Fallback: patch subscription into existing cached user
              const cached = localStorage.getItem("smartbill_user");
              if (cached) {
                const parsed = JSON.parse(cached);
                parsed.subscription = verifyRes.subscription;
                setUserToStorage(parsed);
                window.dispatchEvent(new Event("userUpdated"));
              }
            }
          } catch (profileErr) {
            console.warn("Profile refresh notice:", profileErr.message);
          }

          alert(`✓ ${verifyRes.message || "Payment successful! Welcome to " + plan.name + " plan."}`);
          setShowUpgradeModal(false);
          window.location.reload();
        } catch (err) {
          alert("Payment verification error: " + (err.message || err.response?.data?.message || "Unknown error"));
        } finally {
          setLoadingPlan(null);
        }
      };

      // If backend generated a mock/test order or Razorpay SDK is unavailable, proceed with test verification
      if (res.isMock || res.orderId?.startsWith("order_test_") || typeof window.Razorpay === "undefined") {
        await executePaymentVerification({
          razorpay_order_id: res.orderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "mock_signature",
          planName: plan.name,
        });
        return;
      }

      const options = {
        key: razorpayKey,
        amount: res.amount,
        currency: res.currency || "INR",
        name: "SmartBill",
        description: `${plan.name} Plan Subscription`,
        order_id: res.orderId,
        handler: async function (response) {
          await executePaymentVerification({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planName: plan.name,
          });
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
        theme: {
          color: "#2563eb",
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (rzpErr) {
        console.warn("Razorpay SDK modal error, falling back to test mode:", rzpErr);
        await executePaymentVerification({
          razorpay_order_id: res.orderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "mock_signature",
          planName: plan.name,
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Could not start payment process: " + (error.message || error.response?.data?.message || "Unknown error"));
      setLoadingPlan(null);
    }
  };

  return (
    <>
      {/* Expired Top Notice / Banner */}
      {isExpired ? (
        <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-inner">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Your 14-day free trial has expired. Upgrade your account to continue creating invoices and using SmartBill features.</span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-white text-rose-700 hover:bg-slate-100 font-bold px-3 py-1 rounded-lg text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-rose-600" />
            <span>Upgrade Now</span>
          </button>
        </div>
      ) : isActive ? (
        <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Plan: <strong>{planName}</strong></span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-emerald-700 font-semibold hover:underline text-[11px]"
          >
            Manage Subscription
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-200" />
            <span>
              Free Trial: <strong className="text-amber-300 font-bold">{daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining</strong>
            </span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      )}

      {/* Subscription Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                SmartBill Pricing & Plans
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Choose the best plan for your business
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Unlock unlimited invoices, multi-business management, GST filing, and advanced reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`border-2 rounded-xl p-5 flex flex-col justify-between relative bg-white ${
                    plan.badge ? "border-blue-500 shadow-md shadow-blue-50" : "border-slate-200"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-extrabold text-slate-900">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-xs">{plan.period}</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyPlan(plan)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full py-2 px-4 rounded-lg font-bold text-xs shadow transition-all cursor-pointer ${
                      plan.badge
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {loadingPlan === plan.name ? "Processing..." : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
