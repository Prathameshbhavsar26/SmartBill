import React, { useMemo, useState } from "react";
import ReportFilters from "./components/ReportFilters";

import { Download, Printer, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import ReportCard from "./components/ReportCard";
import FilterBar from "./components/FilterBar";
import { Card } from "./uiExports";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const gstTrend = [
  { month: "Jan", collected: 42000, paid: 31000 },
  { month: "Feb", collected: 51000, paid: 34500 },
  { month: "Mar", collected: 47000, paid: 33000 },
  { month: "Apr", collected: 59000, paid: 36000 },
  { month: "May", collected: 56000, paid: 35500 },
  { month: "Jun", collected: 65000, paid: 41000 },
  { month: "Jul", collected: 61000, paid: 39200 },
  { month: "Aug", collected: 70000, paid: 43000 },
];

const gstBreakdown = [
  { label: "CGST", v: 24800 },
  { label: "SGST", v: 24800 },
  { label: "IGST", v: 13200 },
];

const filingStatuses = [
  { period: "Apr 2024", status: "Filed" },
  { period: "May 2024", status: "Filed" },
  { period: "Jun 2024", status: "Pending" },
  { period: "Jul 2024", status: "Pending" },
];

export default function GSTReport() {
  const [from, setFrom] = useState("2024-08-01");
  const [to, setTo] = useState("2024-08-31");

  const derived = useMemo(() => {
    const gstCollected = gstTrend.reduce((s, d) => s + d.collected, 0);
    const gstPaid = gstTrend.reduce((s, d) => s + d.paid, 0);
    const inputTaxCredit = gstPaid * 0.98;
    const gstPayable = Math.max(0, gstCollected - inputTaxCredit);

    return { gstCollected, gstPaid, inputTaxCredit, gstPayable };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap"></div>

      <FilterBar from={from} to={to} onFromChange={setFrom} onToChange={setTo} onApply={() => {}} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { value: fmt(derived.gstCollected), label: "GST Collected", sub: "+7% this month", trend: "up" },
          { value: fmt(derived.gstPaid), label: "GST Paid", sub: "+4% this month", trend: "up" },
          { value: fmt(derived.inputTaxCredit), label: "Input Tax Credit", sub: "-1% this month", trend: "down" },
          { value: fmt(derived.gstPayable), label: "GST Payable", sub: "+6% this month", trend: "up" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">{s.label}</p>
            <span className={`text-xs font-medium flex items-center gap-1 ${s.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {s.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {s.sub}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Monthly GST Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gstTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="collected" stroke="#2563EB" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="paid" stroke="#10B981" strokeWidth={2.2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Tax Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gstBreakdown} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>

      <ReportCard className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h3 className="font-semibold text-slate-900 mb-5">GST Summary Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Metric", "Value"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    ["GST Collected", derived.gstCollected],
                    ["GST Paid", derived.gstPaid],
                    ["Input Tax Credit", derived.inputTaxCredit],
                    ["GST Payable", derived.gstPayable],
                  ].map(([m, v]) => (
                    <tr key={m} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-900 font-medium">{m}</td>
                      <td className="px-5 py-3.5 text-slate-700 font-mono">{fmt(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-5">GST Filing Status</h3>
            <div className="space-y-3">
              {filingStatuses.map((s) => (
                <div key={s.period} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.period}</p>
                    <p className="text-xs text-slate-500">Return Type: GSTR-3B</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${s.status === "Filed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReportCard>

      <div className="hidden">{/* reserved for future table/chart */}</div>
    </div>
  );
}

