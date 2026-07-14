import React, { useMemo } from "react";
import ReportFilters from "./components/ReportFilters";



import { Download, Printer, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { Card } from "./uiExports";



const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const purchaseTrend = [
  { month: "Jan", purchases: 89000, orders: 18 },
  { month: "Feb", purchases: 102000, orders: 22 },
  { month: "Mar", purchases: 95000, orders: 20 },
  { month: "Apr", purchases: 118000, orders: 26 },
  { month: "May", purchases: 110000, orders: 24 },
  { month: "Jun", purchases: 135000, orders: 28 },
  { month: "Jul", purchases: 128000, orders: 27 },
  { month: "Aug", purchases: 142000, orders: 30 },
];

const purchaseCategories = [
  { name: "Electronics", v: 128000 },
  { name: "Clothing", v: 72000 },
  { name: "Groceries", v: 54000 },
  { name: "Hardware", v: 61000 },
];

const topSuppliers = [
  { name: "TechVision Pvt Ltd", amount: 412000, paid: 320000, pending: 92000 },
  { name: "FabWorld Exports", amount: 218000, paid: 180000, pending: 38000 },
  { name: "AgriLink Wholesale", amount: 162000, paid: 120000, pending: 42000 },
  { name: "Metro Hardware Hub", amount: 98000, paid: 74000, pending: 24000 },
];

const recentPurchases = [
  { po: "PO-2024-038", supplier: "TechVision Pvt Ltd", date: "2024-08-10", items: 5, total: 124800, status: "Received" },
  { po: "PO-2024-037", supplier: "FabWorld Exports", date: "2024-08-07", items: 12, total: 48200, status: "Received" },
  { po: "PO-2024-036", supplier: "AgriLink Wholesale", date: "2024-08-03", items: 8, total: 32600, status: "Pending" },
];

export default function PurchaseReport() {
  const derived = useMemo(() => {

    const totalPurchases = purchaseTrend.reduce((s, d) => s + d.purchases, 0);
    const purchaseOrders = purchaseTrend.reduce((s, d) => s + d.orders, 0);
    const supplierPayments = totalPurchases * 0.78;
    const pendingPayments = totalPurchases - supplierPayments;
    return {
      totalPurchases,
      purchaseOrders,
      supplierPayments,
      pendingPayments,
    };
  }, []);

  const categoryPie = useMemo(() => {
    const total = purchaseCategories.reduce((s, c) => s + c.v, 0) || 1;
    const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6"];
    return purchaseCategories.map((c, i) => ({ name: c.name, value: (c.v / total) * 100, color: colors[i % colors.length] }));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap"></div>

      <ReportFilters />


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { value: fmt(derived.totalPurchases), label: "Total Purchases", sub: "+12% this month", trend: "up" },
          { value: `${derived.purchaseOrders}`, label: "Purchase Orders", sub: "+6% this month", trend: "up" },
          { value: fmt(derived.supplierPayments), label: "Supplier Payments", sub: "+4% this month", trend: "up" },
          { value: fmt(derived.pendingPayments), label: "Pending Payments", sub: "-2% this month", trend: "down" },
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
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Monthly Purchase Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={purchaseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Purchases"]}
              />
              <Line type="monotone" dataKey="purchases" stroke="#2563EB" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Purchase Category Breakdown</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-56 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {categoryPie.map((c, i) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full md:w-auto">
              {categoryPie.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-600">{c.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{c.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={purchaseCategories} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Amount"]}
                />
                <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>
      </div>

      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Top Suppliers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topSuppliers.map((s) => (
            <div key={s.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-900">{s.name}</p>
                <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-semibold">Pending {fmt(s.pending)}</span>
              </div>
              <div className="text-sm text-slate-600">Amount</div>
              <div className="text-lg font-bold text-slate-900">{fmt(s.amount)}</div>
              <div className="mt-2 text-xs text-slate-500">Paid: {fmt(s.paid)}</div>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Recent Purchase Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["PO No.", "Supplier", "Date", "Items", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPurchases.map((p) => (
                <tr key={p.po} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-600">{p.po}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-medium">{p.supplier}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{p.date}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.items}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{fmt(p.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>

      <div className="hidden">{/* keeps structure consistent with other pages */}</div>
    </div>
  );
}

