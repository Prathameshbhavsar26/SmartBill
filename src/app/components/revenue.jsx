import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  FileText,
  CreditCard,
  ArrowUpRight,
  ChevronDown,
  Download,
  Calendar,
  Percent,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
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

// ─── MOCK DATASETS ────────────────────────────────────────────────────────────

// Updated to include structural expense metrics for comparison
const weeklyFinancialTrend = [
  { day: "Mon", revenue: 125000, expenses: 45000, orders: 45 },
  { day: "Tue", revenue: 148000, expenses: 52000, orders: 52 },
  { day: "Wed", revenue: 132000, expenses: 48000, orders: 48 },
  { day: "Thu", revenue: 195000, expenses: 60000, orders: 68 },
  { day: "Fri", revenue: 210000, expenses: 75000, orders: 75 },
  { day: "Sat", revenue: 185000, expenses: 90000, orders: 60 },
  { day: "Sun", revenue: 105000, expenses: 30000, orders: 38 },
];

// Added aging invoices tracking dataset
const agingInvoicesData = [
  { range: "0–30 Days (Current)", amount: 145000, count: 12, color: "bg-blue-500", textColor: "text-blue-600" },
  { range: "31–60 Days (Overdue)", amount: 82000, count: 6, color: "bg-amber-500", textColor: "text-amber-600" },
  { range: "61+ Days (Critical)", amount: 48000, count: 3, color: "bg-rose-500", textColor: "text-rose-600" },
];

const paymentMethodData = [
  { name: "UPI", value: 450000, color: "#2563EB" }, 
  { name: "Cash", value: 280000, color: "#10B981" }, 
  { name: "Card", value: 210000, color: "#F59E0B" }, 
  { name: "Wallet", value: 60000, color: "#8B5CF6" }, 
];

const categoryRevenueData = [
  { category: "Electronics", revenue: 385000 },
  { category: "Grocery", revenue: 290000 },
  { category: "Clothing", revenue: 215000 },
  { category: "Accessories", revenue: 110000 },
];

const topProducts = [
  { id: 1, name: "Boult Audio Earbuds", revenue: 993858 },
  { id: 2, name: "Max Fashion Shirt (L)", revenue: 107880 },
  { id: 3, name: "Basmati Rice Premium 5kg", revenue: 50960 },
  { id: 4, name: "Zeronics Mechanical Mouse", revenue: 287936 },
];

const topCustomers = [
  { id: 1, name: "Prathamesh Enterprises", purchases: 24, totalSpent: 452000 },
  { id: 2, name: "Gawali Traders", purchases: 18, totalSpent: 284000 },
  { id: 3, name: "Sanchit Wholesale", purchases: 42, totalSpent: 267500 },
  { id: 4, name: "Diksha Traders", purchases: 31, totalSpent: 198000 },
];

const dailyRevenueReport = [
  { date: "2026-07-15", sales: 18, taxCollected: 11250, grossRevenue: 62500, status: "Completed" },
  { date: "2026-07-14", sales: 22, taxCollected: 14850, grossRevenue: 82500, status: "Completed" },
  { date: "2026-07-13", sales: 15, taxCollected: 9450, grossRevenue: 52500, status: "Completed" },
  { date: "2026-07-12", sales: 25, taxCollected: 16200, grossRevenue: 90000, status: "Completed" },
  { date: "2026-07-11", sales: 30, taxCollected: 21600, grossRevenue: 120000, status: "Completed" },
];

const fmt = (val) => `₹${Number(val).toLocaleString("en-IN")}`;

export default function Revenue() {
  const [timeframe, setTimeframe] = useState("This Week");

  // Calculate total outstanding balance from aging layout metrics
  const totalOutstanding = agingInvoicesData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Grid: Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">426</p>
          <p className="text-xs text-slate-500">Total Orders</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3 h-3" /> 8.7% vs Last Week
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">21 Open</p>
          <p className="text-xs text-slate-500">Pending Invoices</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 mt-2">
            <Calendar className="w-3 h-3" /> {fmt(totalOutstanding)} Total
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">₹34,200</p>
          <p className="text-xs text-slate-500">Taxes Collected</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 mt-2">
            <Percent className="w-3 h-3" /> 18% GST Average
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">82.4%</p>
          <p className="text-xs text-slate-500">Growth Targets</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 mt-2">
            <CheckCircle className="w-3 h-3" /> On Track for Q3
          </span>
        </div>
      </div>

      {/* NEWLY ADDED: AGING INVOICES / OVERDUE TRACKER LAYOUT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900 text-sm">Aging Invoices & Collections Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agingInvoicesData.map((item, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-600">{item.range}</span>
                  {i === 2 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
                </div>
                <p className="text-lg font-extrabold text-slate-900 font-mono">{fmt(item.amount)}</p>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`${item.color} h-full`} 
                    style={{ width: `${(item.amount / totalOutstanding) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{item.count} Unpaid Statements</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Block: Pie & Category Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Payment Method Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Inflow distribution mapped out across supported payment avenues.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="h-44 w-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmt(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              {paymentMethodData.map((item) => (
                <div key={item.name} className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-100 min-w-28">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-1 font-mono">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm mb-1">Categorized Inventory Revenue</h3>
          <p className="text-xs text-slate-500 mb-4">Total revenue driven categorized by top product segments.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryRevenueData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: "#0F172A", color: "#fff", borderRadius: "8px", fontSize: "12px", border: "none" }} />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Top-Performing Products</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">Best Sellers</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs">
                  <th className="text-left pb-2 font-semibold">Product Name</th>
                  <th className="text-right pb-2 font-semibold">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 text-slate-800 font-medium">{p.name}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">{fmt(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Top Customer Accounts</h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Premium Tier</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs">
                  <th className="text-left pb-2 font-semibold">Client Business</th>
                  <th className="text-center pb-2 font-semibold">Invoices Generated</th>
                  <th className="text-right pb-2 font-semibold">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5">
                      <p className="text-slate-800 font-semibold">{c.name}</p>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-600">{c.purchases}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">{fmt(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Daily Fiscal Reconciliation Report */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">Daily Revenue Reconciliation Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs">
                <th className="text-left pb-3 font-semibold">Date Log</th>
                <th className="text-center pb-3 font-semibold">Invoices / Sales Counts</th>
                <th className="text-right pb-3 font-semibold">Total Outward IGST/CGST</th>
                <th className="text-right pb-3 font-semibold">Gross Earned Inward</th>
                <th className="text-center pb-3 font-semibold">Accounting Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dailyRevenueReport.map((day, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-mono text-slate-600 font-medium">{day.date}</td>
                  <td className="py-3 text-center font-mono text-slate-700">{day.sales} Orders</td>
                  <td className="py-3 text-right font-mono text-slate-500">{fmt(day.taxCollected)}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">{fmt(day.grossRevenue)}</td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {day.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
