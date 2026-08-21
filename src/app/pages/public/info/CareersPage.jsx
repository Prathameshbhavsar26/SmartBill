import React from 'react';
import { Briefcase, Laptop, HeartPulse, GraduationCap, ArrowRight } from 'lucide-react';
import Footer from '../../../components/common/Footer';
import PublicNavbar from '../../../components/common/PublicNavbar';
import { Link } from 'react-router-dom';

export default function CareersPage() {
  const perks = [
    { title: "Remote-First", icon: <Laptop className="w-6 h-6 text-blue-600" />, desc: "Work from anywhere in India. We care about output, not hours spent at a desk." },
    { title: "Comprehensive Health", icon: <HeartPulse className="w-6 h-6 text-rose-600" />, desc: "Top-tier medical insurance for you and your dependents, plus wellness stipends." },
    { title: "Continuous Learning", icon: <GraduationCap className="w-6 h-6 text-emerald-600" />, desc: "Annual budget for courses, books, and conferences to help you level up." }
  ];



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <section className="px-8 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
          We're Hiring
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Help us build the future of <span className="text-blue-600">business software</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          Join a passionate team dedicated to solving real problems for millions of merchants across India.
        </p>
      </section>

      {/* Perks */}
      <section className="px-8 py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why join Smart Bill?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {perks.map((perk, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                  {perk.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{perk.title}</h3>
                <p className="text-slate-600 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-24 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="text-center p-8 bg-slate-100 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Don't see a fit?</h3>
          <p className="text-slate-600 text-sm mb-4">We're always looking for talented people. Send us your resume.</p>
          <button className="text-blue-600 font-semibold hover:underline">prathameshbhavsar@gmail.com</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
