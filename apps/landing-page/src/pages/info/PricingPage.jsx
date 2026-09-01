import React, { useState } from 'react';
import { Check } from 'lucide-react';

import PublicNavbar from "@shared/components/common/PublicNavbar";
import { Link, useNavigate } from 'react-router-dom';
import { PLANS } from '@shared/constants/landing';
import { Btn } from "@shared/components/common/ui";
import subscriptionAPI from "@shared/api/subscriptionAPI";

export default function PricingPage() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleBuyPlan = async (plan) => {
    try {
      setLoadingPlan(plan.name);
      const res = await subscriptionAPI.createOrder(plan.name);
      const razorpayKey = res.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TPCMQcPRZqe62i";

      const executePaymentVerification = async (payload) => {
        try {
          const verifyRes = await subscriptionAPI.verifyPayment(payload);
          localStorage.setItem("pending_subscription_plan", plan.name);
          alert(`✓ ${verifyRes.message || "Payment successful! Welcome to " + plan.name + " plan."}`);
          navigate("/register");
        } catch (err) {
          alert("Payment verification error: " + (err.message || err.response?.data?.message || "Unknown error"));
        } finally {
          setLoadingPlan(null);
        }
      };


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
        if (typeof window.Razorpay === "undefined") {
          throw new Error("Razorpay SDK not loaded");
        }
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (rzpErr) {
        console.error("Razorpay SDK modal error:", rzpErr);
        alert("Failed to load payment gateway. Please make sure you are connected to the internet and try again.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Could not start payment process: " + (error.message || error.response?.data?.message || "Unknown error"));
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <section id="pricing" className="py-20 px-6 bg-slate-50 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500">
              Start free for 14 days. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 p-8 relative ${plan.color} ${plan.badge ? "shadow-lg shadow-blue-100" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="font-bold text-slate-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Btn
                  variant={plan.badge ? "primary" : "outline"}
                  onClick={() => handleBuyPlan(plan)}
                  disabled={loadingPlan === plan.name}
                  className="w-full justify-center"
                >
                  {loadingPlan === plan.name ? "Processing..." : "Get Started"}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}



