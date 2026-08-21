import React from 'react';
import { Users, Target, Heart, TrendingUp } from 'lucide-react';
import Footer from '../../../components/common/Footer';
import PublicNavbar from '../../../components/common/PublicNavbar';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="px-8 py-20 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Empowering Indian <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Businesses</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
          We started Smart Bill with a simple mission: to make billing and inventory management effortless for every small and medium business in India.
        </p>
      </section>

      {/* Stats */}
      <section className="px-8 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: "Active Businesses", value: "100+", icon: <Users className="w-5 h-5 text-blue-600" /> },
            { label: "Invoices Processed", value: "10K+", icon: <TrendingUp className="w-5 h-5 text-indigo-600" /> },
            { label: "Cities Reached", value: "25+", icon: <Target className="w-5 h-5 text-emerald-600" /> },
            { label: "Customer Satisfaction", value: "99%", icon: <Heart className="w-5 h-5 text-rose-600" /> },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="px-8 py-20 bg-white border-y border-slate-200 flex-1">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Back in 2024, we noticed that local merchants were spending hours every day managing their books, writing manual invoices, and struggling to keep track of their inventory. Existing software was either too complex, designed for giant enterprises, or too expensive.
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            We built Smart Bill to bridge this gap. We wanted a product that a shop owner could learn in 5 minutes, yet powerful enough to handle GST compliance, deep inventory analytics, and multi-user roles without breaking a sweat.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Today, Smart Bill is trusted by thousands of businesses across the country. But we feel like we are just getting started. Our vision is to build the ultimate financial operating system for the modern Indian business.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
