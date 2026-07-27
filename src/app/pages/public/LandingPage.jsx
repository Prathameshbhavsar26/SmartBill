import { useState } from "react";
import {
  ArrowRight,
  BarChart2,
  BarChart3,
  Check,
  ChevronDown,
  Menu,
  Phone,
  Receipt,
  Shield,
  Star,
  X,
  Zap,
} from "lucide-react";
import { FEATURES, PLANS, TESTIMONIALS } from "../../constants/landing";
import { Btn, Card } from "../../components/common/ui";

export default function LandingPage({ onNav }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Smart Bill</span>
          </div>
          <div className="hidden md:flex items-center gap-6 flex-1">
            {["Features", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Btn variant="ghost" onClick={() => onNav("login")}>
              Sign In
            </Btn>
            <Btn variant="primary" onClick={() => onNav("register")}>
              Start Free Trial
            </Btn>
          </div>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden ml-auto text-slate-600"
          >
            {mobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 px-6 py-4 space-y-3 bg-white">
            {["Features", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="block text-sm text-slate-700 py-1.5"
              >
                {l}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => onNav("login")}
                className="flex-1"
              >
                Sign In
              </Btn>
              <Btn
                variant="primary"
                onClick={() => onNav("register")}
                className="flex-1"
              >
                Try Free
              </Btn>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            {/* <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs text-blue-700 font-medium mb-6">
              <Zap className="w-3 h-3" />
            </div> */}
            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              Run your entire business
              <br />
              <span className="text-blue-600">smarter & faster</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">
              Invoicing, inventory, GST filing, purchase orders, and financial
              reports — everything your business needs in one powerful platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Btn
                variant="primary"
                size="lg"
                onClick={() => onNav("register")}
                icon={<ArrowRight className="w-4 h-4" />}
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

      {/* Trust Bar */}
      <section className="hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {/* Trusted by logos removed */}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Everything you need to run your business
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Powerful tools built for Indian businesses — from solo traders to
              enterprise chains.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-slate-50">
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
                  onClick={() => onNav("register")}
                  className="w-full justify-center"
                >
                  Get Started
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              What our customers say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {t.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
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
              onClick={() => onNav("register")}
            >
              Start Free Trial
            </Btn>
            <button className="text-blue-200 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">Smart Bill</span>
            </div>
            <p className="text-xs leading-relaxed">
              India's most trusted billing and inventory management platform.
            </p>
          </div>
          {[
            ["Product", ["Features", "Pricing", "Changelog", "Roadmap"]],
            ["Company", ["About", "Blog", "Careers", "Press"]],
            ["Support", ["Help Center", "API Docs", "Status", "Contact"]],
          ].map(([t, links]) => (
            <div key={t}>
              <p className="font-semibold text-white text-sm mb-2">{t}</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2"></div>
      </footer>
    </div>
  );
}
