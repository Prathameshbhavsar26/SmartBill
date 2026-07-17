import React, { useState } from "react";
import {
  Building,
  Users,
  CheckCircle,
  XCircle,
  IndianRupee,
  Award,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

// ==========================================
// DUMMY DATA
// ==========================================
const INITIAL_BUSINESSES = [
  {
    id: 1,
    name: "Sharma Electronics",
    owner: "Vikram Sharma",
    email: "vikram@gmail.com",
    phone: "+91 9876543210",
    city: "Mumbai",
    plan: "Enterprise",
    revenue: "₹4,20,000",
    employees: 18,
    joined: "12 Jan 2025",
    status: "Active",
    logoBg: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    name: "Mumbai Textiles",
    owner: "Nirmala Patel",
    email: "nirmala@gmail.com",
    phone: "+91 9876543211",
    city: "Mumbai",
    plan: "Pro",
    revenue: "₹2,80,000",
    employees: 12,
    joined: "18 Mar 2025",
    status: "Active",
    logoBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 3,
    name: "Delhi Grocers",
    owner: "Aman Singh",
    email: "aman@gmail.com",
    phone: "+91 9876543212",
    city: "Delhi",
    plan: "Starter",
    revenue: "₹95,000",
    employees: 5,
    joined: "05 Apr 2025",
    status: "Pending",
    logoBg: "bg-amber-100 text-amber-600",
  },
  {
    id: 4,
    name: "Pune Hardware",
    owner: "Sanjay More",
    email: "sanjay@gmail.com",
    phone: "+91 9876543213",
    city: "Pune",
    plan: "Enterprise",
    revenue: "₹5,60,000",
    employees: 24,
    joined: "14 Feb 2025",
    status: "Suspended",
    logoBg: "bg-rose-100 text-rose-600",
  },
  {
    id: 5,
    name: "Chennai Pharma",
    owner: "Lakshmi Rajan",
    email: "lakshmi@gmail.com",
    phone: "+91 9876543214",
    city: "Chennai",
    plan: "Pro",
    revenue: "₹3,75,000",
    employees: 15,
    joined: "27 May 2025",
    status: "Active",
    logoBg: "bg-indigo-100 text-indigo-600",
  },
];

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Status Badge Styling Helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Suspended":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Plan Badge Styling Helper
  const getPlanBadgeClass = (plan) => {
    switch (plan) {
      case "Enterprise":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Pro":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Starter":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* --------------------------------
          TOP HEADER
          -------------------------------- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Business Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all registered businesses, owners, subscriptions and status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Filter</span>
          </button>

          <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export PDF</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Business</span>
          </button>
        </div>
      </div>

      {/* --------------------------------
          STATISTICS CARDS
          -------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Blue Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Businesses
            </span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">256</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">
              +18 this month
            </p>
          </div>
        </div>

        {/* Card 2: Green Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Businesses
            </span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">242</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              94.5% rate
            </p>
          </div>
        </div>

        {/* Card 3: Red Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Suspended
            </span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">14</h3>
            <p className="text-xs text-rose-600 font-medium mt-1">
              Requires review
            </p>
          </div>
        </div>

        {/* Card 4: Purple Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Business Owners
            </span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">256</h3>
            <p className="text-xs text-purple-600 font-medium mt-1">
              Verified profiles
            </p>
          </div>
        </div>

        {/* Card 5: Orange Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Revenue
            </span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">₹8,42,000</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">
              +12.4% vs last month
            </p>
          </div>
        </div>

        {/* Card 6: Teal Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Premium Plans
            </span>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">188</h3>
            <p className="text-xs text-teal-600 font-medium mt-1">
              73.4% Total share
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------
          BUSINESS TABLE
          -------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse table-auto">
            {/* Sticky Table Header */}
            <thead className="bg-slate-50/70 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                  Logo
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[180px]">
                  Business Name
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Business Owner
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  City
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Subscription Plan
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Employees
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center w-28">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body with Alternating Row Backgrounds and Hovers */}
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {INITIAL_BUSINESSES.map((business) => (
                <tr
                  key={business.id}
                  className="hover:bg-slate-50/80 odd:bg-white even:bg-slate-50/30 transition-colors group"
                >
                  {/* Logo Column */}
                  <td className="py-3 px-4">
                    <div
                      className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center shadow-sm ${business.logoBg}`}
                    >
                      {business.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  </td>

                  {/* Business Name */}
                  <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {business.name}
                  </td>

                  {/* Business Owner */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {business.owner}
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {business.email}
                  </td>

                  {/* Phone Number */}
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {business.phone}
                  </td>

                  {/* City */}
                  <td className="py-3 px-4 text-slate-600">{business.city}</td>

                  {/* Subscription Plan Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanBadgeClass(business.plan)}`}
                    >
                      {business.plan}
                    </span>
                  </td>

                  {/* Joining Date */}
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {business.joined}
                  </td>

                  {/* Revenue */}
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {business.revenue}
                  </td>

                  {/* Employees */}
                  <td className="py-3 px-4 text-slate-600 text-center md:text-left">
                    {business.employees}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(business.status)}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                      {business.status}
                    </span>
                  </td>

                  {/* Interactive Action Buttons */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-105"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title="Edit Business"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all duration-200 transform hover:scale-105"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        title="Delete Account"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all duration-200 transform hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --------------------------------
            BOTTOM PAGINATION
            -------------------------------- */}
        <div className="bg-white px-4 py-3.5 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            Showing <span className="font-semibold text-slate-800">1-5</span> of{" "}
            <span className="font-semibold text-slate-800">256</span> businesses
          </div>

          <div className="flex items-center justify-center gap-1.5 self-center">
            <button
              disabled
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 text-slate-400 bg-slate-50/50 rounded-md cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md shadow-sm transition-colors">
              1
            </button>

            <button className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-md transition-colors">
              2
            </button>

            <button className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-md transition-colors">
              3
            </button>

            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-md transition-colors">
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
