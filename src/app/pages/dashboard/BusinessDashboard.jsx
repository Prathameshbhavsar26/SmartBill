import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  FileText,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { dailySales, invoices, pieData, salesData } from "../../data/mockData";
import { fmt, fmtK } from "../../utils/format";
import { Btn, Card, StatCard, statusBadge } from "../../components/common/ui";

export default function BusinessDashboard({ onNav }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value="₹48,200"
          sub="+18% vs yesterday"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Monthly Revenue"
          value="₹8.9L"
          sub="+12.4% vs last month"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Total Customers"
          value="342"
          sub="14 new this week"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Low Stock Items"
          value="3"
          sub="Needs attention"
          trend="down"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 h-[320px] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Daily Sales (This Week)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sales trend for the current week
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySales} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="day"
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
                formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Sales"]}
              />
              <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 h-[320px] flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">
              Sales by Category
            </h3>
            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              {pieData.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{d.name}</span>
                    <span className="font-semibold text-slate-900">
                      {d.value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${d.value}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Invoices</h3>
            <Btn variant="ghost" size="sm" onClick={() => onNav("pos")}>
              View All →
            </Btn>
          </div>
          <div className="divide-y divide-slate-50">
            {invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {inv.customer}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">{inv.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {fmt(inv.total)}
                  </p>
                  <p className="text-xs text-slate-400">{inv.date}</p>
                </div>
                {statusBadge(inv.status)}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "New Invoice",
                icon: Receipt,
                color: "bg-blue-50 text-blue-600",
                action: () => onNav("pos"),
              },
              {
                label: "Add Product",
                icon: Package,
                color: "bg-emerald-50 text-emerald-600",
                action: () => onNav("products"),
              },
              {
                label: "Add Customer",
                icon: Users,
                color: "bg-purple-50 text-purple-600",
                action: () => onNav("customers"),
              },
              {
                label: "Add Purchase",
                icon: ShoppingCart,
                color: "bg-amber-50 text-amber-600",
                action: () => onNav("purchase"),
              },
              {
                label: "Add Expense",
                icon: Wallet,
                color: "bg-rose-50 text-rose-600",
                action: () => onNav("expenses"),
              },
              {
                label: "View Reports",
                icon: BarChart3,
                color: "bg-slate-100 text-slate-600",
                action: () => onNav("reports"),
              },
            ].map((q) => (
              <button
                key={q.label}
                onClick={q.action}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${q.color}`}
                >
                  <q.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                  {q.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
