import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { adminStats, businesses } from "../../data/mockData";
import { fmt, fmtK } from "../../utils/format";
import { Card, StatCard } from "../../components/common/ui";

export default function SuperAdminDashboard() {
  const [timeRange, setTimeRange] = useState("6M");

  const revenueByRange = {
    "3M": [
      { month: "Jan", businesses: 28, revenue: 420000 },
      { month: "Feb", businesses: 34, revenue: 510000 },
      { month: "Mar", businesses: 41, revenue: 605000 },
    ],
    "6M": [
      { month: "Jan", businesses: 42, revenue: 520000 },
      { month: "Feb", businesses: 58, revenue: 720000 },
      { month: "Mar", businesses: 71, revenue: 880000 },
      { month: "Apr", businesses: 89, revenue: 1100000 },
      { month: "May", businesses: 104, revenue: 1280000 },
      { month: "Jun", businesses: 128, revenue: 1560000 },
    ],
    "1Y": [
      { month: "Jan", businesses: 32, revenue: 460000 },
      { month: "Feb", businesses: 40, revenue: 580000 },
      { month: "Mar", businesses: 52, revenue: 690000 },
      { month: "Apr", businesses: 66, revenue: 820000 },
      { month: "May", businesses: 78, revenue: 960000 },
      { month: "Jun", businesses: 92, revenue: 1120000 },
      { month: "Jul", businesses: 104, revenue: 1240000 },
      { month: "Aug", businesses: 116, revenue: 1360000 },
      { month: "Sep", businesses: 126, revenue: 1490000 },
      { month: "Oct", businesses: 134, revenue: 1600000 },
      { month: "Nov", businesses: 142, revenue: 1720000 },
      { month: "Dec", businesses: 151, revenue: 1860000 },
    ],
  };

  const activeAdminStats = revenueByRange[timeRange] ?? adminStats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Businesses"
          value="1,248"
          sub="+12% this month"
          trend="up"
          icon={<Building2 className="w-5 h-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Total Users"
          value="8,432"
          sub="+8.4% this month"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Active Subscriptions"
          value="1,104"
          sub="88.4% of total"
          trend="up"
          icon={<CreditCard className="w-5 h-5" />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="MRR"
          value="₹28.4L"
          sub="+21% this month"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Revenue Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly recurring revenue
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[
                ["3M", "3M"],
                ["6M", "6M"],
                ["1Y", "1Y"],
              ].map(([key]) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  className={`text-xs px-2.5 py-1 rounded-lg ${timeRange === key ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activeAdminStats}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v) => [
                  `₹${Number(v).toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#adminGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="lg:col-span-3 w-full p-5">
          <h3 className="font-semibold text-slate-900 mb-5">
            Plan Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPie>
              <Pie
                data={[
                  { name: "Starter", value: 480 },
                  { name: "Pro", value: 512 },
                  { name: "Enterprise", value: 256 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {["#CBD5E1", "#2563EB", "#7C3AED"].map((c, i) => (
                  <Cell key={`plan-${i}`} fill={c} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {[
              ["Starter", "480", "#CBD5E1"],
              ["Pro", "512", "#2563EB"],
              ["Enterprise", "256", "#7C3AED"],
            ].map(([n, v, c]) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: c }}
                />
                <span className="text-slate-600 flex-1">{n}</span>
                <span className="font-semibold text-slate-900">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
