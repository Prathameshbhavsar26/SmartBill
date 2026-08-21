import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

import PublicNavbar from '../../../components/common/PublicNavbar';
import { Link } from 'react-router-dom';

export default function StatusPage() {
  const systems = [
    { name: "API & Webhooks", status: "operational", uptime: "99.99%" },
    { name: "Web Application", status: "operational", uptime: "99.99%" },
    { name: "Mobile App Backend", status: "operational", uptime: "100.00%" },
    { name: "Billing & Subscriptions", status: "operational", uptime: "99.98%" },
    { name: "Email Delivery", status: "degraded", uptime: "98.50%" },
  ];

  const incidents = [
    { 
      date: "Aug 15, 2026", 
      title: "Delayed Email Delivery", 
      status: "Resolved", 
      desc: "We identified and resolved an issue causing delayed email delivery for invoice receipts. All queued emails have now been sent."
    },
    { 
      date: "Jul 22, 2026", 
      title: "Brief API Outage", 
      status: "Resolved", 
      desc: "A database configuration change caused a brief 5-minute outage for our core API. We have rolled back the change and implemented additional safeguards."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      {/* Header */}
      <section className="px-8 py-12 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">System Status</h1>
        
        <div className="bg-emerald-500 rounded-2xl p-6 flex items-center gap-4 text-white shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">All Systems Operational</h2>
            <p className="text-emerald-50 font-medium">Last updated just now.</p>
          </div>
        </div>
      </section>

      {/* Systems Status */}
      <section className="px-8 pb-16 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {systems.map((sys, idx) => (
            <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="font-semibold text-slate-900">{sys.name}</div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-500 font-mono">{sys.uptime} uptime</span>
                {sys.status === 'operational' ? (
                  <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Operational
                  </span>
                ) : sys.status === 'degraded' ? (
                  <span className="flex items-center gap-2 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                    Degraded
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">
                    <XCircle className="w-4 h-4" />
                    Outage
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Incidents */}
      <section className="px-8 pb-24 max-w-4xl mx-auto w-full flex-1">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Past Incidents</h2>
        <div className="space-y-6">
          {incidents.map((inc, idx) => (
            <div key={idx} className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-200 last:before:hidden">
              <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-slate-50"></div>
              <div className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> {inc.date}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{inc.title}</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">{inc.status}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{inc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
