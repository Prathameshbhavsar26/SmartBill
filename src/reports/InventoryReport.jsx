import React, { useMemo, useState } from "react";
import ReportFilters from "./components/ReportFilters";

import { Download, Printer, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ResponsiveContainer,
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

const inventoryMovement = [
  { day: "Mon", in: 420, out: 310 },
  { day: "Tue", in: 520, out: 280 },
  { day: "Wed", in: 360, out: 390 },
  { day: "Thu", in: 610, out: 420 },
  { day: "Fri", in: 480, out: 350 },
  { day: "Sat", in: 540, out: 410 },
  { day: "Sun", in: 390, out: 300 },
];

const categoryDist = [
  { name: "Electronics", v: 34 },
  { name: "Clothing", v: 28 },
  { name: "Groceries", v: 22 },
  { name: "Hardware", v: 16 },
];

const topMoving = [
  { name: "Boult Audio Airbus", stock: 48, moving: 34 },
  { name: "Denim Jeans (32)", stock: 76, moving: 29 },
  { name: "Olive Oil ", stock: 61, moving: 24 },
  { name: "Zeronics Mouse", stock: 22, moving: 18 },
];

const inventoryValuationRows = [
  { sku: "EL-SGB-001", product: "Boult Audio Airbus", category: "Electronics", stock: 48, value: 230400, status: "Active" },
  { sku: "CL-CLS-002", product: "Max Fashion Shirt (L)", category: "Clothing", stock: 134, value: 179660, status: "Active" },
  { sku: "GR-BR5-003", product: "Basmati Rice Premium 5kg", category: "Groceries", stock: 8, value: 2560, status: "Low Stock" },
  { sku: "EL-WMK-005", product: "Owen", category: "Electronics", stock: 0, value: 0, status: "Out of Stock" },
];

export default function InventoryReport() {
  const [from, setFrom] = useState("2024-08-01");
  const [to, setTo] = useState("2024-08-31");

  const derived = useMemo(() => {
    const totalProducts = 231;
    const inventoryValue = 2480000; // mock ₹24.8L
    const lowStockItems = 3;
    const outOfStock = 1;
    return { totalProducts, inventoryValue, lowStockItems, outOfStock };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap"></div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { value: `${derived.totalProducts}`, label: "Total Products", sub: "+2% this month", trend: "up" },
          { value: fmt(derived.inventoryValue), label: "Inventory Value", sub: "+6.2% this month", trend: "up" },
          { value: `${derived.lowStockItems}`, label: "Low Stock Items", sub: "Action required", trend: "down" },
          { value: `${derived.outOfStock}`, label: "Out of Stock", sub: "Reorder pending", trend: "down" },
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
          <h3 className="font-semibold text-slate-900 mb-5">Stock Movement Chart</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={inventoryMovement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="in" stroke="#2563EB" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="out" stroke="#F43F5E" strokeWidth={2.2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Category Distribution</h3>
          <div className="space-y-3">
            {categoryDist.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-semibold text-slate-900">{c.v}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={categoryDist.map((c) => ({ name: c.name, v: c.v * 1000 }))} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>
      </div>

      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Top Moving Products</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topMoving.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">Moving {p.moving}</span>
              </div>
              <p className="text-xs text-slate-500">Current Stock</p>
              <p className="text-lg font-bold text-slate-900">{p.stock}</p>
            </div>
          ))}
        </div>
      </ReportCard>

      <ReportCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900">Inventory Valuation Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["SKU", "Product", "Category", "Stock", "Value", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventoryValuationRows.map((r) => (
                <tr key={r.sku} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-600">{r.sku}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-medium">{r.product}</td>
                  <td className="px-5 py-3.5 text-slate-600">{r.category}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono">{r.stock}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{fmt(r.value)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        r.status === "Out of Stock"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : r.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>

      <div className="hidden">{/* requirements placeholder */}</div>
    </div>
  );
}

