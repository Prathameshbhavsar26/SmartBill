import React, { useMemo, useState } from "react";
import {
  Building,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const INITIAL_BUSINESSES = [
  {
    id: 1,
    name: "Sharma Electronics",
    owner: "Vikram Sharma",
    ownerEmail: "vikram.sharma@sharmaelectronics.in",
    ownerPhone: "+91 8830164600",
    ownerCity: "Nashik",
    plan: "Pro",
    users: 8,
    revenue: 245000,
    status: "Active",
    joined: "2024-03-15",
  },
  {
    id: 2,
    name: "Mumbai Textiles",
    owner: "Nirmala Patel",
    ownerEmail: "nirmala.patel@mumbaitextiles.in",
    ownerPhone: "+91 9765969840",
    ownerCity: "Mumbai",
    plan: "Enterprise",
    users: 24,
    revenue: 1280000,
    status: "Active",
    joined: "2024-01-22",
  },
  {
    id: 3,
    name: "Delhi Grocers",
    owner: "Amar Singh",
    ownerEmail: "amar.singh@delhigrocers.in",
    ownerPhone: "+91 9922334455",
    ownerCity: "Delhi",
    plan: "Starter",
    users: 3,
    revenue: 89000,
    status: "Active",
    joined: "2024-06-08",
  },
  {
    id: 4,
    name: "Pune Hardware Hub",
    owner: "Sanjay More",
    ownerEmail: "sanjay.more@punehardware.in",
    ownerPhone: "+91 9988776655",
    ownerCity: "Pune",
    plan: "Pro",
    users: 6,
    revenue: 412000,
    status: "Suspended",
    joined: "2024-02-14",
  },
  {
    id: 5,
    name: "Chennai Pharma",
    owner: "Lakshmi Rajan",
    ownerEmail: "lakshmi.rajan@chennai-pharma.in",
    ownerPhone: "+91 8899001122",
    ownerCity: "Chennai",
    plan: "Enterprise",
    users: 31,
    revenue: 2100000,
    status: "Active",
    joined: "2023-11-30",
  },
];

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function Badge({ label, variant }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant] ?? styles.gray}`}
    >
      {label}
    </span>
  );
}

function statusToVariant(status) {
  switch (status) {
    case "Active":
      return "green";
    case "Pending":
      return "yellow";
    case "Suspended":
      return "red";
    default:
      return "gray";
  }
}

function planToVariant(plan) {
  switch (plan) {
    case "Enterprise":
      return "purple";
    case "Pro":
      return "blue";
    case "Starter":
      return "gray";
    default:
      return "gray";
  }
}

export default function BusinessesNew() {
  const [search, setSearch] = useState("");
  const [rows] = useState(INITIAL_BUSINESSES);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((b) => {
      return (
        String(b.name ?? "")
          .toLowerCase()
          .includes(q) ||
        String(b.owner ?? "")
          .toLowerCase()
          .includes(q) ||
        String(b.plan ?? "")
          .toLowerCase()
          .includes(q) ||
        String(b.status ?? "")
          .toLowerCase()
          .includes(q) ||
        String(b.ownerCity ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [rows, search]);

  return (
    <div className="p-6 space-y-5 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Businesses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage business profiles, subscriptions, status and revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, owner, plan..."
              className="pl-9 pr-4 py-2 w-72 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Filter</span>
          </button>

          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Business</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Businesses
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {rows.length}
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Building className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {rows.filter((r) => r.status === "Active").length}
            </p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Suspended
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {rows.filter((r) => r.status === "Suspended").length}
            </p>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Results
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {filtered.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">matches search</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {fmt(rows.reduce((s, r) => s + Number(r.revenue || 0), 0))}
          </p>
          <p className="text-xs text-slate-500 mt-1">sum of demo data</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Users
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {rows.reduce((s, r) => s + Number(r.users || 0), 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">subscribed seats</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                {[
                  "Business Name",
                  "Business Owner",
                  "Email",
                  "Phone",
                  "City",
                  "Plan",
                  "Joined",
                  "Revenue",
                  "Employees",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-5 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    No businesses found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {b.name}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{b.owner}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {b.ownerEmail}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                      {b.ownerPhone}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{b.ownerCity}</td>
                    <td className="px-5 py-4">
                      <Badge label={b.plan} variant={planToVariant(b.plan)} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">{b.joined}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {fmt(b.revenue)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{b.users}</td>
                    <td className="px-5 py-4">
                      <Badge
                        label={b.status}
                        variant={statusToVariant(b.status)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">{rows.length}</span>{" "}
            businesses
          </p>
        </div>
      </div>
    </div>
  );
}
