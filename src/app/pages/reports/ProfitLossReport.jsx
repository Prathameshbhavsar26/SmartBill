import React, { useMemo } from "react";
import FilterBar from "./components/FilterBar";
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
} from "recharts";
import ReportCard from "./components/ReportCard";
import { Card } from "../../components/common/ui";
import { useReportData } from "./useReportData";
import { useReportFilters } from "./useReportFilters";
import { fmt } from "../../utils/format";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function ProfitLossReport() {
  const { from, to, setFrom, setTo, appliedRange, apply } = useReportFilters();
  const { filteredOrders, filteredExpenses, filteredPurchases, loading } = useReportData(
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
    const totalPurchases = filteredPurchases.reduce(
      (s, p) => s + (Number(p.totalAmount) || 0),
      0
    );
    const totalOutflow = totalExpenses + totalPurchases;
    const grossProfit = totalRevenue - totalPurchases;
    const netProfit = totalRevenue - totalOutflow;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, totalPurchases, totalOutflow, grossProfit, netProfit, margin };
  }, [filteredOrders, filteredExpenses, filteredPurchases]);

  // Monthly Income & Expense data
  const plData = useMemo(() => {
    const monthsMap = {};
    MONTH_NAMES.forEach((m) => {
      monthsMap[m] = { month: m, revenue: 0, expenses: 0, purchases: 0, totalOutflow: 0 };
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
        monthsMap[m].totalOutflow += Number(e.amount) || 0;
      }
    });

    filteredPurchases.forEach((p) => {
      const dateObj = new Date(p.purchaseDate || p.createdAt || p.date);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        monthsMap[m].purchases += Number(p.totalAmount) || 0;
        monthsMap[m].totalOutflow += Number(p.totalAmount) || 0;
      }
    });

    return MONTH_NAMES.map((m) => monthsMap[m]);
  }, [filteredOrders, filteredExpenses, filteredPurchases]);

  // Category breakdown for expenses
  const expenseCats = useMemo(() => {
    const catMap = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
    });

    if (derived.totalPurchases > 0) {
      catMap["Inventory Purchases"] = derived.totalPurchases;
    }

    const items = Object.entries(catMap).map(([name, v]) => ({ name, v }));
    items.sort((a, b) => b.v - a.v);

    return items;
  }, [filteredExpenses, derived.totalPurchases]);

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
      <FilterBar
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onApply={apply}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            value: fmt(derived.totalRevenue),
            label: "Total Sales Revenue",
            sub: `${filteredOrders.length} orders`,
            trend: "up",
          },
          {
            value: fmt(derived.totalOutflow),
            label: "Total Cost & Outflow",
            sub: `Purchases: ${fmt(derived.totalPurchases)}`,
            trend: "down",
          },
          {
            value: fmt(derived.grossProfit),
            label: "Gross Profit",
            sub: "Revenue minus purchases",
            trend: derived.grossProfit >= 0 ? "up" : "down",
          },
          {
            value: fmt(derived.netProfit),
            label: "Net Profit / Loss",
            sub: `${derived.margin.toFixed(1)}% profit margin`,
            trend: derived.netProfit >= 0 ? "up" : "down",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xl font-bold text-slate-900 font-mono">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">{s.label}</p>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                s.trend === "up" ? "text-emerald-600" : "text-rose-600"
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

      {/* Income vs Outflow Chart */}
      <ReportCard className="p-5">
        <h3 className="font-semibold text-slate-900 mb-5">
          Monthly Revenue vs Outflow (Expenses & Purchases)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={plData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v) => [fmt(v)]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#2563EB"
              fillOpacity={1}
              fill="url(#colorRev)"
            />
            <Area
              type="monotone"
              dataKey="totalOutflow"
              name="Outflow"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorExp)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ReportCard>

      {/* Expense & Cost Breakdown */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Outflow Breakdown</h3>
        <div className="space-y-3">
          {expenseCats.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No outflow data recorded.
            </p>
          ) : (
            expenseCats.map((cat) => {
              const pct = derived.totalOutflow > 0 ? (cat.v / derived.totalOutflow) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{cat.name}</span>
                    <span className="font-mono text-slate-900">
                      {fmt(cat.v)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
