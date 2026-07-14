import React, { useMemo, useState } from "react";
import ReportFilters from "./components/ReportFilters";

import { Download, Printer, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import ReportCard from "./components/ReportCard";
import FilterBar from "./components/FilterBar";
import { Card } from "./uiExports";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const plData = [
  { month: "Jan", revenue: 145000, expenses: 89000 },
  { month: "Feb", revenue: 178000, expenses: 102000 },
  { month: "Mar", revenue: 162000, expenses: 95000 },
  { month: "Apr", revenue: 210000, expenses: 118000 },
  { month: "May", revenue: 195000, expenses: 110000 },
  { month: "Jun", revenue: 248000, expenses: 135000 },
  { month: "Jul", revenue: 231000, expenses: 128000 },
  { month: "Aug", revenue: 267000, expenses: 142000 },
];

const expenseCats = [
  { name: "Rent", v: 45000 },
  { name: "Utilities", v: 8200 },
  { name: "Salaries", v: 125000 },
  { name: "Marketing", v: 15000 },
  { name: "Logistics", v: 12400 },
];

export default function ProfitLossReport() {
  const [from, setFrom] = useState("2024-08-01");
  const [to, setTo] = useState("2024-08-31");

  const derived = useMemo(() => {
    const totalRevenue = plData.reduce((s, d) => s + d.revenue, 0);
    const totalExpenses = plData.reduce((s, d) => s + d.expenses, 0);
    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit * 0.92; // mock adjustment
    const margin = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, grossProfit, netProfit, margin };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <div className="ml-auto flex gap-2">
        
        </div>
      </div>

      <FilterBar from={from} to={to} onFromChange={setFrom} onToChange={setTo} onApply={() => {}} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { value: fmt(derived.totalRevenue), label: "Total Revenue", sub: "+10% this month", trend: "up" },
          { value: fmt(derived.totalExpenses), label: "Total Expenses", sub: "+5% this month", trend: "up" },
          { value: fmt(derived.grossProfit), label: "Gross Profit", sub: "+18% this month", trend: "up" },
          { value: fmt(derived.netProfit), label: "Net Profit", sub: "+12% this month", trend: "up" },
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
          <h3 className="font-semibold text-slate-900 mb-5">Monthly Profit Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey={(d) => d.revenue - d.expenses}
                stroke="#10B981"
                strokeWidth={2.5}
                fill="#10B981"
                fillOpacity={0.12}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Income vs Expense Chart</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={2.2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>

      <ReportCard className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-5">Expense Categories</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={expenseCats} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profit Margin</p>
              <p className="mt-2 text-3xl font-extrabold text-purple-600">{derived.margin.toFixed(2)}%</p>
              <p className="text-sm text-slate-500 mt-2">Net margin based on mock adjustments.</p>
            </div>
            <div className="mt-4 space-y-3">
              {expenseCats.slice(0, 4).map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-mono font-medium text-slate-900">{fmt(c.v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReportCard>
    </div>
  );
}

