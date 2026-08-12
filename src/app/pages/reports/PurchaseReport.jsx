import React, { useMemo, useState } from "react";
import ReportFilters from "./components/ReportFilters";
import { ArrowUpRight, ArrowDownRight, Loader2, ShoppingCart } from "lucide-react";
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
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";
import ReportCard from "./components/ReportCard";
import { Card } from "../../components/common/ui";
import { useReportData } from "./useReportData";
import { fmt } from "../../utils/format";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function PurchaseReport() {
  const [appliedRange, setAppliedRange] = useState({ from: "2024-01-01", to: "2026-12-31" });
  const { suppliers, products, filteredExpenses, loading } = useReportData(
    appliedRange.from,
    appliedRange.to
  );

  const derived = useMemo(() => {
    const totalPurchases = suppliers.reduce(
      (sum, s) => sum + (Number(s.totalPurchases) || 0),
      0
    );
    const supplierPayments = suppliers.reduce(
      (sum, s) => sum + (Number(s.amountPaid) || 0),
      0
    );
    const pendingPayments = suppliers.reduce(
      (sum, s) => sum + (Number(s.balanceDue) || 0),
      0
    );
    const purchaseOrders = suppliers.length;

    return {
      totalPurchases,
      purchaseOrders,
      supplierPayments,
      pendingPayments,
    };
  }, [suppliers]);

  // Monthly Purchase Trend based on filtered expenses / supplier additions
  const purchaseTrend = useMemo(() => {
    const monthsMap = {};
    MONTH_NAMES.forEach((m) => {
      monthsMap[m] = { month: m, purchases: 0, orders: 0 };
    });

    filteredExpenses.forEach((e) => {
      const dateObj = new Date(e.date || e.createdAt);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        monthsMap[m].purchases += Number(e.amount) || 0;
        monthsMap[m].orders += 1;
      }
    });

    return MONTH_NAMES.map((m) => monthsMap[m]);
  }, [filteredExpenses]);

  // Category breakdown based on Products Inventory or Expenses
  const purchaseCategories = useMemo(() => {
    const catMap = {};
    products.forEach((p) => {
      const cat = p.category || "General";
      const val = (p.stock || 0) * (p.cost || p.price || 0);
      catMap[cat] = (catMap[cat] || 0) + val;
    });

    const items = Object.entries(catMap).map(([name, v]) => ({ name, v }));
    items.sort((a, b) => b.v - a.v);

    if (items.length > 0) return items.slice(0, 5);

    return [
      { name: "General Goods", v: 0 }
    ];
  }, [products]);

  const categoryPie = useMemo(() => {
    const total = purchaseCategories.reduce((s, c) => s + c.v, 0) || 1;
    const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
    return purchaseCategories.map((c, i) => ({
      name: c.name,
      value: (c.v / total) * 100,
      color: colors[i % colors.length],
    }));
  }, [purchaseCategories]);

  // Top suppliers from DB
  const topSuppliers = useMemo(() => {
    return suppliers.map((s) => ({
      id: s._id || s.id,
      name: s.name,
      amount: Number(s.totalPurchases) || 0,
      paid: Number(s.amountPaid) || 0,
      pending: Number(s.balanceDue) || 0,
    }));
  }, [suppliers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading purchase information...</p>
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
            value: fmt(derived.totalPurchases),
            label: "Total Purchases",
            sub: `${suppliers.length} active suppliers`,
            trend: "up",
          },
          {
            value: `${derived.purchaseOrders}`,
            label: "Active Suppliers",
            sub: "Total registered",
            trend: "up",
          },
          {
            value: fmt(derived.supplierPayments),
            label: "Supplier Payments",
            sub: "Amount cleared",
            trend: "up",
          },
          {
            value: fmt(derived.pendingPayments),
            label: "Pending Balance Due",
            sub: derived.pendingPayments > 0 ? "Outstanding" : "All cleared",
            trend: derived.pendingPayments > 0 ? "down" : "up",
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xl font-bold text-slate-900 font-mono">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">{s.label}</p>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                s.trend === "up" ? "text-emerald-600" : "text-amber-600"
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

      {/* Monthly Purchase Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">
              Monthly Purchase & Expense Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={purchaseTrend}>
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
                formatter={(v) => [fmt(v), "Amount"]}
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">
            Inventory Purchase Category Breakdown
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-56 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {categoryPie.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "Share"]} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full md:w-auto">
              {categoryPie.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-xs gap-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-slate-600">{c.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">
                    {c.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ReportCard>
      </div>

      {/* Top Suppliers */}
      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Supplier Directory & Valuation</h3>
        </div>
        {topSuppliers.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No suppliers added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSuppliers.map((s) => (
              <div
                key={s.id || s.name}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900 text-sm truncate">{s.name}</p>
                  <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold flex-shrink-0">
                    Pending {fmt(s.pending)}
                  </span>
                </div>
                <div className="text-xs text-slate-500">Total Purchases</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {fmt(s.amount)}
                </div>
                <div className="mt-2 text-xs text-slate-500 font-mono">
                  Paid: {fmt(s.paid)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ReportCard>
    </div>
  );
}
