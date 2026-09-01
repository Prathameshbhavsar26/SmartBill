import React from 'react';
import { FileText, PieChart, Box, ShieldCheck, ArrowRight, Zap, CheckCircle2, BellRing } from 'lucide-react';

import PublicNavbar from "@shared/components/common/PublicNavbar";
import { Link } from 'react-router-dom';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar (Minimal) */}
      <PublicNavbar />

      {/* Hero */}
      <section className="px-8 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> Supercharge Your Business
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">run your business</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          From powerful invoicing to real-time inventory tracking, Smart Bill gives you the tools to manage and grow your operations with confidence.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95 flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="px-8 pb-32 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Large */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-48 h-48 text-blue-600" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Lightning-Fast Invoicing</h3>
              <p className="text-slate-600 leading-relaxed max-w-md mb-8">
                Create and send professional invoices in seconds. Automate payment reminders and get paid faster with integrated payment gateways.
              </p>
              <ul className="space-y-3">
                {['Custom branding & templates', 'Recurring billing', 'One-click estimates to invoices'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>


          {/* Feature 3: Medium */}
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
              <Box className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Inventory Sync</h3>
            <p className="text-slate-600 leading-relaxed">
              Track stock levels in real-time across multiple locations. Get low-stock alerts and auto-update inventory when sales are made.
            </p>
          </div>

          {/* Feature 4: Medium (New Inventory Feature) */}
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
              <BellRing className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Smart Stock Alerts</h3>
            <p className="text-slate-600 leading-relaxed">
              Never run out of your best-selling items. Set custom thresholds and receive automated low-stock notifications and reorder suggestions instantly.
            </p>
          </div>

          {/* Feature 5: Large */}
          <div className="lg:col-span-2 bg-[#0f172a] rounded-3xl p-10 border border-slate-800 shadow-lg relative overflow-hidden text-white">
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                <PieChart className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Actionable Insights</h3>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Make data-driven decisions with real-time dashboards. Track revenue, monitor expenses, and identify your best-selling products instantly.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400 mb-1">Revenue</div>
                  <div className="font-bold text-lg text-emerald-400">↑ 24%</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400 mb-1">Expenses</div>
                  <div className="font-bold text-lg text-amber-400">↓ 12%</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400 mb-1">Profit</div>
                  <div className="font-bold text-lg text-blue-400">↑ 36%</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


    </div>
  );
}



