import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

import PublicNavbar from "@shared/components/common/PublicNavbar";
import { Link } from 'react-router-dom';

export default function BlogPage() {
  const articles = [
    { title: "5 Tips to Improve Cash Flow", category: "Finance", readTime: "5 min", date: "Aug 12, 2026", color: "from-blue-500 to-cyan-500" },
    { title: "Understanding New GST Regulations", category: "Compliance", readTime: "8 min", date: "Jul 28, 2026", color: "from-indigo-500 to-purple-500" },
    { title: "The Future of Inventory Management", category: "Productivity", readTime: "6 min", date: "Jul 15, 2026", color: "from-emerald-500 to-teal-500" },
    { title: "How to Retain B2B Customers", category: "Sales", readTime: "4 min", date: "Jun 30, 2026", color: "from-amber-500 to-orange-500" },
    { title: "Top 10 Tax Deductions for Retailers", category: "Finance", readTime: "7 min", date: "Jun 14, 2026", color: "from-rose-500 to-pink-500" },
    { title: "Automating Your Purchase Orders", category: "Productivity", readTime: "5 min", date: "May 22, 2026", color: "from-slate-600 to-slate-800" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      {/* Featured */}
      <section className="px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The Smart Bill Blog</h1>
          <p className="text-slate-600 text-lg">Insights, updates, and resources to help your business thrive.</p>
        </div>

        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col md:flex-row group cursor-pointer">
          <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-blue-600 to-indigo-600 p-8 flex items-center justify-center">
            <span className="text-white/20 font-black text-7xl tracking-tighter mix-blend-overlay uppercase">Featured</span>
          </div>
          <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-center bg-[#0f172a]">
            <div className="flex items-center gap-3 text-sm text-blue-400 font-semibold mb-4">
              <span>Product Update</span> • <span>10 min read</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">Introducing Smart Bill 2.0: AI-Powered Analytics</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We've completely reimagined our analytics dashboard to bring you real-time, AI-driven insights into your revenue, expenses, and inventory health.
            </p>
            <div className="flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all mt-auto">
              Read Article <ArrowRight className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-8 pb-24 max-w-7xl mx-auto w-full flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-8">Latest Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col">
              <div className={`h-48 bg-gradient-to-br ${article.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">{article.category}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}



