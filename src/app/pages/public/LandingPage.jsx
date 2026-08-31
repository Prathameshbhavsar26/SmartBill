import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import Footer from "../../components/common/Footer";
import PublicNavbar from "../../components/common/PublicNavbar";

import subscriptionAPI from "../../api/subscriptionAPI";

import {
  ArrowRight,
  Check,
  Phone,
} from "lucide-react";

import { FEATURES } from "../../constants/landing";
import {
  Btn,
  Card,
} from "../../components/common/ui";


/*
|--------------------------------------------------------------------------
| Backend feature key -> Frontend display label
|--------------------------------------------------------------------------
*/

const FEATURE_LABELS = {
  basicReports: "Basic Reports",
  emailSupport: "Email Support",
  advancedReports: "Advanced Reports",
  gstFiling: "GST Filing",
  prioritySupport: "Priority Support",
  barcodeScanner: "Barcode Scanner",
  apiAccess: "API Access",
  customIntegrations: "Custom Integrations",
  dedicatedManager: "Dedicated Manager",
};


/*
|--------------------------------------------------------------------------
| Landing Page
|--------------------------------------------------------------------------
*/

export default function LandingPage({ onNav }) {

  /*
  |--------------------------------------------------------------------------
  | Subscription plans
  |--------------------------------------------------------------------------
  */

  const [plans, setPlans] = useState([]);

  const [plansLoading, setPlansLoading] =
    useState(true);

  const [plansError, setPlansError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Currently selected plan
  |--------------------------------------------------------------------------
  */

  const [loadingPlan, setLoadingPlan] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | Fetch subscription plans
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | subscriptionAPI.getPublicPlans()
  | uses the PUBLIC axios instance.
  |
  | This means returning to this page after login/register
  | will not be affected by the authenticated axiosClient.
  |
  */

  const fetchPlans = useCallback(
    async () => {

      let cancelled = false;

      try {

        setPlansLoading(true);
        setPlansError("");

        const response =
          await subscriptionAPI.getPublicPlans();


        /*
        |--------------------------------------------------------------------------
        | Validate API response
        |--------------------------------------------------------------------------
        */

        if (
          response?.success === true &&
          Array.isArray(response?.data)
        ) {

          if (!cancelled) {

            setPlans(response.data);
            setPlansError("");

          }

          return;
        }


        /*
        |--------------------------------------------------------------------------
        | Invalid API response
        |--------------------------------------------------------------------------
        */

        if (!cancelled) {

          setPlansError(
            "Unable to load subscription plans."
          );

        }

      } catch (error) {

        console.error(
          "Failed to load subscription plans:",
          error
        );


        if (!cancelled) {

          /*
          |--------------------------------------------------------------------------
          | Keep existing plans if a refresh fails.
          |
          | This is important.
          |
          | Previously we were doing:
          |
          | setPlans([])
          |
          | That makes the pricing section disappear whenever
          | one request temporarily fails.
          |--------------------------------------------------------------------------
          */

          setPlansError(
            error?.response?.data?.message ||
            (
              error?.code === "ECONNABORTED"
                ? "Subscription plans are taking too long to load."
                : "Unable to load subscription plans."
            )
          );

        }

      } finally {

        if (!cancelled) {
          setPlansLoading(false);
        }

      }

      return () => {
        cancelled = true;
      };

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | Load plans whenever LandingPage mounts
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let active = true;

    const loadPlans = async () => {

      try {

        setPlansLoading(true);
        setPlansError("");

        const response =
          await subscriptionAPI.getPublicPlans();


        if (!active) {
          return;
        }


        if (
          response?.success === true &&
          Array.isArray(response?.data)
        ) {

          setPlans(response.data);
          setPlansError("");

        } else {

          setPlansError(
            "Unable to load subscription plans."
          );

        }

      } catch (error) {

        if (!active) {
          return;
        }

        console.error(
          "Failed to load subscription plans:",
          error
        );


        setPlansError(
          error?.response?.data?.message ||
          (
            error?.code === "ECONNABORTED"
              ? "Subscription plans are taking too long to load."
              : "Unable to load subscription plans."
          )
        );

      } finally {

        if (active) {
          setPlansLoading(false);
        }

      }

    };


    loadPlans();


    return () => {

      active = false;

    };

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Select subscription plan
  |--------------------------------------------------------------------------
  */

  const handleBuyPlan = (plan) => {

    try {

      if (!plan) {
        return;
      }


      const planIdentifier =
        plan.key ||
        plan.name ||
        "";


      setLoadingPlan(planIdentifier);


      /*
      |--------------------------------------------------------------------------
      | Save plan name
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "pending_subscription_plan",
        plan.name || ""
      );


      /*
      |--------------------------------------------------------------------------
      | Save stable backend plan key
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "pending_subscription_plan_key",
        plan.key || ""
      );


      /*
      |--------------------------------------------------------------------------
      | Navigate to registration
      |--------------------------------------------------------------------------
      */

      onNav("register");


    } catch (error) {

      console.error(
        "Plan selection failed:",
        error
      );


      alert(
        "Could not select this plan. Please try again."
      );


      setLoadingPlan(null);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Retry loading plans
  |--------------------------------------------------------------------------
  */

  const handleRetryPlans = async () => {

    try {

      setPlansError("");
      setPlansLoading(true);


      const response =
        await subscriptionAPI.getPublicPlans();


      if (
        response?.success === true &&
        Array.isArray(response?.data)
      ) {

        setPlans(response.data);
        setPlansError("");

      } else {

        setPlansError(
          "Unable to load subscription plans."
        );

      }

    } catch (error) {

      console.error(
        "Retry subscription plans failed:",
        error
      );


      setPlansError(
        error?.response?.data?.message ||
        (
          error?.code === "ECONNABORTED"
            ? "Subscription plans are taking too long to load."
            : "Unable to load subscription plans."
        )
      );

    } finally {

      setPlansLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | Convert backend feature object into readable list
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
  | Billing cycle display
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
  | Render
  |--------------------------------------------------------------------------
  */

  return (

    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >

      {/* ================================================================
          Navbar
      ================================================================= */}

      <PublicNavbar />


      {/* ================================================================
          Hero
      ================================================================= */}

      <section className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-16 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl mx-auto text-center mb-12">

            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-5">

              Run your entire business

              <br />

              <span className="text-blue-600">
                smarter & faster
              </span>

            </h1>


            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">

              Invoicing, inventory, GST filing, purchase orders,
              and financial reports — everything your business
              needs in one powerful platform.

            </p>


            <div className="flex flex-wrap items-center justify-center gap-4">

              <Btn
                variant="primary"
                size="lg"
                onClick={() =>
                  onNav("register")
                }
                icon={
                  <ArrowRight className="w-4 h-4" />
                }
              >
                Start 14-Day Free Trial
              </Btn>

            </div>


            <p className="text-xs text-slate-400 mt-6 leading-tight">

              No credit card required · Cancel anytime

            </p>

          </div>

        </div>

      </section>


      {/* ================================================================
          Features
      ================================================================= */}

      <section
        id="features"
        className="py-4 px-6 bg-white"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">

              Features

            </p>


            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">

              Everything you need to run your business

            </h2>


            <p className="text-slate-500 max-w-xl mx-auto">

              Powerful tools built for Indian businesses —
              from solo traders to enterprise chains.

            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {FEATURES.map((feature) => (

              <Card
                key={feature.title}
                className="p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
              >

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
                >

                  <feature.icon className="w-5 h-5" />

                </div>


                <h3 className="font-semibold text-slate-900 mb-2">

                  {feature.title}

                </h3>


                <p className="text-sm text-slate-500 leading-relaxed">

                  {feature.desc}

                </p>

              </Card>

            ))}

          </div>

        </div>

      </section>


      {/* ================================================================
          Pricing
      ================================================================= */}

      <section
        id="pricing"
        className="py-20 px-6 bg-slate-50"
      >

        <div className="max-w-7xl mx-auto">

          {/* Pricing heading */}

          <div className="text-center mb-14">

            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">

              Pricing

            </p>


            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">

              Choose the right plan for your business

            </h2>


            <p className="text-slate-500 max-w-xl mx-auto">

              Flexible subscription plans designed to
              grow with your business.

            </p>

          </div>


          {/* ============================================================
              Loading
          ============================================================ */}

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


          {/* ============================================================
              Error
          ============================================================ */}

          {!plansLoading &&
            plansError &&
            plans.length === 0 && (

              <div className="text-center py-16">

                <p className="text-red-600 mb-4">

                  {plansError}

                </p>


                <button
                  type="button"
                  onClick={handleRetryPlans}
                  disabled={plansLoading}
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
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  Try Again

                </button>

              </div>

            )}


          {/* ============================================================
              Plans
          ============================================================ */}

          {!plansLoading &&
            plans.length > 0 && (

              <>

                {/* Small refresh error */}

                {plansError && (

                  <div className="text-center mb-6">

                    <p className="text-sm text-red-600 mb-2">

                      {plansError}

                    </p>


                    <button
                      type="button"
                      onClick={handleRetryPlans}
                      className="
                        text-sm
                        font-semibold
                        text-blue-600
                        hover:text-blue-700
                      "
                    >

                      Retry

                    </button>

                  </div>

                )}


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

                  {plans.map((plan, index) => {

                    const featureList =
                      getFeatureList(plan);


                    const hasProPlan =
                      plans.some(
                        (item) =>
                          item.name?.toLowerCase() ===
                          "pro"
                      );


                    const isPopular =
                      plan.name?.toLowerCase() ===
                        "pro" ||
                      (
                        !hasProPlan &&
                        index === 1
                      );


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

                        {/* Popular */}

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


                        {/* Plan name */}

                        <h3 className="text-xl font-bold text-slate-900">

                          {plan.name}

                        </h3>


                        {/* Price */}

                        <div className="mt-4 flex items-baseline gap-1">

                          <span className="text-4xl font-bold text-slate-900">

                            ₹
                            {Number(
                              plan.price || 0
                            ).toLocaleString("en-IN")}

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

                          {featureList.length > 0 ? (

                            featureList.map(
                              (feature) => (

                                <div
                                  key={feature}
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

                              No additional features listed.

                            </p>

                          )}

                        </div>


                        {/* Get Started */}

                        <button
                          type="button"
                          disabled={
                            loadingPlan ===
                            planIdentifier
                          }
                          onClick={() =>
                            handleBuyPlan(plan)
                          }
                          className={`
                            mt-8
                            w-full
                            rounded-lg
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            transition
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                            ${
                              isPopular
                                ? `
                                  bg-blue-600
                                  text-white
                                  hover:bg-blue-700
                                `
                                : `
                                  border
                                  border-slate-300
                                  bg-white
                                  text-slate-900
                                  hover:bg-slate-50
                                `
                            }
                          `}
                        >

                          {loadingPlan ===
                          planIdentifier

                            ? "Please wait..."

                            : "Get Started"}

                        </button>

                      </div>

                    );

                  })}

                </div>

              </>

            )}


          {/* ============================================================
              No plans
          ============================================================ */}

          {!plansLoading &&
            !plansError &&
            plans.length === 0 && (

              <div className="text-center py-16">

                <p className="text-slate-600">

                  No subscription plans are currently available.

                </p>

              </div>

            )}

        </div>

      </section>


      {/* ================================================================
          CTA
      ================================================================= */}

      <section className="py-20 px-6 bg-blue-600">

        <div className="max-w-2xl mx-auto text-center">

          <h2 className="text-3xl font-extrabold text-white mb-4">

            Ready to transform your business?

          </h2>


          <p className="text-blue-100 mb-8">

            Join 50,000+ businesses already using BillTrack Pro.

          </p>


          <div className="flex flex-wrap gap-4 justify-center">

            <Btn
              variant="secondary"
              size="lg"
              onClick={() =>
                onNav("register")
              }
            >

              Start Free Trial

            </Btn>


            <button
              type="button"
              className="
                text-blue-200
                hover:text-white
                text-sm
                font-medium
                transition-colors
                flex
                items-center
                gap-2
              "
            >

              <Phone className="w-4 h-4" />

              Talk to Sales

            </button>

          </div>

        </div>

      </section>


      {/* ================================================================
          Footer
      ================================================================= */}

      <Footer />

    </div>

  );

}