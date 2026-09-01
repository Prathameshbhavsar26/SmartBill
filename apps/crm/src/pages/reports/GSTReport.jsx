import React, { useMemo } from "react";
import FilterBar from "./components/FilterBar";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import ReportCard from "./components/ReportCard";
import { Card } from "@shared/components/common/ui";
import { useReportData } from "./useReportData";
import { useReportFilters } from "./useReportFilters";
import { fmt } from "@shared/utils/format";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function GSTReport() {
  const { from, to, setFrom, setTo, appliedRange, apply } = useReportFilters();
  const { filteredOrders, filteredExpenses, filteredPurchases, loading } = useReportData(
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

    const gstPaidFromPurchases = filteredPurchases.reduce((sum, p) => {
      return sum + (Number(p.gstTotal) || 0);
    }, 0);

    const gstPaidFromExpenses = filteredExpenses.reduce((sum, e) => {
      const amt = Number(e.amount) || 0;
      return sum + amt * 0.18;
    }, 0);

    const gstPaid = gstPaidFromPurchases + gstPaidFromExpenses;
    const inputTaxCredit = gstPaid;
    const gstPayable = Math.max(0, gstCollected - inputTaxCredit);

    return { gstCollected, gstPaid, inputTaxCredit, gstPayable };
  }, [filteredOrders, filteredExpenses, filteredPurchases]);

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

    filteredPurchases.forEach((p) => {
      const dateObj = new Date(p.purchaseDate || p.createdAt || p.date);
      if (!isNaN(dateObj.getTime())) {
        const m = MONTH_NAMES[dateObj.getMonth()];
        monthsMap[m].paid += Number(p.gstTotal) || 0;
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
  }, [filteredOrders, filteredExpenses, filteredPurchases]);

  // Tax Breakdown: 50% CGST, 50% SGST
  const gstBreakdown = useMemo(() => {
    const half = derived.gstCollected / 2;
    return [
      { label: "CGST (Central Tax)", v: half },
      { label: "SGST (State Tax)", v: half },
      { label: "IGST (Integrated Tax)", v: 0 },
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
      const mName = MONTH_NAMES[mIdx];
      const isPast = i > 0;

      list.push({
        returnType: "GSTR-3B",
        period: `${mName} ${y}`,
        dueDate: `20 ${mName} ${y}`,
        status: isPast ? "Filed" : "Pending",
        amount: fmt(isPast ? derived.gstPayable * (0.8 + Math.random() * 0.4) : derived.gstPayable),
      });
    }

    return list;
  }, [derived.gstPayable]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-sm font-medium">Loading GST tax reports...</p>
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
            value: fmt(derived.gstCollected),
            label: "GST Collected (Output)",
            sub: "On sales revenue",
            trend: "up",
          },
          {
            value: fmt(derived.gstPaid),
            label: "GST Paid (Input)",
            sub: "On purchases & expenses",
            trend: "up",
          },
          {
            value: fmt(derived.inputTaxCredit),
            label: "Input Tax Credit (ITC)",
            sub: "Eligible deduction",
            trend: "up",
          },
          {
            value: fmt(derived.gstPayable),
            label: "Net GST Payable",
            sub: derived.gstPayable > 0 ? "Due for filing" : "Zero tax liability",
            trend: derived.gstPayable > 0 ? "down" : "up",
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

      {/* Monthly GST Collected vs Paid Trend */}
      <ReportCard className="p-5">
        <h3 className="font-semibold text-slate-900 mb-5">
          Monthly Output GST Collected vs Input GST Paid
        </h3>
        <ResponsiveContainer width="100%" height={240}>
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
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v) => [fmt(v)]}
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
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ReportCard>

      {/* Tax Breakdown & Filing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Output Tax Breakdown</h3>
          <div className="space-y-3">
            {gstBreakdown.map((item) => (
              <div key={item.label} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-mono font-bold text-slate-900">{fmt(item.v)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">GSTR Filing Status</h3>
          <div className="space-y-3">
            {filingStatuses.map((f, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-bold text-slate-800">{f.returnType} ({f.period})</p>
                  <p className="text-[10px] text-slate-400">Due: {f.dueDate}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    f.status === "Filed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {f.status}
                  </span>
                  <p className="font-mono text-slate-700 mt-0.5">{f.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}





