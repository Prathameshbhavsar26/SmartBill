import { useState } from "react";
import { Lock, Zap, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { getUserPlan, getRequiredPlanForFeature } from "../../utils/planPermissions";
import { PLANS } from "../../constants/landing";
import subscriptionAPI from "../../api/subscriptionAPI";
import { setUserToStorage } from "../../utils/userUtils";

export default function PlanFeatureLock({
  user,
  featureKey,
  title,
  description,
  onNav,
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const currentPlan = getUserPlan(user);
  const requiredPlanName = getRequiredPlanForFeature(featureKey);

  const handleBuyPlan = async (plan) => {
    try {
      setLoadingPlan(plan.name);
      const res = await subscriptionAPI.createOrder(plan.name);
      const razorpayKey =
        res.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        "rzp_test_TPCMQcPRZqe62i";

      const executePaymentVerification = async (payload) => {
        try {
          const verifyRes = await subscriptionAPI.verifyPayment(payload);

          // ✅ CRITICAL: Refresh user profile from backend so new plan is saved
          // in localStorage BEFORE the page reloads — enabling new features instantly.
          try {
            const { getProfile } = await import("../../api/authAPI");
            const profileRes = await getProfile();
            if (profileRes?.user) {
              setUserToStorage(profileRes.user);
              window.dispatchEvent(new Event("userUpdated"));
            } else if (verifyRes?.subscription) {
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

          alert(
            `✓ ${
              verifyRes.message ||
              "Payment successful! Welcome to " + plan.name + " plan."
            }`
          );
          setShowUpgradeModal(false);
          window.location.reload();
        } catch (err) {
          alert(
            "Payment verification error: " +
              (err.message || err.response?.data?.message || "Unknown error")
          );
        } finally {
          setLoadingPlan(null);
        }
      };

      if (
        res.isMock ||
        res.orderId?.startsWith("order_test_") ||
        typeof window.Razorpay === "undefined"
      ) {
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
      alert(
        "Could not start payment process: " +
          (error.message || error.response?.data?.message || "Unknown error")
      );
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-2xl border border-indigo-500/20 my-8 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-inner">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>

        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {requiredPlanName} Feature Only
        </span>

        <h3 className="text-2xl font-extrabold text-white mt-3 mb-2">
          {title || "Feature Locked"}
        </h3>

        <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          {description ||
            `Your current ${currentPlan.name} plan does not include access to this feature. Upgrade your subscription to ${requiredPlanName} to unlock it.`}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Upgrade to {requiredPlanName} Plan</span>
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 text-left">
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
                Upgrade to unlock {title || "all features"}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Choose the best plan for your growing business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`border-2 rounded-xl p-5 flex flex-col justify-between relative bg-white ${
                    plan.name.toLowerCase() === requiredPlanName.toLowerCase()
                      ? "border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-500/20"
                      : "border-slate-200"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-extrabold text-slate-900">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs text-slate-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyPlan(plan)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full py-2 px-4 rounded-lg font-bold text-xs shadow transition-all cursor-pointer ${
                      plan.badge ||
                      plan.name.toLowerCase() === requiredPlanName.toLowerCase()
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {loadingPlan === plan.name
                      ? "Processing..."
                      : `Upgrade to ${plan.name}`}
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
