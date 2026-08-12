import React, { useMemo, useState } from "react";
import ReportFilters from "./components/ReportFilters";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
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
} from "recharts";
import ReportCard from "./components/ReportCard";
import { Card } from "../../components/common/ui";
import { useReportData } from "./useReportData";
import { fmt } from "../../utils/format";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function GSTReport() {
  const [appliedRange, setAppliedRange] = useState({ from: "2024-01-01", to: "2026-12-31" });
  const { filteredOrders, filteredExpenses, loading } = useReportData(
    appliedRange.from,
    appliedRange.to
  );

  const derived = useMemo(() => {
    const gstCollected = filteredOrders.reduce((sum, o) => {
      if (o.gst !== undefined && o.gst !== null) {
        return sum + Number(o.gst);
      }
      const total = Number(o.totalOrderValue || o.total) || 0;
      return sum + total * 0.18;
    }, 0);

    const gstPaid = filteredExpenses.reduce((sum, e) => {
      const amt = Number(e.amount) || 0;
      return sum + amt * 0.18;
    }, 0);

    const inputTaxCredit = gstPaid;
    const gstPayable = Math.max(0, gstCollected - inputTaxCredit);

    return { gstCollected, gstPaid, inputTaxCredit, gstPayable };
  }, [filteredOrders, filteredExpenses]);

  // Monthly GST Trend
  const gstTrend = useMemo(() => {
    const monthsMap = {};
    MONTH_NAMES.forEach((m) => {
      monthsMap[m] = { month: m, collected: 0, paid: 0 };
    });

    filteredOrders.forEach((o) => {
      const dateObj = new Date(o.createdAt || o.date);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        const gstVal = o.gst !== undefined && o.gst !== null
          ? Number(o.gst)
          : (Number(o.totalOrderValue || o.total) || 0) * 0.18;
        monthsMap[m].collected += gstVal;
      }
    });

    filteredExpenses.forEach((e) => {
      const dateObj = new Date(e.date || e.createdAt);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        monthsMap[m].paid += (Number(e.amount) || 0) * 0.18;
      }
    });

    return MONTH_NAMES.map((m) => monthsMap[m]);
  }, [filteredOrders, filteredExpenses]);

  // Tax Breakdown: 50% CGST, 50% SGST
  const gstBreakdown = useMemo(() => {
    const half = derived.gstCollected / 2;
    return [
      { label: "CGST (Central)", v: half },
      { label: "SGST (State)", v: half },
      { label: "IGST (Integrated)", v: 0 },
    ];
  }, [derived.gstCollected]);

  const filingStatuses = useMemo(() => {
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    const list = [];
    for (let i = 3; i >= 0; i--) {
      const mIdx = (currMonth - i + 12) % 12;
      const y = currMonth - i < 0 ? currYear - 1 : currYear;
      const period = `${MONTH_NAMES[mIdx]} ${y}`;
      const status = i >= 2 ? "Filed" : "Pending";
      list.push({ period, status });
    }
    return list;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading GST report details...</p>
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
            value: fmt(derived.gstCollected),
            label: "GST Collected (Output Tax)",
            sub: `${filteredOrders.length} taxable invoices`,
            trend: "up",
          },
          {
            value: fmt(derived.gstPaid),
            label: "GST Paid (Purchase Tax)",
            sub: `${filteredExpenses.length} expense claims`,
            trend: "up",
          },
          {
            value: fmt(derived.inputTaxCredit),
            label: "Input Tax Credit (ITC)",
            sub: "Claimable ITC",
            trend: "up",
          },
          {
            value: fmt(derived.gstPayable),
            label: "Net GST Payable",
            sub: derived.gstPayable > 0 ? "Tax due" : "No tax due",
            trend: derived.gstPayable > 0 ? "up" : "down",
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

      {/* Monthly GST Trend & Tax Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">
            Monthly GST Collection vs Input Tax Paid
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gstTrend}>
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
              <Line
                type="monotone"
                dataKey="collected"
                name="GST Collected"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="paid"
                name="GST Paid (ITC)"
                stroke="#10B981"
                strokeWidth={2.2}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </ReportCard>

        <ReportCard className="p-5">
          <h3 className="font-semibold text-slate-900 mb-5">Tax Breakdown (CGST / SGST / IGST)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gstBreakdown} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="label"
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
                formatter={(v) => [fmt(v), "Tax Amount"]}
              />
              <Bar dataKey="v" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      </div>

      {/* GST Summary & Filing Status */}
      <ReportCard className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h3 className="font-semibold text-slate-900 mb-5">
              GST Summary Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Metric", "Value"].map((h) => (
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
                  {[
                    ["GST Collected (Output Tax)", derived.gstCollected],
                    ["GST Paid on Purchases / Expenses", derived.gstPaid],
                    ["Input Tax Credit (ITC) Available", derived.inputTaxCredit],
                    ["Net GST Payable", derived.gstPayable],
                  ].map(([m, v]) => (
                    <tr key={m} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-900 font-medium">
                        {m}
                      </td>
                      <td className="px-5 py-3.5 text-slate-900 font-mono font-semibold">
                        {fmt(v)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-5">
              GST Return Filing Tracker
            </h3>
            <div className="space-y-3">
              {filingStatuses.map((s) => (
                <div
                  key={s.period}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {s.period}
                    </p>
                    <p className="text-xs text-slate-500">
                      Return Type: GSTR-3B & GSTR-1
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                      s.status === "Filed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReportCard>
    </div>
  );
}
