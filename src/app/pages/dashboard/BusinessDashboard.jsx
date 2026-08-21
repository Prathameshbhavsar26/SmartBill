import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  Loader2,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { fetchOrders } from "../../api/orderAPI";
import { getProducts } from "../../api/productAPI";
import { fetchCustomers } from "../../api/customerAPI";
import { fetchPurchases } from "../../api/purchaseAPI";
import { getExpenses } from "../../api/expenseApi";
import { fmt } from "../../utils/format";
import { Btn, Card, StatCard, statusBadge } from "../../components/common/ui";
import { useCustomization } from "../../hooks/useCustomization";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BusinessDashboard({ onNav }) {
  const { t, formatCurrency } = useCustomization();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [ordersRes, productsRes, customersRes, purchasesRes, expensesRes] =
        await Promise.allSettled([
          fetchOrders(),
          getProducts(),
          fetchCustomers(),
          fetchPurchases(),
          getExpenses(),
        ]);

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value?.orders || []);
      }
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value?.products || []);
      }
      if (customersRes.status === "fulfilled") {
        const raw = customersRes.value;
        setCustomers(Array.isArray(raw?.customers) ? raw.customers : Array.isArray(raw) ? raw : []);
      }
      if (purchasesRes.status === "fulfilled") {
        const raw = purchasesRes.value;
        setPurchases(Array.isArray(raw?.purchases) ? raw.purchases : Array.isArray(raw) ? raw : []);
      }
      if (expensesRes.status === "fulfilled") {
        setExpenses(expensesRes.value?.expenses || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleRealtimeUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener("stockUpdated", handleRealtimeUpdate);
    window.addEventListener("productUpdated", handleRealtimeUpdate);
    window.addEventListener("orderCreated", handleRealtimeUpdate);
    window.addEventListener("purchaseCreated", handleRealtimeUpdate);
    window.addEventListener("inventorySettingsUpdated", handleRealtimeUpdate);

    return () => {
      window.removeEventListener("stockUpdated", handleRealtimeUpdate);
      window.removeEventListener("productUpdated", handleRealtimeUpdate);
      window.removeEventListener("orderCreated", handleRealtimeUpdate);
      window.removeEventListener("purchaseCreated", handleRealtimeUpdate);
      window.removeEventListener("inventorySettingsUpdated", handleRealtimeUpdate);
    };
  }, [loadDashboardData]);

  // Dynamic global low stock threshold
  const globalLowStockThreshold = useMemo(() => {
    try {
      const stored = localStorage.getItem("smartbill_inventorySettings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lowStockAlert !== undefined) return Number(parsed.lowStockAlert) || 10;
      }
    } catch (_) {}
    return 10;
  }, []);

  // Derived Key Business Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toDateString();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todayTotal = 0;
    let monthTotal = 0;

    orders.forEach((o) => {
      const d = new Date(o.createdAt || o.date);
      if (!isNaN(d.getTime())) {
        const orderVal = Number(o.totalOrderValue || o.total) || 0;
        if (d.toDateString() === todayStr) {
          todayTotal += orderVal;
        }
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthTotal += orderVal;
        }
      }
    });

    const lowStockCount = products.filter((p) => {
      if (p.status === "Inactive") return false;
      const stock = Number(p.stock) || 0;
      const min =
        p.minStock !== undefined && p.minStock !== null && p.minStock !== ""
          ? Number(p.minStock)
          : globalLowStockThreshold;
      return stock <= min;
    }).length;

    return {
      todaySales: todayTotal,
      monthlyRevenue: monthTotal,
      totalCustomers: customers.length,
      lowStockItems: lowStockCount,
    };
  }, [orders, products, customers, globalLowStockThreshold]);

  // Daily Sales for Current Week
  const weeklySalesData = useMemo(() => {
    const now = new Date();
    const daysMap = {};
    DAYS.forEach((d) => (daysMap[d] = 0));

    const currentDay = now.getDay();
    const distanceToMon = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMon);
    monday.setHours(0, 0, 0, 0);

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAt || o.date);
      if (!isNaN(orderDate.getTime()) && orderDate >= monday) {
        const dayIdx = (orderDate.getDay() + 6) % 7;
        const dayName = DAYS[dayIdx];
        daysMap[dayName] += Number(o.totalOrderValue || o.total) || 0;
      }
    });

    return DAYS.map((day) => ({ day, amount: daysMap[day] }));
  }, [orders]);

  // Category Revenue Share
  const salesByCategory = useMemo(() => {
    const catMap = {};
    let grandTotal = 0;

    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.category || item.product?.category || "General";
        const val = Number(item.amount || (item.price * item.qty)) || 0;
        catMap[cat] = (catMap[cat] || 0) + val;
        grandTotal += val;
      });
    });

    if (grandTotal === 0) {
      products.forEach((p) => {
        const cat = p.category || "General";
        const val = (Number(p.price) || 0) * (Number(p.stock) || 1);
        catMap[cat] = (catMap[cat] || 0) + val;
        grandTotal += val;
      });
    }

    const colors = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1"];
    const total = grandTotal || 1;

    const items = Object.entries(catMap).map(([name, amount], idx) => ({
      name,
      amount,
      value: Math.round((amount / total) * 100),
      color: colors[idx % colors.length],
    }));

    items.sort((a, b) => b.amount - a.amount);
    return items;
  }, [orders, products]);

  const recentInvoices = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading live business performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Refresh Control */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("dashboard.title") || "Business Dashboard"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("dashboard.subtitle") || "Real-time performance summary and business analytics"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? t("common.saving") || "Syncing..." : "Refresh Live Data"}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("dashboard.total_sales") || "Today's Sales"}
          value={formatCurrency(metrics.todaySales)}
          sub="Live today total"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label={t("dashboard.total_revenue") || "Monthly Revenue"}
          value={formatCurrency(metrics.monthlyRevenue)}
          sub="Current month total"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label={t("dashboard.total_customers") || "Total Customers"}
          value={`${metrics.totalCustomers}`}
          sub="Active client records"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Low Stock Alert"
          value={`${metrics.lowStockItems}`}
          sub={metrics.lowStockItems > 0 ? "Items low on stock" : "Stock healthy"}
          trend={metrics.lowStockItems > 0 ? "down" : "up"}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={metrics.lowStockItems > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 h-[340px] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Weekly Sales Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily sales totals for the current week
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySalesData} barSize={26}>
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
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(v) => [fmt(v), "Sales"]}
              />
              <Bar dataKey="amount" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 h-[340px] flex flex-col">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-base">
              Sales by Category
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {salesByCategory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center">No category data available</p>
              ) : (
                salesByCategory.map((d) => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {fmt(d.amount)} ({d.value}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, d.value)}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Invoices & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Recent Sales Invoices
            </h3>
            <Btn variant="ghost" size="sm" onClick={() => onNav("pos")}>
              Go to POS →
            </Btn>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
            {recentInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent invoices recorded yet. Start billing in POS screen!
              </div>
            ) : (
              recentInvoices.map((inv) => {
                const totalVal = Number(inv.totalOrderValue || inv.total) || 0;
                const paidVal = Number(inv.amountPaid) || 0;
                const status = inv.paymentStatus || (paidVal <= 0 ? "Due" : paidVal >= totalVal ? "Paid" : "Partial");
                const invDate = inv.createdAt || inv.date
                  ? new Date(inv.createdAt || inv.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "";

                return (
                  <div
                    key={inv._id || inv.id || inv.invoiceNo}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {inv.customerName || inv.customer || "Walk-in Customer"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {inv.invoiceNo || inv.id || "INV-001"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                        {fmt(totalVal)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{invDate}</p>
                    </div>
                    {statusBadge(status)}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-base">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "New Invoice",
                icon: Receipt,
                color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
                action: () => onNav("pos"),
              },
              {
                label: "Add Product",
                icon: Package,
                color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
                action: () => onNav("products"),
              },
              {
                label: "Add Customer",
                icon: Users,
                color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
                action: () => onNav("customers"),
              },
              {
                label: "Add Purchase",
                icon: ShoppingCart,
                color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
                action: () => onNav("purchase"),
              },
              {
                label: "Add Expense",
                icon: Wallet,
                color: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
                action: () => onNav("expenses"),
              },
              {
                label: "View Reports",
                icon: BarChart3,
                color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                action: () => onNav("reports"),
              },
            ].map((q) => (
              <button
                key={q.label}
                onClick={q.action}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group cursor-pointer bg-white dark:bg-slate-800/50"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${q.color} transition-transform group-hover:scale-105`}
                >
                  <q.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">
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
