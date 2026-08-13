import React, { useMemo } from "react";
import FilterBar from "./components/FilterBar";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
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

export default function SalesReport() {
  const { from, to, setFrom, setTo, appliedRange, apply } = useReportFilters();
  const { filteredOrders, filteredExpenses, products, loading } = useReportData(
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
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      margin,
    };
  }, [filteredOrders, filteredExpenses]);

  // Monthly Revenue & Profit Trend
  const monthlyTrendData = useMemo(() => {
    const monthsMap = {};
    MONTH_NAMES.forEach((m) => {
      monthsMap[m] = { month: m, sales: 0, profit: 0, expenses: 0 };
    });

    filteredOrders.forEach((o) => {
      const dateObj = new Date(o.createdAt || o.date);
      if (!isNaN(dateObj.getTime())) {
        const monthName = MONTH_NAMES[dateObj.getMonth()];
        const val = Number(o.totalOrderValue || o.total) || 0;
        monthsMap[monthName].sales += val;
      }
    });

    filteredExpenses.forEach((e) => {
      const dateObj = new Date(e.date || e.createdAt);
      if (!isNaN(dateObj.getTime())) {
        const monthName = MONTH_NAMES[dateObj.getMonth()];
        const val = Number(e.amount) || 0;
        monthsMap[monthName].expenses += val;
      }
    });

    return MONTH_NAMES.map((m) => {
      const s = monthsMap[m].sales;
      const exp = monthsMap[m].expenses;
      return {
        month: m,
        sales: s,
        expenses: exp,
        profit: s - exp,
      };
    });
  }, [filteredOrders, filteredExpenses]);

  // Expense Breakdown by Category
  const expensesByCategory = useMemo(() => {
    const catMap = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
    });

    const items = Object.entries(catMap).map(([category, amount], idx) => ({
      id: idx + 1,
      category,
      amount,
    }));

    items.sort((a, b) => b.amount - a.amount);
    return items;
  }, [filteredExpenses]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const productMap = {};

    filteredOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = item.productName || item.name || "Product";
        const qty = Number(item.quantity || item.qty) || 0;
        const price = Number(item.price || item.rate) || 0;
        const revenue = item.total ? Number(item.total) : qty * price;

        if (!productMap[name]) {
          productMap[name] = { name, qty: 0, revenue: 0 };
        }
        productMap[name].qty += qty;
        productMap[name].revenue += revenue;
      });
    });

    const list = Object.values(productMap);
    list.sort((a, b) => b.revenue - a.revenue);

    if (list.length > 0) return list;

    return products.map((p) => ({
      name: p.name,
      qty: 0,
      revenue: (p.stock || 0) * (p.price || 0),
    }));
  }, [filteredOrders, products]);

  // Invoices mapping
  const invoices = useMemo(() => {
    return filteredOrders.map((inv) => {
      const subtotal = Number(inv.subtotal) || (Number(inv.totalOrderValue) || 0) * 0.85;
      const gst = Number(inv.gst) || (Number(inv.totalOrderValue) || 0) * 0.15;
      const total = Number(inv.totalOrderValue || inv.total) || subtotal + gst;
      const dateStr = inv.createdAt
        ? new Date(inv.createdAt).toISOString().slice(0, 10)
        : inv.date || new Date().toISOString().slice(0, 10);

      return {
        id: inv.orderId || inv._id || inv.id || "INV-001",
        customer: inv.customerName || "Walk-in Customer",
        date: dateStr,
        amount: subtotal,
        gst: gst,
        total: total,
        status: inv.status || "Paid",
      };
    });
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading sales information...</p>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            value: fmt(derived.totalRevenue),
            label: "Total Sales Revenue",
            sub: `${filteredOrders.length} orders recorded`,
            trend: "up",
          },
          {
            value: fmt(derived.totalExpenses),
            label: "Total Expenses",
            sub: `${filteredExpenses.length} expense entries`,
            trend: "up",
          },
          {
            value: fmt(derived.netProfit),
            label: "Net Profit",
            sub: derived.netProfit >= 0 ? "Profitable" : "Deficit",
            trend: derived.netProfit >= 0 ? "up" : "down",
          },
          {
            value: `${derived.margin.toFixed(1)}%`,
            label: "Profit Margin",
            sub: "Overall margin",
            trend: derived.margin >= 0 ? "up" : "down",
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

      {/* Monthly Revenue Trend & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">
              Monthly Revenue Trend
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrendData}>
              <defs>
                <linearGradient id="repSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
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
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#repSales)"
                name="Sales Revenue"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={2}
                fill="none"
                name="Net Profit"
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-gray-900 mb-5">
            Expense Breakdown
          </h3>
          {expensesByCategory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-xs">
              No expense records found for this period.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={expensesByCategory} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="category"
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
                  <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2">
                {expensesByCategory.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-600">{e.category}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${
                              derived.totalExpenses > 0
                                ? (e.amount / derived.totalExpenses) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="font-mono font-medium text-slate-900 w-24 text-right">
                        {fmt(e.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ReportCard>
      </div>

      {/* Top Selling Products */}
      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-xs text-gray-500">No products sold yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
            {topProducts.map((p) => (
              <div
                key={p.name}
                className="rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                  <span className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-semibold flex-shrink-0">
                    Qty {p.qty}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900 font-mono">
                  {fmt(p.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </ReportCard>

      {/* Recent Transactions Table */}
      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        {invoices.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No sales invoices recorded for this date range.
          </p>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  {[
                    "Invoice",
                    "Customer",
                    "Date",
                    "Subtotal",
                    "GST",
                    "Total",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv, idx) => (
                  <tr
                    key={inv.id || idx}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-semibold">
                      {inv.id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {inv.customer}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                      {inv.date}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-mono">
                      {fmt(inv.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono">{fmt(inv.gst)}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                      {fmt(inv.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportCard>
    </div>
  );
}
