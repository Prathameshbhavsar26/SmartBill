import React, { useMemo, useState } from "react";
import ReportFilters from "./components/ReportFilters";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
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
import { Card } from "../../components/common/ui";
import { useReportData } from "./useReportData";
import { fmt } from "../../utils/format";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function ProfitLossReport() {
  const [appliedRange, setAppliedRange] = useState({ from: "2024-01-01", to: "2026-12-31" });
  const { filteredOrders, filteredExpenses, loading } = useReportData(
    appliedRange.from,
    appliedRange.to
  );

  const derived = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (s, o) => s + (Number(o.totalOrderValue || o.total) || 0),
      0
    );
    const totalExpenses = filteredExpenses.reduce(
      (s, e) => s + (Number(e.amount) || 0),
      0
    );
    const grossProfit = Math.max(0, totalRevenue - totalExpenses * 0.3);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, grossProfit, netProfit, margin };
  }, [filteredOrders, filteredExpenses]);

  // Monthly Income & Expense data
  const plData = useMemo(() => {
    const monthsMap = {};
    MONTH_NAMES.forEach((m) => {
      monthsMap[m] = { month: m, revenue: 0, expenses: 0 };
    });

    filteredOrders.forEach((o) => {
      const dateObj = new Date(o.createdAt || o.date);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        monthsMap[m].revenue += Number(o.totalOrderValue || o.total) || 0;
      }
    });

    filteredExpenses.forEach((e) => {
      const dateObj = new Date(e.date || e.createdAt);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        monthsMap[m].expenses += Number(e.amount) || 0;
      }
    });

    return MONTH_NAMES.map((m) => monthsMap[m]);
  }, [filteredOrders, filteredExpenses]);

  // Category breakdown for expenses
  const expenseCats = useMemo(() => {
    const catMap = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
    });

    const items = Object.entries(catMap).map(([name, v]) => ({ name, v }));
    items.sort((a, b) => b.v - a.v);

    return items;
  }, [filteredExpenses]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading Profit & Loss statement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ReportFilters onAppliedRangeChange={setAppliedRange} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            value: fmt(derived.totalRevenue),
            label: "Total Income / Revenue",
            sub: `${filteredOrders.length} orders`,
            trend: "up",
          },
          {
            value: fmt(derived.totalExpenses),
            label: "Total Expenses",
            sub: `${filteredExpenses.length} expenses`,
            trend: "up",
          },
          {
            value: fmt(derived.grossProfit),
            label: "Gross Profit",
            sub: "Estimated Gross",
            trend: "up",
          },
          {
            value: fmt(derived.netProfit),
            label: "Net Profit",
            sub: derived.netProfit >= 0 ? "Profitable" : "Loss",
            trend: derived.netProfit >= 0 ? "up" : "down",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xl font-bold text-slate-900 font-mono">{s.value}</p>
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

      {/* Monthly Profit Trend & Income vs Expense Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">
            Monthly Net Profit Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v) => [fmt(v), "Profit"]}
              />
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
          <h3 className="font-semibold text-slate-900 mb-5">
            Income vs Expense Comparison
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v) => [fmt(v), ""]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Income"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#F43F5E"
                strokeWidth={2.2}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>

      {/* Expense Categories Breakdown */}
      <ReportCard className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-5">
              Expense Categories Breakdown
            </h3>
            {expenseCats.length === 0 ? (
              <p className="text-xs text-slate-500 py-10 text-center">
                No expense entries logged for this period.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={expenseCats} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v) => [fmt(v), "Expense"]}
                  />
                  <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Net Profit Margin
              </p>
              <p className="mt-2 text-3xl font-extrabold text-purple-600 font-mono">
                {derived.margin.toFixed(2)}%
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Real-time margin calculated from database transactions.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {expenseCats.slice(0, 5).map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-mono font-medium text-slate-900">
                    {fmt(c.v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReportCard>
    </div>
  );
}
