import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  IndianRupee,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { fmt } from "@shared/utils/format";
import { EmptyState, ErrorState, TableSkeleton } from "@shared/components/common/ui";
import { fetchOrders } from "@shared/api/orderAPI";
import POSInvoiceModal from "./POSInvoiceModal";

const localDateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const getInvoiceStatus = (order) => {
  if (order.status === "Cancelled") return "Cancelled";
  const total = Number(order.totalOrderValue) || 0;
  const paid = Number(order.amountPaid) || 0;
  const due = Number(order.balanceDue ?? Math.max(0, total - paid));
  if (due <= 0 || order.status === "Paid") return "Paid";
  if (paid > 0 || order.status === "Partial") return "Partial";
  return "Due";
};

const statusLabels = {
  Paid: "Paid",
  Partial: "Partially Paid",
  Due: "Unpaid",
  Cancelled: "Cancelled",
};

const statusClasses = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  Due: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

const customerKey = (order) => {
  const id = typeof order.customerId === "object"
    ? order.customerId?._id
    : order.customerId;
  return id ? String(id) : `walk-in:${order.customerName || "Walk-in Customer"}`;
};

export default function SalesHistoryScreen({
  onBack,
  activeBiz,
  paymentSettings,
  invSettings,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetchOrders();
      setOrders(Array.isArray(response?.orders) ? response.orders : []);
    } catch (error) {
      setLoadError(
        error?.response?.data?.message || error?.message || "Sales invoices could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const customers = useMemo(() => {
    const uniqueCustomers = new Map();
    orders.forEach((order) => {
      const key = customerKey(order);
      if (!uniqueCustomers.has(key)) {
        uniqueCustomers.set(key, order.customerName || "Walk-in Customer");
      }
    });
    return [...uniqueCustomers.entries()].sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const orderDate = localDateValue(order.date || order.createdAt);
      const status = getInvoiceStatus(order);
      const searchable = [
        order.invoiceNo,
        order.customerName,
        order.customerPhone,
      ].filter(Boolean).join(" ").toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (statusFilter === "all" || status === statusFilter) &&
        (customerFilter === "all" || customerKey(order) === customerFilter) &&
        (!startDate || (orderDate && orderDate >= startDate)) &&
        (!endDate || (orderDate && orderDate <= endDate))
      );
    });
  }, [orders, search, statusFilter, customerFilter, startDate, endDate]);

  const summary = useMemo(() => {
    const activeOrders = filteredOrders.filter(
      (order) => getInvoiceStatus(order) !== "Cancelled"
    );
    return {
      sales: activeOrders.reduce(
        (sum, order) => sum + (Number(order.totalOrderValue) || 0),
        0
      ),
      paid: activeOrders.reduce(
        (sum, order) => sum + (Number(order.amountPaid) || 0),
        0
      ),
      due: activeOrders.reduce(
        (sum, order) => sum + (
          Number(order.balanceDue ?? Math.max(
            0,
            (Number(order.totalOrderValue) || 0) - (Number(order.amountPaid) || 0)
          )) || 0
        ),
        0
      ),
      count: activeOrders.length,
    };
  }, [filteredOrders]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCustomerFilter("all");
    setStartDate("");
    setEndDate("");
  };

  if (selectedOrder) {
    return (
      <POSInvoiceModal
        order={selectedOrder}
        activeBiz={activeBiz}
        paymentSettings={paymentSettings}
        invSettings={invSettings}
        onClose={() => setSelectedOrder(null)}
      />
    );
  }

  const summaryCards = [
    { label: "Total sales", value: fmt(summary.sales), detail: "Excludes cancelled invoices", icon: IndianRupee, tone: "blue" },
    { label: "Paid amount", value: fmt(summary.paid), detail: "Payments received", icon: CheckCircle2, tone: "emerald" },
    { label: "Pending amount", value: fmt(summary.due), detail: "Balance still due", icon: Clock3, tone: "amber" },
    { label: "Invoices", value: summary.count.toLocaleString("en-IN"), detail: "Active invoices in results", icon: FileText, tone: "slate" },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] space-y-4 pb-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Invoices &amp; sales</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Search invoices and review payment balances.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Billing
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3" aria-label="Sales summary">
        {summaryCards.map(({ label, value, detail, icon: Icon, tone }) => {
          const tones = {
            blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
            emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
            amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
            slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          };
          return (
            <div key={label} className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              {loading ? (
                <div className="mt-3 h-6 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <p className="mt-2 truncate text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white" title={value}>{value}</p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 p-3.5">
          <label className="relative sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Search invoices</span>
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Invoice, customer or phone"
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by customer</span>
            <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="all">All customers</option>
              {customers.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by payment status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partially paid</option>
              <option value="Due">Unpaid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Start date</span>
            <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
              aria-label="Start date"
            />
          </label>
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">End date</span>
              <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500"
                aria-label="End date"
              />
            </label>
            {(search || statusFilter !== "all" || customerFilter !== "all" || startDate || endDate) && (
              <button
                type="button"
                onClick={clearFilters}
                title="Clear filters"
                aria-label="Clear filters"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loadError ? (
          <div className="p-4">
            <ErrorState message={loadError} onRetry={loadOrders} />
          </div>
        ) : loading ? (
          <div className="p-3.5"><TableSkeleton rows={5} /></div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title={orders.length ? "No invoices match these filters" : "No sales invoices yet"}
            sub={orders.length ? "Adjust or clear the filters to see more invoices." : "Invoices created in Billing will appear here."}
            action={orders.length ? <button type="button" onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:underline">Clear filters</button> : null}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto border-t border-slate-100 dark:border-slate-800">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Invoice</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-right font-semibold">Paid</th>
                    <th className="px-4 py-3 text-right font-semibold">Balance</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => {
                    const status = getInvoiceStatus(order);
                    const total = Number(order.totalOrderValue) || 0;
                    const paid = Number(order.amountPaid) || 0;
                    const due = Number(order.balanceDue ?? Math.max(0, total - paid));
                    const invoiceNo = order.invoiceNo || order.invoiceNumber || "Invoice";
                    return (
                      <tr key={order._id || invoiceNo} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-700 dark:text-blue-400">{invoiceNo}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{order.customerName || "Walk-in Customer"}</p>
                          {order.customerPhone && <p className="mt-0.5 text-[11px] text-slate-400">{order.customerPhone}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{localDateValue(order.date || order.createdAt) || "—"}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">{fmt(total)}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">{fmt(paid)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${due > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`}>{fmt(due)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClasses[status]}`}>
                            {statusLabels[status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1.5 font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950"
                            title="View, print or download invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
              {filteredOrders.map((order) => {
                const status = getInvoiceStatus(order);
                const total = Number(order.totalOrderValue) || 0;
                const paid = Number(order.amountPaid) || 0;
                const due = Number(order.balanceDue ?? Math.max(0, total - paid));
                return (
                  <article key={order._id || order.invoiceNo} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-bold text-blue-700 dark:text-blue-400">{order.invoiceNo || order.invoiceNumber || "Invoice"}</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{order.customerName || "Walk-in Customer"}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{localDateValue(order.date || order.createdAt) || "—"}</p>
                      </div>
                      <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusClasses[status]}`}>{statusLabels[status]}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <div><p className="text-[10px] text-slate-400">Total</p><p className="mt-0.5 text-xs font-semibold font-mono text-slate-900 dark:text-white">{fmt(total)}</p></div>
                      <div><p className="text-[10px] text-slate-400">Paid</p><p className="mt-0.5 text-xs font-semibold font-mono text-emerald-700 dark:text-emerald-400">{fmt(paid)}</p></div>
                      <div><p className="text-[10px] text-slate-400">Balance</p><p className="mt-0.5 text-xs font-semibold font-mono text-rose-600 dark:text-rose-400">{fmt(due)}</p></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-300"
                    >
                      <Eye className="w-4 h-4" /> View, print or download
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-[11px] text-slate-500">
              Showing {filteredOrders.length.toLocaleString("en-IN")} of {orders.length.toLocaleString("en-IN")} invoices
            </div>
          </>
        )}
      </section>
    </div>
  );
}