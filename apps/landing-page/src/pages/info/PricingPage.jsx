import React, { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";

import PublicNavbar from "@shared/components/common/PublicNavbar";
import { useNavigate } from "react-router-dom";
import { Btn } from "@shared/components/common/ui";
import subscriptionAPI, {
  FALLBACK_SUBSCRIPTION_PLANS,
} from "@shared/api/subscriptionAPI";
import UpgradeModal from "@shared/components/subscription/UpgradeModal";
import { getCrmUrl } from "@shared/utils/urlUtils";
/*
|--------------------------------------------------------------------------
| Backend feature key -> Frontend display label
|--------------------------------------------------------------------------
*/

const FEATURE_LABELS = {
  basicReports: "Basic Reports",
  advancedReports: "Advanced Reports",
  gstReports: "GST Reports",
  expenses: "Expenses",
  purchaseManagement: "Purchase Management",
  inventory: "Inventory",
  paymentTracking: "Payment Tracking",
  paymentHistory: "Payment History",
  advancedPaymentHistory: "Advanced Payment History",
  invoiceCustomization: "Invoice Customization",
  advancedInvoiceCustomization: "Advanced Invoice Customization",
  unlimitedInvoiceCustomization: "Unlimited Invoice Customization",
  stockAlerts: "Stock Alerts",
  advancedStockAlerts: "Advanced Stock Alerts",
  enhancedStockMonitoring: "Enhanced Stock Monitoring",
  dataExport: "Data Export",
};

/*
|--------------------------------------------------------------------------
| Pricing Page
|--------------------------------------------------------------------------
*/

export default function PricingPage({ onNav }) {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Subscription plans
  |--------------------------------------------------------------------------
  */

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Selected plan loading
  |--------------------------------------------------------------------------
  */

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Get public subscription plans
  |--------------------------------------------------------------------------
  */

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setPlansError("");

      const response = await subscriptionAPI.getPublicPlans();

      if (
        response?.success &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setPlans(response.data);
        setPlansError("");
      } else {
        setPlans(FALLBACK_SUBSCRIPTION_PLANS);
        setPlansError("");
      }
    } catch {
      setPlans(FALLBACK_SUBSCRIPTION_PLANS);
      setPlansError("");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load plans when Pricing page opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /*
  |--------------------------------------------------------------------------
  | Get feature list
  |--------------------------------------------------------------------------
  */

  const getFeatureList = (plan) => {
    if (!plan?.features) {
      return [];
    }

    return Object.entries(plan.features)
      .filter(([, enabled]) => Boolean(enabled))
      .map(
        ([key]) =>
          FEATURE_LABELS[key] || key
      );
  };

  /*
  |--------------------------------------------------------------------------
  | Billing label
  |--------------------------------------------------------------------------
  */

  const getBillingLabel = (billingCycle) => {
    switch (billingCycle) {
      case "yearly":
        return "/year";

      case "custom":
        return "";

      case "monthly":
      default:
        return "/month";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Buy subscription plan (Opens Coupon Checkout Modal)
  |--------------------------------------------------------------------------
  */

  const handleBuyPlan = (plan) => {
    if (!plan) return;
    const planKey = (plan.key || plan.name || "pro").toLowerCase();
    setSelectedPreview({
      currentPlan: {
        key: "starter",
        name: "Starter",
        price: 999,
      },
      newPlan: {
        key: planKey,
        name: plan.name,
        price: Number(plan.price || 2499),
      },
      isUpgrade: true,
      originalPrice: Number(plan.price || 2499),
      proratedCredit: 0,
      daysRemaining: 14,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      <PublicNavbar onNav={onNav} />

      <section
        id="pricing"
        className="py-20 px-6 bg-slate-50 flex-1"
      >
        <div className="max-w-7xl mx-auto">

          {/* ==============================================================
              Heading
          ============================================================== */}

          <div className="text-center mb-14">

            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>

            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Choose the right plan for your business
            </h2>

            <p className="text-slate-500 max-w-xl mx-auto">
              Flexible subscription plans designed
              to grow with your business.
            </p>

          </div>

          {/* ==============================================================
              Loading
          ============================================================== */}

          {plansLoading && (
            <div className="flex justify-center py-16">

              <div className="flex items-center gap-3 text-slate-600">

                <div
                  className="
                    w-5
                    h-5
                    border-2
                    border-slate-300
                    border-t-blue-600
                    rounded-full
                    animate-spin
                  "
                />

                <span>
                  Loading plans...
                </span>

              </div>

            </div>
          )}

          {/* ==============================================================
              Error
          ============================================================== */}

          {!plansLoading &&
            plansError && (
              <div className="text-center py-16">

                <p className="text-red-600 mb-4">
                  {plansError}
                </p>

                <button
                  type="button"
                  onClick={fetchPlans}
                  className="
                    px-5
                    py-2
                    rounded-lg
                    bg-blue-600
                    text-white
                    text-sm
                    font-semibold
                    hover:bg-blue-700
                    transition
                  "
                >
                  Try Again
                </button>

              </div>
            )}

          {/* ==============================================================
              No Plans
          ============================================================== */}

          {!plansLoading &&
            !plansError &&
            plans.length === 0 && (
              <div className="text-center py-16">

                <p className="text-slate-600">
                  No subscription plans are
                  currently available.
                </p>

              </div>
            )}

          {/* ==============================================================
              Plans
          ============================================================== */}

          {!plansLoading &&
            !plansError &&
            plans.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  lg:grid-cols-3
                  gap-8
                  max-w-6xl
                  mx-auto
                "
              >

                {plans.map(
                  (plan, index) => {
                    const featureList =
                      getFeatureList(
                        plan
                      );

                    /*
                     * Pro is popular when available.
                     * Otherwise second plan is popular.
                     */

                    const hasProPlan =
                      plans.some(
                        (item) =>
                          item.name?.toLowerCase() ===
                          "pro"
                      );

                    const isPopular =
                      plan.name?.toLowerCase() ===
                        "pro" ||
                      (!hasProPlan &&
                        index === 1);

                    const billingLabel =
                      getBillingLabel(
                        plan.billingCycle
                      );

                    const planIdentifier =
                      plan.key ||
                      plan.name ||
                      index;

                    return (
                      <div
                        key={
                          plan._id ||
                          plan.key ||
                          `${plan.name}-${index}`
                        }
                        className={`
                          relative
                          rounded-2xl
                          border
                          ${
                            isPopular
                              ? `
                                border-blue-500
                                shadow-xl
                                shadow-blue-100
                              `
                              : `
                                border-slate-200
                                shadow-sm
                              `
                          }
                          bg-white
                          p-8
                          flex
                          flex-col
                        `}
                      >

                        {/* Popular Badge */}

                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">

                            <span
                              className="
                                rounded-full
                                bg-blue-600
                                px-4
                                py-1
                                text-xs
                                font-semibold
                                text-white
                                whitespace-nowrap
                              "
                            >
                              Most Popular
                            </span>

                          </div>
                        )}

                        {/* Plan Name */}

                        <h3 className="text-xl font-bold text-slate-900">
                          {plan.name}
                        </h3>

                        {/* Price */}

                        <div className="mt-4 flex items-baseline gap-1">

                          <span className="text-4xl font-bold text-slate-900">
                            ₹
                            {Number(
                              plan.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {billingLabel && (
                            <span className="text-sm text-slate-500">
                              {billingLabel}
                            </span>
                          )}

                        </div>

                        {/* Custom billing */}

                        {plan.billingCycle ===
                          "custom" && (
                          <p className="text-sm text-slate-500 mt-1">
                            Custom billing
                          </p>
                        )}

                        {/* Features */}

                        <div className="mt-8 space-y-3 flex-1">

                          {featureList.length >
                          0 ? (
                            featureList.map(
                              (feature) => (
                                <div
                                  key={
                                    feature
                                  }
                                  className="flex items-start gap-3"
                                >

                                  <div
                                    className="
                                      mt-0.5
                                      flex
                                      h-5
                                      w-5
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-emerald-100
                                    "
                                  >

                                    <Check
                                      className="
                                        h-3.5
                                        w-3.5
                                        text-emerald-600
                                      "
                                    />

                                  </div>

                                  <span
                                    className="
                                      text-sm
                                      text-slate-600
                                    "
                                  >
                                    {feature}
                                  </span>

                                </div>
                              )
                            )
                          ) : (
                            <p className="text-sm text-slate-400">
                              No additional
                              features listed.
                            </p>
                          )}

                        </div>

                        {/* Get Started */}

                        <Btn
                          variant={
                            isPopular
                              ? "primary"
                              : "outline"
                          }
                          onClick={() =>
                            handleBuyPlan(
                              plan
                            )
                          }
                          disabled={
                            loadingPlan ===
                            planIdentifier
                          }
                          className="w-full justify-center mt-8"
                        >
                          {loadingPlan ===
                          planIdentifier
                            ? "Processing..."
                            : "Get Started"}
                        </Btn>

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>
      </section>

      {/* ------------------------------------------------------------------
          Subscription Checkout Modal with Amazon-style Coupons
          ------------------------------------------------------------------ */}
      {selectedPreview && (
        <UpgradeModal
          preview={selectedPreview}
          onClose={() => setSelectedPreview(null)}
          onSuccess={() => {
            const planName = selectedPreview.newPlan.name || "";
            const planKey = selectedPreview.newPlan.key || "";
            setSelectedPreview(null);
            localStorage.setItem("pending_subscription_plan", planName);
            localStorage.setItem("pending_subscription_plan_key", planKey);
            if (onNav) {
              onNav("register");
            } else {
              window.location.href = getCrmUrl("/register");
            }
          }}
        />
      )}
    </div>
  );
}