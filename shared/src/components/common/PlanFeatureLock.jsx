import { useState } from "react";
import { Lock, Zap, CheckCircle2 } from "lucide-react";
import { getUserPlan, getRequiredPlanForFeature } from "@shared/utils/planPermissions";
import { PLANS } from "@shared/constants/landing";
import subscriptionAPI from "@shared/api/subscriptionAPI";
import UpgradeModal from "@shared/components/subscription/UpgradeModal";

export default function PlanFeatureLock({
  user,
  featureKey,
  title,
  description,
  onNav,
}) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [selectedUpgradePreview, setSelectedUpgradePreview] = useState(null);

  const currentPlan = getUserPlan(user);
  const requiredPlanName = getRequiredPlanForFeature(featureKey);

  const handleBuyPlan = async (plan) => {
    try {
      setLoadingPlan(plan.name);
      const planKey = (plan.key || plan.name || "pro").toLowerCase();
      const preview = await subscriptionAPI.getUpgradePreview(planKey);
      setSelectedUpgradePreview(preview);
    } catch (err) {
      console.warn("Could not load upgrade preview, using fallback:", err?.message);
      setSelectedUpgradePreview({
        currentPlan: {
          key: (currentPlan?.name || "starter").toLowerCase(),
          name: currentPlan?.name || "Starter",
          price: 999,
        },
        newPlan: {
          key: (plan.key || plan.name || "pro").toLowerCase(),
          name: plan.name,
          price: Number(plan.price || 2499),
        },
        isUpgrade: true,
        originalPrice: Number(plan.price || 2499),
        proratedCredit: 0,
        daysRemaining: 14,
      });
    } finally {
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
            `Your current ${currentPlan?.name || "Starter"} plan does not include access to this feature. Upgrade your subscription to ${requiredPlanName} to unlock it.`}
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

      {/* Plan Selection Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 text-left">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                SmartBill Pricing & Plans
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                Upgrade to unlock {title || "all features"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Choose the best plan for your growing business with instant promo coupon discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`border-2 rounded-2xl p-5 flex flex-col justify-between relative bg-white dark:bg-slate-800/60 ${
                    plan.name.toLowerCase() === requiredPlanName.toLowerCase()
                      ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
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
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow transition-all cursor-pointer ${
                      plan.badge ||
                      plan.name.toLowerCase() === requiredPlanName.toLowerCase()
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                    }`}
                  >
                    {loadingPlan === plan.name
                      ? "Loading Checkout..."
                      : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
          Subscription Upgrade Modal with Amazon-style Coupons
          ------------------------------------------------------------------ */}
      {selectedUpgradePreview && (
        <UpgradeModal
          preview={selectedUpgradePreview}
          userEmail={user?.email}
          onClose={() => setSelectedUpgradePreview(null)}
          onSuccess={() => {
            setSelectedUpgradePreview(null);
            setShowUpgradeModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
