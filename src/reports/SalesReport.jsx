import React, { useMemo } from "react";
import ReportFilters from "./components/ReportFilters";

import {

  ArrowUpRight,
  Printer,
  Download,
  TrendingUp,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

import ReportCard from "./components/ReportCard";
import { Card } from "./uiExports";



const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const salesData = [
  { month: "Jan", sales: 145000, purchases: 89000, profit: 56000 },
  { month: "Feb", sales: 178000, purchases: 102000, profit: 76000 },
  { month: "Mar", sales: 162000, purchases: 95000, profit: 67000 },
  { month: "Apr", sales: 210000, purchases: 118000, profit: 92000 },
  { month: "May", sales: 195000, purchases: 110000, profit: 85000 },
  { month: "Jun", sales: 248000, purchases: 135000, profit: 113000 },
  { month: "Jul", sales: 231000, purchases: 128000, profit: 103000 },
  { month: "Aug", sales: 267000, purchases: 142000, profit: 125000 },
];

const expenses = [
  { id: 1, category: "Rent", amount: 45000 },
  { id: 2, category: "Utilities", amount: 8200 },
  { id: 3, category: "Salaries", amount: 125000 },
  { id: 4, category: "Marketing", amount: 15000 },
  { id: 5, category: "Logistics", amount: 12400 },
];

const invoices = [
  {
    id: "INV-2024-1042",
    customer: "Raj Enterprises",
    date: "2024-08-14",
    amount: 28750,
    gst: 5175,
    total: 33925,
    status: "Paid",
  },
  {
    id: "INV-2024-1041",
    customer: "Mehta Traders",
    date: "2024-08-13",
    amount: 12400,
    gst: 2232,
    total: 14632,
    status: "Pending",
  },
  {
    id: "INV-2024-1040",
    customer: "Gupta Wholesale",
    date: "2024-08-12",
    amount: 67800,
    gst: 12204,
    total: 80004,
    status: "Paid",
  },
  {
    id: "INV-2024-1039",
    customer: "Sharma & Sons",
    date: "2024-08-11",
    amount: 5600,
    gst: 1008,
    total: 6608,
    status: "Overdue",
  },
  {
    id: "INV-2024-1038",
    customer: "Singh Distributors",
    date: "2024-08-10",
    amount: 19200,
    gst: 3456,
    total: 22656,
    status: "Paid",
  },
];

const topProducts = [
  { name: "Boult Audio Airbus", qty: 48, revenue: 335520 },
  { name: "Denim Jeans (32)", qty: 76, revenue: 114000 },
  { name: "Basmati Rice Premium 5kg", qty: 8, revenue: 4160 },
  { name: "Zeronics Mouse", qty: 22, revenue: 98978 },
];

export default function SalesReport() {
  const derived = useMemo(() => {

    const totalRevenue = salesData.reduce((s, d) => s + d.sales, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = salesData.reduce((s, d) => s + d.profit, 0);
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      margin,
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap"></div>

      <ReportFilters />


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            value: fmt(derived.totalRevenue),
            label: "Total Revenue",
            sub: "+12% this month",
            trend: "up",
          },
          {
            value: fmt(derived.totalExpenses),
            label: "Total Expenses",
            sub: "+3% this month",
            trend: "up",
          },
          {
            value: fmt(derived.netProfit),
            label: "Net Profit",
            sub: "+24% this month",
            trend: "up",
          },
          {
            value: `${derived.margin.toFixed(1)}%`,
            label: "Profit Margin",
            sub: "+5% this month",
            trend: "up",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">{s.label}</p>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                s.trend === "up" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {s.trend === "up" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {s.sub}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Monthly Revenue Trend</h3>
            <div className="flex gap-2">
              {[
                "2024",
                "2023",
              ].map((y) => (
                <button
                  key={y}
                  className={`text-xs px-2.5 py-1 rounded-lg ${y === "2024" ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="repSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#repSales)"
                name="Sales"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={2}
                fill="none"
                name="Profit"
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={expenses.map((e) => ({ name: e.category, v: e.amount }))}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
              />
              <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenses.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{e.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(e.amount / 125000) * 100}%` }} />
                  </div>
                  <span className="font-mono font-medium text-slate-900 w-20 text-right">{fmt(e.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </ReportCard>
      </div>

      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Top selling products</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topProducts.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold">Qty {p.qty}</span>
              </div>
              <p className="text-sm text-slate-600">Revenue</p>
              <p className="text-lg font-bold text-slate-900">{fmt(p.revenue)}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Recent transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Invoice",
                  "Customer",
                  "Date",
                  "Amount",
                  "GST",
                  "Total",
                  "Status",
                ].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-600">{inv.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{inv.customer}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{inv.date}</td>
                  <td className="px-5 py-3.5 text-slate-900">{fmt(inv.amount)}</td>
                  <td className="px-5 py-3.5 text-slate-600">{fmt(inv.gst)}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{fmt(inv.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>
    </div>
  );
}

