import { useState, useCallback, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Landmark,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Shield,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Building2,
  UserCircle,
  Lock,
  CreditCard,
  Percent,
  Tag,
  BarChart2,
  Receipt,
  Wallet,
  Package2,
  Layers,
  RefreshCw,
  Upload,
  Home,
  Mail,
  Phone,
  MapPin,
  Check,
  Minus,
  Calculator,
  ScanLine,
  Banknote,
  PieChart,
  Activity,
  ArrowRight,
  Send,
  MessageSquare,
  Info,
  LogIn,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

// NOTE: This file is .jsx, so TypeScript `type ...` declarations must not be used.
// All state/page types are treated as plain strings in the UI.

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const salesData = [
  { month: "Jan", sales: 145000, purchases: 89000, profit: 56000 },
  { month: "Feb", sales: 178000, purchases: 102000, profit: 76000 },
  { month: "Mar", sales: 162000, purchases: 95000, profit: 67000 },
  { month: "Apr", sales: 210000, purchases: 118000, profit: 92000 },
  { month: "May", sales: 195000, purchases: 110000, profit: 85000 },
  { month: "Jun", sales: 248000, purchases: 135000, profit: 113000 },
  { month: "Jul", sales: 231000, purchases: 128000, profit: 103000 },
  { month: "Aug", sales: 267000, purchases: 142000, profit: 125000 },
];

const dailySales = [
  { day: "Mon", amount: 18400 },
  { day: "Tue", amount: 22100 },
  { day: "Wed", amount: 19800 },
  { day: "Thu", amount: 25600 },
  { day: "Fri", amount: 31200 },
  { day: "Sat", amount: 28900 },
  { day: "Sun", amount: 15400 },
];

const pieData = [
  { name: "Electronics", value: 34, color: "#2563EB" },
  { name: "Clothing", value: 28, color: "#10B981" },
  { name: "Groceries", value: 22, color: "#F59E0B" },
  { name: "Hardware", value: 16, color: "#8B5CF6" },
];

const adminStats = [
  { month: "Jan", businesses: 42, revenue: 520000 },
  { month: "Feb", businesses: 58, revenue: 720000 },
  { month: "Mar", businesses: 71, revenue: 880000 },
  { month: "Apr", businesses: 89, revenue: 1100000 },
  { month: "May", businesses: 104, revenue: 1280000 },
  { month: "Jun", businesses: 128, revenue: 1560000 },
];

const customers = [
  {
    id: 1,
    name: "Prathamesh Enterprises",
    contact: "Prathamesh",
    phone: "+91 8830164600",
    email: "prathamesh@enterprises.in",
    city: "Nashik",
    balance: 45200,
    status: "Active",
    invoices: 24,
  },
  {
    id: 2,
    name: "Gawali traders",
    contact: "Omkar Gawali",
    phone: "+91 8830164600",
    email: "omkar@gawalitraders.in",
    city: "Nashik",
    balance: 8400,
    status: "Active",
    invoices: 18,
  },
  {
    id: 3,
    name: "Akshata Industries",
    contact: "Akshatat Rajguru",
    phone: "+91 8830164600",
    email: "Akshata@industries.in",
    city: "Nashik",
    balance: 12800,
    status: "Inactive",
    invoices: 7,
  },
  {
    id: 4,
    name: "Diksha traders",
    contact: "Diksha Patil",
    phone: "+91 8830164600",
    email: "Diskha@patil.in",
    city: "Jalgaon",
    balance: -10000,
    status: "Active",
    invoices: 31,
  },
  {
    id: 5,
    name: "Sanchit Wholesale",
    contact: "Sanchit Mutkule",
    phone: "+91 8830164600",
    email: "Sanchit@wholesale.in",
    city: "Nashik",
    balance: 67500,
    status: "Active",
    invoices: 42,
  },
  {
    id: 6,
    name: "Nandini distributors",
    contact: "Nandini Thakare",
    phone: "+91 8830164600",
    email: "nandini@distributors.in",
    city: "Jalgaon",
    balance: -2100,
    status: "Active",
    invoices: 15,
  },
];

const suppliers = [
  {
    id: 1,
    name: "TechVision Pvt Ltd",
    contact: "Prathamesh",
    phone: "+91 9765969840",
    email: "prathamesh@techvision.in",
    city: "Nashik",
    balance: 125000,
    status: "Active",
  },
  {
    id: 2,
    name: "FabWorld Exports",
    contact: "Omkar",
    phone: "+91 9765969840",
    email: "Omkar@fabworld.in",
    city: "Dubai Phata",
    balance: 43000,
    status: "Active",
  },
  {
    id: 3,
    name: "AgriLink Wholesale",
    contact: "Sanchit",
    phone: "+91 9765969840",
    email: "Sanchit@agrilink.in",
    city: "Pune",
    balance: 8900,
    status: "Active",
  },
  {
    id: 4,
    name: "Metro Hardware Hub",
    contact: "Akshata",
    phone: "+91 9765969840",
    email: "Akshata@metrohardware.in",
    city: "Hyderabad",
    balance: 31200,
    status: "Inactive",
  },
];

const products = [
  {
    id: 1,
    name: "Boult Audio Airbus",
    sku: "EL-SGB-001",
    category: "Electronics",
    supplier: "TechVision Pvt Ltd",
    cost: 4200,
    price: 6999,
    stock: 48,
    minStock: 10,
    status: "Active",
  },
  {
    id: 2,
    name: "Max Fashion Shirt (L)",
    sku: "CL-CLS-002",
    category: "Clothing",
    supplier: "FabWorld Exports",
    cost: 350,
    price: 899,
    stock: 134,
    minStock: 20,
    status: "Active",
  },
  {
    id: 3,
    name: "Basmati Rice Premium 5kg",
    sku: "GR-BR5-003",
    category: "Groceries",
    supplier: "AgriLink Wholesale",
    cost: 320,
    price: 520,
    stock: 8,
    minStock: 25,
    status: "Active",
  },
  {
    id: 4,
    name: "Zeronics Mouse",
    sku: "HW-PDB-004",
    category: "Hardware",
    supplier: "Metro Hardware Hub",
    cost: 2800,
    price: 4499,
    stock: 22,
    minStock: 5,
    status: "Active",
  },
  {
    id: 5,
    name: "Owen",
    sku: "EL-WMK-005",
    category: "Electronics",
    supplier: "TechVision Pvt Ltd",
    cost: 1800,
    price: 3299,
    stock: 0,
    minStock: 8,
    status: "Inactive",
  },
  {
    id: 6,
    name: "Denim Jeans (32)",
    sku: "CL-DJS-006",
    category: "Clothing",
    supplier: "FabWorld Exports",
    cost: 650,
    price: 1499,
    stock: 76,
    minStock: 15,
    status: "Active",
  },
  {
    id: 7,
    name: "Olive Oil ",
    sku: "GR-OOE-007",
    category: "Groceries",
    supplier: "AgriLink Wholesale",
    cost: 280,
    price: 450,
    stock: 61,
    minStock: 30,
    status: "Active",
  },
];

const invoices = [
  {
    id: "INV-2024-1042",
    customer: "Raj Enterprises",
    date: "2024-08-14",
    amount: 28750,
    gst: 5175,
    total: 33925,
    status: "Paid",
    due: "2024-08-28",
  },
  {
    id: "INV-2024-1041",
    customer: "Mehta Traders",
    date: "2024-08-13",
    amount: 12400,
    gst: 2232,
    total: 14632,
    status: "Pending",
    due: "2024-08-27",
  },
  {
    id: "INV-2024-1040",
    customer: "Gupta Wholesale",
    date: "2024-08-12",
    amount: 67800,
    gst: 12204,
    total: 80004,
    status: "Paid",
    due: "2024-08-26",
  },
  {
    id: "INV-2024-1039",
    customer: "Sharma & Sons",
    date: "2024-08-11",
    amount: 5600,
    gst: 1008,
    total: 6608,
    status: "Overdue",
    due: "2024-08-18",
  },
  {
    id: "INV-2024-1038",
    customer: "Singh Distributors",
    date: "2024-08-10",
    amount: 19200,
    gst: 3456,
    total: 22656,
    status: "Paid",
    due: "2024-08-24",
  },
];

const expenses = [
  {
    id: 1,
    category: "Rent",
    description: "Office & Warehouse Rent - August",
    date: "2024-08-01",
    amount: 45000,
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  {
    id: 2,
    category: "Utilities",
    description: "Electricity & Internet Bills",
    date: "2024-08-05",
    amount: 8200,
    paymentMode: "UPI",
    status: "Paid",
  },
  {
    id: 3,
    category: "Salaries",
    description: "Staff Salaries - August",
    date: "2024-08-07",
    amount: 125000,
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  {
    id: 4,
    category: "Marketing",
    description: "Google Ads Campaign",
    date: "2024-08-10",
    amount: 15000,
    paymentMode: "Credit Card",
    status: "Paid",
  },
  {
    id: 5,
    category: "Logistics",
    description: "Delivery & Transport Costs",
    date: "2024-08-12",
    amount: 12400,
    paymentMode: "Cash",
    status: "Pending",
  },
];

const employees = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya@business.in",
    role: "Manager",
    department: "Operations",
    lastActive: "2 mins ago",
    status: "Active",
  },
  {
    id: 2,
    name: "Arjun Nair",
    email: "arjun@business.in",
    role: "Cashier",
    department: "Sales",
    lastActive: "1 hour ago",
    status: "Active",
  },
  {
    id: 3,
    name: "Kavita Reddy",
    email: "kavita@business.in",
    role: "Accountant",
    department: "Finance",
    lastActive: "Yesterday",
    status: "Active",
  },
  {
    id: 4,
    name: "Rahul Mishra",
    email: "rahul@business.in",
    role: "Cashier",
    department: "Sales",
    lastActive: "3 days ago",
    status: "Inactive",
  },
];

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Low Stock Alert",
    message: "Basmati Rice Premium 5kg has only 8 units remaining (Min: 25)",
    time: "10 mins ago",
    read: false,
  },
  {
    id: 2,
    type: "error",
    title: "Payment Overdue",
    message: "Invoice INV-2024-1039 from Sharma & Sons is overdue by 3 days",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "success",
    title: "Payment Received",
    message: "₹33,925 received from Raj Enterprises for INV-2024-1042",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "System Update",
    message: "BillTrack Pro v3.2.1 is now available with new GST features",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "warning",
    title: "Low Stock Alert",
    message: "Wireless Mechanical Keyboard is out of stock",
    time: "Yesterday",
    read: true,
  },
];

const businesses = [
  {
    id: 1,
    name: "Sharma Electronics",
    owner: "Vikram Sharma",
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
    plan: "Enterprise",
    users: 31,
    revenue: 2100000,
    status: "Active",
    joined: "2023-11-30",
  },
];

const posProducts = products.filter(
  (p) => p.stock > 0 && p.status === "Active",
);

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtK = (n) =>
  Number(n) >= 100000
    ? `₹${(Number(n) / 100000).toFixed(1)}L`
    : Number(n) >= 1000
      ? `₹${(Number(n) / 1000).toFixed(1)}K`
      : `₹${Number(n)}`;

// ─── DESIGN SYSTEM ─────────────────────────────────────────────────────────────

// TypeScript was removed because this is a .jsx file.
function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  icon,
}) {
  const base =
    "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer select-none";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[0.98]",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
    danger:
      "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-[0.98]",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {icon && icon}
      {children}
    </button>
  );
}

function Badge({ label, variant = "gray" }) {
  const v = {
    blue: "bg-red-50 text-red-700 border border-red-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    gray: "bg-slate-100 text-slate-600 border border-slate-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v[variant]}`}
    >
      {label}
    </span>
  );
}

function statusBadge(status) {
  const map = {
    Active: "green",
    Inactive: "gray",
    Paid: "green",
    Pending: "yellow",
    Overdue: "red",
    Received: "green",
    Suspended: "red",
    Pro: "blue",
    Enterprise: "purple",
    Starter: "gray",
  };
  return <Badge label={status} variant={map[status] ?? "gray"} />;
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function FixedPhoneInput({
  label,
  icon,
  placeholder,
  error,
  value: controlledValue,
  onChange,
}) {
  const PREFIX = "+91 ";
  const TEN = 10;
  const inputRef = useRef(null);

  const [internalValue, setInternalValue] = useState(PREFIX);
  const value = controlledValue ?? internalValue;

  const getDigits = (v) => {
    const raw = String(v ?? "");
    const withoutPrefix = raw.startsWith(PREFIX)
      ? raw.slice(PREFIX.length)
      : raw;
    return withoutPrefix.replace(/\D/g, "").slice(0, TEN);
  };

  const validate = (v) => {
    const raw = String(v ?? "");
    if (!raw || !raw.trim()) return "Phone field is required.";

    if (!raw.startsWith(PREFIX)) {
      return "Phone must contain exactly 10 numeric digits.";
    }

    const digitsPart = raw.slice(PREFIX.length);
    if (!digitsPart) return "Phone field is required.";

    if (digitsPart.length !== TEN) {
      return "Phone number must be exactly 10 digits.";
    }
    if (!/^\d{10}$/.test(digitsPart)) return "Phone number must be numeric.";

    return "";
  };

  const normaliseToFullValue = (digits) => `${PREFIX}${digits}`;
  const updateValue = (next) => {
    if (typeof onChange === "function") onChange(next);
    else setInternalValue(next);
  };

  const setCaret = (position) => {
    setTimeout(() => {
      try {
        inputRef.current?.setSelectionRange(position, position);
      } catch {}
    }, 0);
  };

  const setCaretToEnd = () => {
    const digitsLength = value.slice(PREFIX.length).length;
    const caret = Math.min(PREFIX.length + digitsLength, PREFIX.length + TEN);
    setCaret(caret);
  };

  useEffect(() => {
    setCaretToEnd();
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onKeyDown={(e) => {
            const input = inputRef.current;
            const selectionStart = input?.selectionStart ?? 0;
            const selectionEnd = input?.selectionEnd ?? 0;
            const prefixLength = PREFIX.length;

            if (e.key === "Backspace") {
              e.preventDefault();
              if (selectionStart <= prefixLength) {
                setCaretToEnd();
                return;
              }

              const digitStart = selectionStart - prefixLength;
              const digitEnd = selectionEnd - prefixLength;
              const currentDigits = value.slice(prefixLength);
              const start = Math.max(
                0,
                Math.min(digitStart, currentDigits.length),
              );
              const end = Math.max(0, Math.min(digitEnd, currentDigits.length));
              const nextDigits =
                currentDigits.slice(
                  0,
                  start - (selectionStart === selectionEnd ? 1 : 0),
                ) + currentDigits.slice(end);
              const caretPosition = Math.max(
                0,
                start - (selectionStart === selectionEnd ? 1 : 0),
              );
              updateValue(normaliseToFullValue(nextDigits));
              setCaret(prefixLength + caretPosition);
              return;
            }

            if (e.key === "Delete") {
              e.preventDefault();
              if (selectionStart < prefixLength) {
                setCaretToEnd();
                return;
              }

              const digitStart = selectionStart - prefixLength;
              const digitEnd = selectionEnd - prefixLength;
              const currentDigits = value.slice(prefixLength);
              const start = Math.max(
                0,
                Math.min(digitStart, currentDigits.length),
              );
              const end = Math.max(0, Math.min(digitEnd, currentDigits.length));
              const nextDigits =
                currentDigits.slice(0, start) +
                currentDigits.slice(
                  end + (selectionStart === selectionEnd ? 1 : 0),
                );
              const caretPosition = start;
              updateValue(normaliseToFullValue(nextDigits));
              setCaret(prefixLength + caretPosition);
              return;
            }

            if (selectionStart < prefixLength) {
              e.preventDefault();
              setCaretToEnd();
              return;
            }

            if (e.key === "ArrowLeft" && selectionStart <= prefixLength) {
              e.preventDefault();
              setCaretToEnd();
              return;
            }

            if (e.key === "ArrowRight" && selectionStart < prefixLength) {
              e.preventDefault();
              setCaretToEnd();
              return;
            }

            if (e.key.length === 1 && !/\d/.test(e.key)) {
              if (!e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
            }
          }}
          onBeforeInput={(e) => {
            const data = e.data;
            const selectionStart = inputRef.current?.selectionStart ?? 0;
            if (selectionStart < PREFIX.length) {
              e.preventDefault();
              return;
            }
            if (data && !/^\d+$/.test(data)) e.preventDefault();
          }}
          onChange={(e) => {
            const raw = String(e.target.value ?? "");
            const digits = getDigits(raw);
            const next = normaliseToFullValue(digits);
            updateValue(next);

            setTimeout(() => {
              try {
                const caret = Math.min(
                  PREFIX.length + digits.length,
                  PREFIX.length + TEN,
                );
                inputRef.current?.setSelectionRange(caret, caret);
              } catch {}
            }, 0);
          }}
          placeholder={placeholder}
          inputMode="numeric"
          className={`w-full border border-slate-200 rounded-lg bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all py-2.5 ${icon ? "pl-9 pr-3" : "px-3"} ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
        />
      </div>
      {error ? <p className="text-xs text-red-600 mt-0.5">{error}</p> : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  icon,
  className = "",
  inputClassName = "",
  error,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-slate-200 rounded-lg bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all py-2.5 ${icon ? "pl-9 pr-3" : "px-3"} ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""} ${inputClassName}`}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 rounded-lg bg-white text-sm text-slate-900 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function StatCard({ label, value, sub, trend, icon, color }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-500"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </Card>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-slate-500 mb-5">{message}</p>
          <div className="flex gap-3">
            <Btn variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Btn>
            <Btn
              variant="danger"
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 border-0"
            >
              Delete
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-xs">{sub}</p>
      {action}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  const colors = {
    success: "bg-emerald-600",
    error: "bg-red-500",
    info: "bg-red-600",
  };
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${colors[type]}`}
    >
      {type === "success" && <CheckCircle className="w-4 h-4" />}
      {type === "error" && <XCircle className="w-4 h-4" />}
      {type === "info" && <Info className="w-4 h-4" />}
      {message}
      <button onClick={onClose}>
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Main",
    items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Commerce",
    items: [
      { key: "customers", label: "Customers", icon: Users },
      { key: "suppliers", label: "Suppliers", icon: Truck },
      { key: "products", label: "Products", icon: Package },
    ],
  },
  {
    label: "Transactions",
    items: [
      { key: "pos", label: "Sales / Billing", icon: Receipt },
      { key: "purchase", label: "Purchase", icon: ShoppingCart },
      { key: "inventory", label: "Inventory", icon: Layers },
      { key: "expenses", label: "Expenses", icon: Wallet },
    ],
  },
  {
    label: "Insights",
    items: [{ key: "reports", label: "Reports", icon: BarChart3 }],
  },
  {
    label: "Administration",
    items: [
      { key: "users", label: "Users", icon: Shield },
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const SUPER_ADMIN_ITEMS = [
  { key: "super-dashboard", label: "Overview", icon: LayoutDashboard },
  { key: "customers", label: "Businesses", icon: Building2 },

  { key: "settings", label: "Settings", icon: Settings },
];


function Sidebar({ page, onNav, role, collapsed, onToggle }) {
  const isSuperAdmin = role === "superadmin";

  return (
    <aside
      className="flex flex-col bg-slate-900 transition-all duration-300 z-20 flex-shrink-0"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-slate-800 h-16 px-4 gap-3 flex-shrink-0`}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-4 h-4 text-white" />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Smart Bill</p>
            <p className="text-[10px] text-slate-500 capitalize">
              {role.replace("-", " ")}
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {isSuperAdmin ? (
          <div className="space-y-0.5 px-3">
            {SUPER_ADMIN_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = page === key;
              return (
                <button
                  key={key}
                  onClick={() => onNav(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                  {collapsed && (
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl">
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="px-6 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5 px-3">
                  {group.items.map(({ key, label, icon: Icon }) => {
                    const active = page === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onNav(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                        {collapsed && (
                          <span className="absolute left-14 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl">
                            {label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-4 h-4 text-blue-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Admin User
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                admin@business.in
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────

const PAGE_LABELS = {
  dashboard: "Dashboard",
  "super-dashboard": "Admin Overview",
  customers: "Customers",
  suppliers: "Suppliers",
  products: "Products",
  pos: "Sales & Billing",
  purchase: "Purchase",
  inventory: "Inventory",
  reports: "Reports",
  expenses: "Expenses",
  users: "User Management",
  settings: "Business Settings",
  notifications: "Notifications",
  profile: "Profile",
};

function Topbar({ page, onLogout, onNav, role, notifCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-900">
          {PAGE_LABELS[page]}
        </h1>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 border border-slate-200 w-52">
        <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
        />
      </div>

      {role === "owner" && (
        <Btn
          variant="primary"
          size="sm"
          onClick={() => onNav("pos")}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          New Invoice
        </Btn>
      )}

      <button
        onClick={() => onNav("notifications")}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {notifCount}
          </span>
        )}
      </button>

      <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">AU</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-800">Admin User</p>
          <p className="text-[10px] text-slate-500 capitalize">{role}</p>
        </div>
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Receipt,
    title: "Smart Invoicing",
    desc: "Generate GST-compliant invoices in seconds with customizable templates and auto-calculations.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Package2,
    title: "Inventory Management",
    desc: "Track stock in real-time with low-stock alerts, barcode scanning, and batch management.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Advanced Reports",
    desc: "P&L statements, GST reports, and 20+ business analytics with Excel/PDF export.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Users,
    title: "Multi-User Access",
    desc: "Role-based access control for Owner, Manager, Cashier, and Accountant profiles.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Globe,
    title: "Cloud-Based",
    desc: "Access your business data from anywhere, anytime on any device.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    desc: "256-bit SSL encryption, daily backups, and SOC 2 compliant infrastructure.",
    color: "bg-slate-100 text-slate-600",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: 999,
    period: "/month",
    color: "border-slate-200",
    badge: null,
    features: [
      "1 Business",
      "2 Users",
      "500 Invoices/month",
      "Basic Reports",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    price: 2499,
    period: "/month",
    color: "border-blue-500",
    badge: "Most Popular",
    features: [
      "3 Businesses",
      "10 Users",
      "Unlimited Invoices",
      "Advanced Reports",
      "GST Filing",
      "Priority Support",
      "Barcode Scanner",
    ],
  },
  {
    name: "Enterprise",
    price: 6999,
    period: "/month",
    color: "border-slate-200",
    badge: null,
    features: [
      "Unlimited Businesses",
      "Unlimited Users",
      "Everything in Pro",
      "Custom Integrations",
      "Dedicated Manager",
      "SLA Guarantee",
      "API Access",
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Vikram Sharma",
    role: "Owner, Sharma Electronics, Mumbai",
    text: "BillTrack Pro transformed how we manage inventory. We reduced stockouts by 80% and invoice errors are practically zero.",
    avatar: "VS",
    rating: 5,
  },
  {
    name: "Nirmala Patel",
    role: "MD, Mumbai Textiles",
    text: "The GST reports alone saved us 30 hours a month. Our accountant loves the automatic reconciliation feature.",
    avatar: "NP",
    rating: 5,
  },
  {
    name: "Amar Singh",
    role: "Proprietor, Delhi Grocers",
    text: "Switched from Tally and never looked back. The mobile-friendly POS is a game changer for our retail operations.",
    avatar: "AS",
    rating: 5,
  },
];

function LandingPage({ onNav }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Smart Bill</span>
          </div>
          <div className="hidden md:flex items-center gap-6 flex-1">
            {["Features", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Btn variant="ghost" onClick={() => onNav("login")}>
              Sign In
            </Btn>
            <Btn variant="primary" onClick={() => onNav("register")}>
              Start Free Trial
            </Btn>
          </div>
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden ml-auto text-slate-600"
          >
            {mobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 px-6 py-4 space-y-3 bg-white">
            {["Features", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="block text-sm text-slate-700 py-1.5"
              >
                {l}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => onNav("login")}
                className="flex-1"
              >
                Sign In
              </Btn>
              <Btn
                variant="primary"
                onClick={() => onNav("register")}
                className="flex-1"
              >
                Try Free
              </Btn>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            {/* <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs text-blue-700 font-medium mb-6">
              <Zap className="w-3 h-3" />
            </div> */}
            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              Run your entire business
              <br />
              <span className="text-blue-600">smarter & faster</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">
              Invoicing, inventory, GST filing, purchase orders, and financial
              reports — everything your business needs in one powerful platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Btn
                variant="primary"
                size="lg"
                onClick={() => onNav("register")}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Start 14-Day Free Trial
              </Btn>
            </div>
            <p className="text-xs text-slate-400 mt-6 leading-tight">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {/* Trusted by logos removed */}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Everything you need to run your business
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Powerful tools built for Indian businesses — from solo traders to
              enterprise chains.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
                >
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500">
              Start free for 14 days. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 p-8 relative ${plan.color} ${plan.badge ? "shadow-lg shadow-blue-100" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="font-bold text-slate-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Btn
                  variant={plan.badge ? "primary" : "outline"}
                  onClick={() => onNav("register")}
                  className="w-full justify-center"
                >
                  Get Started
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              What our customers say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {t.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to transform your business?
          </h2>
          <p className="text-blue-100 mb-8">
            Join 50,000+ businesses already using BillTrack Pro.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Btn
              variant="secondary"
              size="lg"
              onClick={() => onNav("register")}
            >
              Start Free Trial
            </Btn>
            <button className="text-blue-200 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">Smart Bill</span>
            </div>
            <p className="text-xs leading-relaxed">
              India's most trusted billing and inventory management platform.
            </p>
          </div>
          {[
            ["Product", ["Features", "Pricing", "Changelog", "Roadmap"]],
            ["Company", ["About", "Blog", "Careers", "Press"]],
            ["Support", ["Help Center", "API Docs", "Status", "Contact"]],
          ].map(([t, links]) => (
            <div key={t}>
              <p className="font-semibold text-white text-sm mb-2">{t}</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2"></div>
      </footer>
    </div>
  );
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────

function AuthScreen({ view, onNav, onLogin }) {
  const [role, setRole] = useState("owner");

  const [email, setEmail] = useState(
    view === "login" ? "admin@business.in" : "",
  );
  const [password, setPassword] = useState("");
  const [biz, setBiz] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [registerEmailError, setRegisterEmailError] = useState("");
  const [registerPasswordError, setRegisterPasswordError] = useState("");
  const [registerPhoneError, setRegisterPhoneError] = useState("");

  const isValidEmail = (raw) => {
    const trimmed = String(raw ?? "").trim();
    // Basic RFC 5322-ish validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const getLoginEmailError = (raw) => {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed) return "Email field is required.";
    if (!isValidEmail(trimmed)) return "Please enter a valid email address.";
    return "";
  };

  const validatePhone = (raw, required = true) => {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed || trimmed === "+91 " || trimmed === "+91") {
      return required ? "Phone field is required." : "";
    }

    if (!trimmed.startsWith("+91")) {
      return "Phone must start with +91.";
    }

    const digitsPart = trimmed.slice(PREFIX.length);
    if (!digitsPart) return required ? "Phone field is required." : "";
    if (!/^\d{10}$/.test(digitsPart)) {
      return "Phone number must be exactly 10 digits.";
    }

    return "";
  };

  const validatePassword = (raw) => {
    const p = String(raw ?? "");
    if (!p.trim()) return "Password field is required.";

    if (p.length < 8) return "Password must be at least 8 characters.";
    if (p.length > 32) return "Password must be at most 32 characters.";

    if (!/[A-Z]/.test(p))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(p))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(p)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(p))
      return "Password must contain at least one special character.";

    return "";
  };

  const handleSubmit = () => {
    if (view === "login") {
      const errEmail = getLoginEmailError(email);
      const errPassword = validatePassword(password);

      setLoginEmailError(errEmail);
      setLoginPasswordError(errPassword);

      if (errEmail || errPassword) return;
    }

    if (view === "register") {
      const errEmail = getLoginEmailError(email);
      const errPassword = validatePassword(password);
      const errPhone = validatePhone(phone);

      setRegisterEmailError(errEmail);
      setRegisterPasswordError(errPassword);
      setRegisterPhoneError(errPhone);

      if (errEmail || errPassword || errPhone) return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (view === "login") onLogin(role);
    }, 900);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 bg-slate-900 relative overflow-hidden p-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="flex items-center gap-2.5 mb-10 relative z-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Smart Bill</span>
        </div>
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full">
            <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
              Manage your business
              <br />
              with confidence
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Complete billing, inventory, and accounting in one platform.
              GST-ready, cloud-based, and built for India.
            </p>
            <div className="space-y-3">
              {[
                "100% GST Compliant invoicing",
                "Real-time inventory tracking",
                "Profit & Loss statements",
                "Multi-user role access",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <button
            onClick={() => onNav("landing")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowRight className="w-3 h-3 rotate-180" /> Back to home
          </button>

          {view === "login" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Sign in to your BillTrack account
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Login As
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["owner", "superadmin"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all capitalize ${role === r ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                      >
                        {r === "superadmin" ? "Super Admin" : "Business Owner"}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  label="Email Address"
                  value={email}
                  onChange={(v) => {
                    const trimmed = String(v ?? "").trimStart();
                    // Keep cursor-friendly typing, but remove leading spaces.
                    setEmail(trimmed);
                    // Auto-clear / update error as soon as input becomes valid.
                    if (trimmed && isValidEmail(trimmed))
                      setLoginEmailError("");
                    else
                      setLoginEmailError(
                        view === "login" ? getLoginEmailError(trimmed) : "",
                      );
                  }}
                  placeholder=""
                  icon={<Mail className="w-4 h-4" />}
                  error={loginEmailError}
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    // Auto-clear / update error as soon as password becomes valid.
                    const err = validatePassword(v);
                    if (!err) setLoginPasswordError("");
                    else setLoginPasswordError(err);
                  }}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={loginPasswordError}
                />
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-blue-600"
                    />
                    Remember me
                  </label>
                  <button
                    onClick={() => onNav("forgot")}
                    className="text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Btn
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="w-full justify-center"
                  disabled={loading}
                  icon={
                    loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )
                  }
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Btn>
              </div>
              <p className="text-xs text-center text-slate-500 mt-5">
                Don't have an account?{" "}
                <button
                  onClick={() => onNav("register")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Register Business
                </button>
              </p>
            </>
          )}

          {view === "register" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Start your 14-day free trial. No credit card needed.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First Name" placeholder="" />
                  <Input label="Last Name" placeholder="" />
                </div>
                <Input
                  label="Business Name"
                  value={biz}
                  onChange={setBiz}
                  placeholder=""
                  icon={<Building2 className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    const err = getLoginEmailError(v);
                    if (!err) setRegisterEmailError("");
                    else setRegisterEmailError(err);
                  }}
                  placeholder=""
                  icon={<Mail className="w-4 h-4" />}
                  error={registerEmailError}
                />
                <FixedPhoneInput
                  label="Phone"
                  placeholder="+91"
                  icon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    setRegisterPhoneError(validatePhone(value, false));
                  }}
                  error={registerPhoneError}
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    const err = validatePassword(v);
                    if (!err) setRegisterPasswordError("");
                    else setRegisterPasswordError(err);
                  }}
                  placeholder="Min. 8 characters"
                  icon={<Lock className="w-4 h-4" />}
                  error={registerPasswordError}
                />
                <Select
                  label="Business Type"
                  value="Retail"
                  onChange={() => {}}
                  options={[
                    "Retail",
                    "Wholesale",
                    "Manufacturing",
                    "Services",
                    "Distribution",
                  ]}
                />
                <Btn
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="w-full justify-center"
                  disabled={loading}
                  icon={
                    loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : undefined
                  }
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Btn>
                <p className="text-[10px] text-slate-400 text-center">
                  By registering, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
              <p className="text-xs text-center text-slate-500 mt-4">
                Already registered?{" "}
                <button
                  onClick={() => onNav("login")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Reset your password
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Enter your email and we'll send a reset link.
              </p>
              {sent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900 mb-1">
                    Check your email
                  </p>
                  <p className="text-sm text-slate-500">
                    We sent a password reset link to {email}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    placeholder=""
                    icon={<Mail className="w-4 h-4" />}
                  />
                  <Btn
                    variant="primary"
                    size="lg"
                    onClick={() => setSent(true)}
                    className="w-full justify-center"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Reset Link
                  </Btn>
                </div>
              )}
              <p className="text-xs text-center text-slate-500 mt-4">
                <button
                  onClick={() => onNav("login")}
                  className="text-blue-600 font-medium hover:underline"
                >
                  ← Back to Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUPER ADMIN DASHBOARD ────────────────────────────────────────────────────

function BusinessesScreen() {
  const [search, setSearch] = useState("");

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.owner.toLowerCase().includes(search.toLowerCase()) ||
      b.plan.toLowerCase().includes(search.toLowerCase()) ||
      String(b.status).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search businesses..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Btn
            variant="outline"
            size="md"
            icon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Btn>
          <Btn
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Btn>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Business Management</h3>
          <div className="flex gap-2">
            <Btn
              variant="outline"
              size="sm"
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Filter
            </Btn>
            <Btn
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Btn>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Business",
                  "Owner",
                  "Plan",
                  "Users",
                  "Revenue",
                  "Status",
                  "Joined",
                ].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      icon={<Building2 className="w-6 h-6" />}
                      title="No businesses found"
                      sub="Try adjusting your search query"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {b.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{b.owner}</td>
                    <td className="px-5 py-3.5">{statusBadge(b.plan)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{b.users}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {fmt(b.revenue)}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(b.status)}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                      {b.joined}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {businesses.length} businesses
          </p>
        </div>
      </Card>
    </div>
  );
}


function SuperAdminDashboard() {
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
        <Card className="lg:col-span-2 p-5">
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
              {["3M", "6M", "1Y"].map((t) => (
                <button
                  key={t}
                  className={`text-xs px-2.5 py-1 rounded-lg ${t === "6M" ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={adminStats}>
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
        <Card className="p-5">
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

// ─── BUSINESS DASHBOARD ───────────────────────────────────────────────────────

function BusinessDashboard({ onNav }) {
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

// ─── CUSTOMERS SCREEN ─────────────────────────────────────────────────────────

function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
    openingBalance: "0",
  });

  const [toast, setToast] = useState(null);

  // Local editable list (so added customers appear below in the table)
  const [customerList, setCustomerList] = useState(customers);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
    openingBalance: "0",
  });

  const filtered = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()),
  );

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {deleteId !== null && (
        <ConfirmDialog
          message="This will permanently delete the customer and all their data."
          onConfirm={() => {
            setCustomerList((prev) => prev.filter((c) => c.id !== deleteId));
            setDeleteId(null);
            showToast("Customer deleted successfully", "success");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {viewCustomer && (
        <Modal title="Customer Details" onClose={() => setViewCustomer(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Business Name
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {viewCustomer.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact Person
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.contact || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.phone || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.email || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  City
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.city || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Balance
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {fmt(Math.abs(viewCustomer.balance || 0))}
                  {viewCustomer.balance > 0
                    ? " (To Receive)"
                    : viewCustomer.balance < 0
                      ? " (To Pay)"
                      : " (Balanced)"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoices
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.invoices ?? 0}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && editId !== null && (
        <Modal
          title="Edit Customer"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Business Name"
                placeholder="Raj Enterprises"
                value={editForm.name}
                onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
              />
              <Input
                label="Contact Person"
                placeholder="Rajesh Kumar"
                value={editForm.contact}
                onChange={(v) => setEditForm((f) => ({ ...f, contact: v }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={editForm.phone}
                onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
              />
              <Input
                label="Email"
                placeholder="rajesh@raj.in"
                icon={<Mail className="w-4 h-4" />}
                value={editForm.email}
                onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
              />
            </div>

            <Input
              label="City"
              placeholder="Mumbai"
              icon={<MapPin className="w-4 h-4" />}
              value={editForm.city}
              onChange={(v) => setEditForm((f) => ({ ...f, city: v }))}
            />

            <Input
              label="GST Number"
              placeholder="27AAPCS0510Q1Z6"
              value={editForm.gst}
              onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
            />

            <Input
              label="Opening Balance (₹)"
              placeholder="0"
              value={editForm.openingBalance}
              onChange={(v) =>
                setEditForm((f) => ({ ...f, openingBalance: v }))
              }
            />

            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditId(null);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const opening = Number(editForm.openingBalance || 0);
                  setCustomerList((prev) =>
                    prev.map((c) =>
                      c.id === editId
                        ? {
                            ...c,
                            name: editForm.name || c.name,
                            contact: editForm.contact || "",
                            phone: editForm.phone || "",
                            email: editForm.email || "",
                            city: editForm.city || "",
                            balance: Number.isFinite(opening) ? opening : 0,
                          }
                        : c,
                    ),
                  );
                  setShowEditModal(false);
                  setEditId(null);
                  showToast("Customer updated successfully", "success");
                }}
                className="flex-1 justify-center"
              >
                Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title="Add New Customer" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Business Name"
                placeholder="Raj Enterprises"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Input
                label="Contact Person"
                placeholder="Rajesh Kumar"
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <Input
                label="Email"
                placeholder="rajesh@raj.in"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
            </div>
            <Input
              label="City"
              placeholder="Mumbai"
              icon={<MapPin className="w-4 h-4" />}
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <Input
              label="GST Number"
              placeholder="27AAPCS0510Q1Z6"
              value={form.gst}
              onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
            />
            <Input
              label="Opening Balance (₹)"
              placeholder="0"
              value={form.openingBalance}
              onChange={(v) => setForm((f) => ({ ...f, openingBalance: v }))}
            />
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const newId =
                    customerList.length > 0
                      ? Math.max(...customerList.map((x) => x.id)) + 1
                      : 1;

                  const opening = Number(form.openingBalance || 0);

                  const newCustomer = {
                    id: newId,
                    name: form.name || "New Customer",
                    contact: form.contact || "",
                    phone: form.phone || "",
                    email: form.email || "",
                    city: form.city || "",
                    balance: Number.isFinite(opening) ? opening : 0,
                    status: "Active",
                    invoices: 0,
                  };

                  setCustomerList((prev) => [...prev, newCustomer]);
                  setShowModal(false);
                  showToast("Customer added successfully", "success");

                  setForm({
                    name: "",
                    contact: "",
                    phone: "",
                    email: "",
                    city: "",
                    gst: "",
                    openingBalance: "0",
                  });
                }}
                className="flex-1 justify-center"
              >
                Save Customer
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search customers..."
          icon={<Search className="w-4 h-4" />}
        />
        <Btn
          variant="outline"
          size="md"
          icon={<Download className="w-4 h-4" />}
        >
          Export
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Customer
        </Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["342", "Total Customers"],
          ["₹1.8L", "Total Receivable"],
          ["₹10.5K", "Total Payable"],
        ].map(([v, l]) => (
          <Card key={l} className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{v}</p>
            <p className="text-xs text-slate-500 mt-0.5">{l}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Business",
                  "Contact",
                  "Phone",
                  "City",
                  "Balance",
                  "Actions",
                ].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      icon={<Users className="w-6 h-6" />}
                      title="No customers found"
                      sub="Try adjusting your search query"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">
                        {c.invoices} invoices
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.contact}</td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                      {c.phone}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.city}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold font-mono text-sm ${c.balance > 0 ? "text-emerald-600" : c.balance < 0 ? "text-red-500" : "text-slate-500"}`}
                      >
                        {c.balance > 0 ? "+" : ""}
                        {fmt(Math.abs(c.balance))}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {c.balance >= 0 ? "To Receive" : "To Pay"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewCustomer(c);
                          }}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            setEditId(c.id);
                            setEditForm({
                              name: c.name,
                              contact: c.contact,
                              phone: c.phone,
                              email: c.email,
                              city: c.city,
                              gst: "",
                              openingBalance: String(c.balance ?? 0),
                            });
                          }}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(c.id);
                          }}
                          icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {customerList.length} customers
          </p>

          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 text-xs rounded-lg ${p === 1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── SUPPLIERS SCREEN ─────────────────────────────────────────────────────────

function SuppliersScreen() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
    balance: 0,
    status: "Active",
  });
  const [toast, setToast] = useState(null);

  // Local editable list (so added suppliers appear below in the table)
  const [supplierList, setSupplierList] = useState(suppliers);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
  });

  const filtered = supplierList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deleteId !== null && (
        <ConfirmDialog
          message="This will permanently delete the supplier."
          onConfirm={() => {
            setSupplierList((prev) => prev.filter((s) => s.id !== deleteId));
            setDeleteId(null);
            setShowEditModal(false);
            showToast("Supplier deleted successfully", "success");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {viewSupplier && (
        <Modal title="Supplier Details" onClose={() => setViewSupplier(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company Name
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {viewSupplier.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact Person
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.contact || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.phone || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.email || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  City
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.city || "—"}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Balance Due
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {fmt(viewSupplier.balance || 0)}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && editId !== null && (
        <Modal
          title="Edit Supplier"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
          }}
        >
          <div className="space-y-4">
            <Input
              label="Company Name"
              placeholder="TechVision Pvt Ltd"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                placeholder="Arun Verma"
                value={editForm.contact}
                onChange={(v) => setEditForm((f) => ({ ...f, contact: v }))}
              />
              <Input
                label="Phone"
                placeholder="+91"
                icon={<Phone className="w-4 h-4" />}
                value={editForm.phone}
                onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
              />
            </div>
            <Input
              label="Email"
              placeholder="arun@techvision.in"
              icon={<Mail className="w-4 h-4" />}
              value={editForm.email}
              onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Bangalore"
                value={editForm.city}
                onChange={(v) => setEditForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="GST Number"
                placeholder="29ABCDE1234F1Z5"
                value={editForm.gst}
                onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditId(null);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  setSupplierList((prev) =>
                    prev.map((s) =>
                      s.id === editId
                        ? {
                            ...s,
                            name: editForm.name || s.name,
                            contact: editForm.contact || "",
                            phone: editForm.phone || "",
                            email: editForm.email || "",
                            city: editForm.city || "",
                            balance: Number.isFinite(Number(s.balance))
                              ? Number(s.balance)
                              : 0,
                            status: editForm.status || s.status,
                          }
                        : s,
                    ),
                  );
                  setShowEditModal(false);
                  setEditId(null);
                  showToast("Supplier updated successfully", "success");
                }}
                className="flex-1 justify-center"
              >
                Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title="Add New Supplier" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Input
              label="Company Name"
              placeholder="TechVision Pvt Ltd"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                placeholder="Arun Verma"
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
            </div>
            <Input
              label="Email"
              placeholder="arun@techvision.in"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Bangalore"
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="GST Number"
                placeholder="29ABCDE1234F1Z5"
                value={form.gst}
                onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const newId =
                    supplierList.length > 0
                      ? Math.max(...supplierList.map((x) => x.id)) + 1
                      : 1;

                  const newSupplier = {
                    id: newId,
                    name: form.name || "New Supplier",
                    contact: form.contact || "",
                    phone: form.phone || "",
                    email: form.email || "",
                    city: form.city || "",
                    balance: 0,
                    status: "Active",
                  };

                  setSupplierList((prev) => [...prev, newSupplier]);
                  setShowModal(false);
                  showToast("Supplier added successfully", "success");

                  setForm({
                    name: "",
                    contact: "",
                    phone: "",
                    email: "",
                    city: "",
                    gst: "",
                  });
                }}
                className="flex-1 justify-center"
              >
                Save Supplier
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search suppliers..."
          icon={<Search className="w-4 h-4" />}
        />
        <Btn
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Supplier
        </Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Supplier",
                  "Contact",
                  "Phone",
                  "City",
                  "Balance Due",
                  "Actions",
                ].map((h) => (
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
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.contact}</td>
                  <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                    {s.phone}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.city}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {fmt(s.balance)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewSupplier(s);
                        }}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      />
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditModal(true);
                          setEditId(s.id);
                          setEditForm({
                            name: s.name,
                            contact: s.contact,
                            phone: s.phone,
                            email: s.email,
                            city: s.city,
                            gst: "",
                            balance: s.balance,
                            status: s.status,
                          });
                        }}
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                      />
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(s.id);
                        }}
                        icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PRODUCTS SCREEN ──────────────────────────────────────────────────────────

function ProductsScreen() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [catFilter, setCatFilter] = useState("All");

  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    supplier: "",
    cost: "0",
    price: "0",
    gst: "",
    stock: "0",
    minStock: "10",
    unit: "Piece",
  });
  const [toast, setToast] = useState(null);

  // Make products editable so "Save Product" updates the table below.
  const [productList, setProductList] = useState(products);

  // --- ADDED FOR DYNAMIC CATEGORIES IN PROJECT 1 ---
  const [categories, setCategories] = useState([
    "Electronics",
    "Clothing",
    "Groceries",
    "Hardware",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [showEditCategoryInput, setShowEditCategoryInput] = useState(false);
  // -------------------------------------------------

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    supplier: suppliers[0]?.name ?? "",
    cost: "0",
    price: "0",
    gst: "",
    stock: "0",
    minStock: "10",
    unit: "Piece",
  });

  const filtered = productList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.includes(search);
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deleteId !== null && (
        <ConfirmDialog
          message="This will permanently delete the product."
          onConfirm={() => {
            setProductList((prev) => prev.filter((p) => p.id !== deleteId));
            setDeleteId(null);
            setShowEditModal(false);
            showToast("Product deleted successfully", "success");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && editId !== null && (
        <Modal
          title="Edit Product"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
            setShowEditCategoryInput(false);
          }}
        >
          <div className="space-y-4">
            <Input
              label="Product Name"
              placeholder="Samsung Galaxy Buds Pro"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="SKU / Barcode"
                placeholder="EL-SGB-001"
                value={editForm.sku}
                onChange={(v) => setEditForm((f) => ({ ...f, sku: v }))}
              />
              <Select
                label="Category"
                value={editForm.category}
                onChange={(v) => {
                  if (v === "+ Add Category") {
                    setShowEditCategoryInput(true);
                  } else {
                    setEditForm((f) => ({ ...f, category: v }));
                    setShowEditCategoryInput(false);
                  }
                }}
                options={[...categories, "+ Add Category"]}
              />
            </div>

            {/* Conditionally rendered Add Category field in Edit Modal */}
            {showEditCategoryInput && (
              <div className="space-y-2 border border-blue-100 p-3 rounded-lg bg-slate-50/50">
                <Input
                  label="New Category"
                  value={newCategory}
                  onChange={setNewCategory}
                  placeholder="Enter category name"
                />
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (newCategory.trim()) {
                      setCategories([...categories, newCategory]);
                      setEditForm((f) => ({ ...f, category: newCategory }));
                      setNewCategory("");
                      setShowEditCategoryInput(false);
                    }
                  }}
                >
                  Save Category
                </Btn>
              </div>
            )}

            <Select
              label="Supplier"
              value={editForm.supplier}
              onChange={(v) => setEditForm((f) => ({ ...f, supplier: v }))}
              options={suppliers.map((s) => s.name)}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Cost Price (₹)"
                placeholder="4200"
                value={editForm.cost}
                onChange={(v) => setEditForm((f) => ({ ...f, cost: v }))}
              />
              <Input
                label="Selling Price (₹)"
                placeholder="6999"
                value={editForm.price}
                onChange={(v) => setEditForm((f) => ({ ...f, price: v }))}
              />
              <Input
                label="GST %"
                placeholder="18"
                value={editForm.gst}
                onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Opening Stock"
                placeholder="0"
                value={editForm.stock}
                onChange={(v) => setEditForm((f) => ({ ...f, stock: v }))}
              />
              <Input
                label="Min. Stock Level"
                placeholder="10"
                value={editForm.minStock}
                onChange={(v) => setEditForm((f) => ({ ...f, minStock: v }))}
              />
            </div>

            <Select
              label="Unit"
              value={editForm.unit}
              onChange={(v) => setEditForm((f) => ({ ...f, unit: v }))}
              options={["Piece", "Kg", "Litre", "Box", "Dozen", "Metre"]}
            />

            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditId(null);
                  setShowEditCategoryInput(false);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const cost = Number(editForm.cost || 0);
                  const price = Number(editForm.price || 0);
                  const stock = Number(editForm.stock || 0);
                  const minStock = Number(editForm.minStock || 0);

                  setProductList((prev) =>
                    prev.map((p) =>
                      p.id === editId
                        ? {
                            ...p,
                            name: editForm.name || p.name,
                            sku: editForm.sku || p.sku,
                            category: editForm.category || p.category,
                            supplier: editForm.supplier || p.supplier,
                            cost: Number.isFinite(cost) ? cost : 0,
                            price: Number.isFinite(price) ? price : 0,
                            stock: Number.isFinite(stock) ? stock : 0,
                            minStock: Number.isFinite(minStock) ? minStock : 0,
                            status: p.status,
                          }
                        : p,
                    ),
                  );
                  setShowEditModal(false);
                  setEditId(null);
                  setShowEditCategoryInput(false);
                  showToast("Product updated successfully", "success");
                }}
                className="flex-1 justify-center"
              >
                Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showModal && (
        <Modal 
          title="Add New Product" 
          onClose={() => {
            setShowModal(false);
            setShowCategoryInput(false);
          }}
        >
          <div className="space-y-4">
            <Input
              label="Product Name"
              placeholder="Samsung Galaxy Buds Pro"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="SKU / Barcode"
                placeholder="EL-SGB-001"
                value={form.sku}
                onChange={(v) => setForm((f) => ({ ...f, sku: v }))}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(v) => {
                  if (v === "+ Add Category") {
                    setShowCategoryInput(true);
                  } else {
                    setForm((f) => ({ ...f, category: v }));
                    setShowCategoryInput(false);
                  }
                }}
                options={[...categories, "+ Add Category"]}
              />
            </div>

            {/* Conditionally rendered Add Category field in Add Modal */}
            {showCategoryInput && (
              <div className="space-y-2 border border-blue-100 p-3 rounded-lg bg-slate-50/50">
                <Input
                  label="New Category"
                  value={newCategory}
                  onChange={setNewCategory}
                  placeholder="Enter category name"
                />
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (newCategory.trim()) {
                      setCategories([...categories, newCategory]);
                      setForm((f) => ({ ...f, category: newCategory }));
                      setNewCategory("");
                      setShowCategoryInput(false);
                    }
                  }}
                >
                  Save Category
                </Btn>
              </div>
            )}

            <Select
              label="Supplier"
              value={form.supplier}
              onChange={(v) => setForm((f) => ({ ...f, supplier: v }))}
              options={suppliers.map((s) => s.name)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Cost Price (₹)"
                placeholder="4200"
                value={form.cost}
                onChange={(v) => setForm((f) => ({ ...f, cost: v }))}
              />
              <Input
                label="Selling Price (₹)"
                placeholder="6999"
                value={form.price}
                onChange={(v) => setForm((f) => ({ ...f, price: v }))}
              />
              <Input
                label="GST %"
                placeholder="18"
                value={form.gst}
                onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Opening Stock"
                placeholder="0"
                value={form.stock}
                onChange={(v) => setForm((f) => ({ ...f, stock: v }))}
              />
              <Input
                label="Min. Stock Level"
                placeholder="10"
                value={form.minStock}
                onChange={(v) => setForm((f) => ({ ...f, minStock: v }))}
              />
            </div>
            <Select
              label="Unit"
              value={form.unit}
              onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
              options={["Piece", "Kg", "Litre", "Box", "Dozen", "Metre"]}
            />
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setShowCategoryInput(false);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const newId =
                    productList.length > 0
                      ? Math.max(...productList.map((x) => x.id)) + 1
                      : 1;

                  const cost = Number(form.cost || 0);
                  const price = Number(form.price || 0);
                  const stock = Number(form.stock || 0);
                  const minStock = Number(form.minStock || 0);

                  setProductList((prev) => [
                    ...prev,
                    {
                      id: newId,
                      name: form.name || "New Product",
                      sku: form.sku || `SKU-${newId}`,
                      category: form.category || "Electronics",
                      supplier: form.supplier || (suppliers[0]?.name ?? ""),
                      cost: Number.isFinite(cost) ? cost : 0,
                      price: Number.isFinite(price) ? price : 0,
                      stock: Number.isFinite(stock) ? stock : 0,
                      minStock: Number.isFinite(minStock) ? minStock : 0,
                      status: "Active",
                    },
                  ]);

                  setShowModal(false);
                  setShowCategoryInput(false);
                  setForm({
                    name: "",
                    sku: "",
                    category: "Electronics",
                    supplier: suppliers[0]?.name ?? "",
                    cost: "0",
                    price: "0",
                    gst: "",
                    stock: "0",
                    minStock: "10",
                    unit: "Piece",
                  });
                }}
                className="flex-1 justify-center"
              >
                Save Product
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* FILTER AND HEADER CONTROLS */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search by name, SKU..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${catFilter === c ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <Btn variant="outline" size="md" icon={<Upload className="w-4 h-4" />}>
          Import
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Btn>
      </div>

      {/* TABLE SECTION */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Supplier",
                  "Cost",
                  "Price",
                  "Stock",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const lowStock = p.stock <= p.minStock;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 max-w-[200px] truncate">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      {p.sku}
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={p.category} variant="blue" />
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs truncate max-w-[140px]">
                      {p.supplier}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{fmt(p.cost)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {fmt(p.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-mono font-semibold text-sm ${p.stock === 0 ? "text-blue-600" : lowStock ? "text-amber-600" : "text-slate-900"}`}
                      >
                        {p.stock}
                      </span>
                      {lowStock && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            setEditId(p.id);
                            setEditForm({
                              name: p.name,
                              sku: p.sku,
                              category: p.category,
                              supplier: p.supplier,
                              cost: String(p.cost ?? 0),
                              price: String(p.price ?? 0),
                              gst: "",
                              stock: String(p.stock ?? 0),
                              minStock: String(p.minStock ?? 0),
                              unit: "Piece",
                            });
                          }}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(p.id);
                          }}
                          icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {products.length} products
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 text-xs rounded-lg ${p === 1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
// ─── POS / BILLING SCREEN ─────────────────────────────────────────────────────

function POSScreen() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [search, setSearch] = useState("");
  const [gstRate] = useState(18);
  const [showInvoice, setShowInvoice] = useState(false);

  const filteredProducts = posProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.includes(search),
  );
  const addToCart = (p) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex)
        return c.map((i) =>
          i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...c, { product: p, qty: 1, discount: 0 }];
    });
  };
  const updateQty = (id, delta) => {
    setCart((c) =>
      c
        .map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };
  const removeItem = (id) =>
    setCart((c) => c.filter((i) => i.product.id !== id));

  const subtotal = cart.reduce(
    (s, i) => s + i.product.price * i.qty * (1 - i.discount / 100),
    0,
  );
  const gst = Math.round((subtotal * gstRate) / 100);
  const total = subtotal + gst;

  if (showInvoice) {
    return (
      <div className="max-w-2xl mx-auto">
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => setShowInvoice(false)}
          className="mb-4"
        >
          ← Back to Billing
        </Btn>
        <Card className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900">BillTrack Pro</span>
              </div>
              <p className="text-xs text-slate-500">Sharma Traders, Mumbai</p>
              <p className="text-xs text-slate-500">GSTIN: 27AAPCS0510Q1Z6</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600 font-mono text-lg">
                INV-2024-1043
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date: {new Date().toLocaleDateString("en-IN")}
              </p>
              <Badge label="Paid" variant="green" />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-1">Bill To:</p>
            <p className="font-semibold text-slate-900">{customer}</p>
          </div>
          <table className="w-full text-sm mb-5">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left pb-2 text-xs text-slate-500">Item</th>
                <th className="text-center pb-2 text-xs text-slate-500">Qty</th>
                <th className="text-right pb-2 text-xs text-slate-500">Rate</th>
                <th className="text-right pb-2 text-xs text-slate-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((i) => (
                <tr key={i.product.id}>
                  <td className="py-2.5 text-slate-800">{i.product.name}</td>
                  <td className="py-2.5 text-center text-slate-600">{i.qty}</td>
                  <td className="py-2.5 text-right font-mono text-slate-700">
                    {fmt(i.product.price)}
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                    {fmt(i.product.price * i.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-52 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({gstRate}%)</span>
                <span className="font-mono">+{fmt(gst)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-2">
                <span>Total</span>
                <span className="font-mono text-blue-600">{fmt(total)}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
            <Btn variant="primary" icon={<Printer className="w-4 h-4" />}>
              Print Invoice
            </Btn>
            <Btn variant="outline" icon={<Download className="w-4 h-4" />}>
              Download PDF
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setShowInvoice(false);
                setCart([]);
              }}
            >
              New Invoice
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-160px)]">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center gap-3">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search product or scan barcode..."
            icon={<ScanLine className="w-4 h-4" />}
          />
          <Btn
            variant="outline"
            size="md"
            icon={<ScanLine className="w-4 h-4" />}
          >
            Scan
          </Btn>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-400 hover:shadow-md transition-all group active:scale-[0.98]"
            >
              <div className="w-full h-20 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-900 mb-1 line-clamp-2 leading-snug">
                {p.name}
              </p>
              <p className="text-xs text-slate-400 font-mono mb-2">{p.sku}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">
                  {fmt(p.price)}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.stock < 10 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                >
                  Stock: {p.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <Card className="w-80 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-3">Current Bill</h3>
          <Select
            label="Customer"
            value={customer}
            onChange={setCustomer}
            options={["Walk-in Customer", ...customers.map((c) => c.name)]}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Cart is empty</p>
              <p className="text-xs text-slate-400">Click products to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-900 flex-1 leading-snug">
                    {item.product.name}
                  </p>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center hover:bg-slate-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-slate-900 w-6 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {fmt(item.product.price * item.qty)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST ({gstRate}%)</span>
              <span className="font-mono">+{fmt(gst)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-1.5 mt-1.5">
              <span>Total</span>
              <span className="font-mono text-blue-600">{fmt(total)}</span>
            </div>
          </div>
          <Select
            label="Payment Mode"
            value={paymentMode}
            onChange={setPaymentMode}
            options={["Cash", "UPI", "Card", "Bank Transfer", "Credit"]}
          />
          <Btn
            variant="success"
            onClick={() => cart.length > 0 && setShowInvoice(true)}
            disabled={cart.length === 0}
            className="w-full justify-center"
            icon={<Receipt className="w-4 h-4" />}
          >
            Generate Invoice
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── PURCHASE SCREEN ──────────────────────────────────────────────────────────

function PurchaseScreen() {
  const [activeTab, setActiveTab] = useState("entry");
  const [supplier, setSupplier] = useState(suppliers[0]?.name ?? "");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { product: products[0]?.name ?? "", qty: "", rate: "", amount: "" },
  ]);
  const [purchaseList, setPurchaseList] = useState([
    {
      id: "PO-2024-038",
      supplier: "TechVision Pvt Ltd",
      invoiceNo: "SUPP-INV-001",
      date: "2024-08-10",
      items: 5,
      total: 124800,
      status: "Received",
    },
    {
      id: "PO-2024-037",
      supplier: "FabWorld Exports",
      invoiceNo: "SUPP-INV-002",
      date: "2024-08-07",
      items: 12,
      total: 48200,
      status: "Received",
    },
    {
      id: "PO-2024-036",
      supplier: "AgriLink Wholesale",
      invoiceNo: "SUPP-INV-003",
      date: "2024-08-03",
      items: 8,
      total: 32600,
      status: "Pending",
    },
  ]);
  const [searchHistory, setSearchHistory] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const gstRate = 18;
  const gst = subtotal * (gstRate / 100);
  const discount = 0;
  const total = subtotal + gst - discount;

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const nextItem = { ...item, [field]: value };

        if (field === "product") {
  const selectedProduct = products.find(
    (p) => p.name === value
  );

  if (selectedProduct) {
    nextItem.rate = selectedProduct.cost;

    const qty = Number(nextItem.qty) || 0;
    nextItem.amount = qty * nextItem.rate;
  }
}

if (field === "qty") {
  const qty = Number(value) || 0;
  const rate = Number(nextItem.rate) || 0;

  nextItem.amount = qty * rate;
}

if (field === "rate") {
  const qty = Number(nextItem.qty) || 0;
  const rate = Number(value) || 0;

  nextItem.amount = qty * rate;
}

        if (field === "qty" || field === "rate") {
          const qty =
            field === "qty"
              ? value === ""
                ? ""
                : Number(value)
              : item.qty === ""
                ? ""
                : Number(item.qty);
          const rate =
            field === "rate"
              ? value === ""
                ? ""
                : Number(value)
              : item.rate === ""
                ? ""
                : Number(item.rate);
          nextItem.amount =
            qty === "" || rate === "" || Number(qty) <= 0 || Number(rate) < 0
              ? ""
              : Number(qty) * Number(rate);
        }

        return nextItem;
      }),
    );
  };

  const handleSavePurchase = () => {
    const validItems = items.filter(
      (item) =>
        item.product &&
        item.product !== "Select Product" &&
        Number(item.qty || 0) > 0 &&
        Number(item.rate || 0) >= 0,
    );

    if (validItems.length === 0) {
      showToast("Please add at least one valid product", "error");
      return;
    }

    const newPurchase = {
      id: `PO-${new Date().getFullYear()}-${String(purchaseList.length + 1).padStart(3, "0")}`,
      supplier,
      invoiceNo:
        invoiceNo ||
        `SUPP-INV-${String(purchaseList.length + 1).padStart(3, "0")}`,
      date: purchaseDate,
      items: validItems.length,
      total,
      status:
        paymentStatus === "Paid"
          ? "Received"
          : paymentStatus === "Partial"
            ? "Partial"
            : "Pending",
    };

    setPurchaseList((prev) => [newPurchase, ...prev]);

    validItems.forEach((item) => {
      const foundProduct = products.find((p) => p.name === item.product);
      if (foundProduct) {
        foundProduct.stock += Number(item.qty || 0);
      }
    });

    setActiveTab("history");
    setSupplier(suppliers[0]?.name ?? "");
    setInvoiceNo("");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setPaymentStatus("Unpaid");
    setNotes("");
    setItems([
      { product: products[0]?.name ?? "", qty: "", rate: "", amount: "" },
    ]);
    showToast("Purchase saved successfully", "success");
  };

  const filteredPurchases = purchaseList.filter((purchase) => {
    const query = searchHistory.toLowerCase();
    return (
      purchase.id.toLowerCase().includes(query) ||
      purchase.supplier.toLowerCase().includes(query) ||
      purchase.invoiceNo.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          ["entry", "New Purchase"],
          ["history", "Purchase History"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setActiveTab(String(k))}
            className={`pb-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === k ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "entry" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">
                Purchase Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Supplier"
                  value={supplier}
                  onChange={setSupplier}
                  options={suppliers.map((s) => s.name)}
                />
                <Input
                  label="Invoice No."
                  placeholder="SUPP-INV-001"
                  value={invoiceNo}
                  onChange={setInvoiceNo}
                />
                <Input
                  label="Purchase Date"
                  type="date"
                  value={purchaseDate}
                  onChange={setPurchaseDate}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={setDueDate}
                />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Products</h3>
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left pb-2 text-xs text-slate-500">
                      Product
                    </th>
                    <th className="text-center pb-2 text-xs text-slate-500 w-20">
                      Qty
                    </th>
                    <th className="text-right pb-2 text-xs text-slate-500 w-28">
                      Rate
                    </th>
                    <th className="text-right pb-2 text-xs text-slate-500 w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2">
                        <select
                          value={item.product}
                          onChange={(e) =>
                            updateItem(i, "product", e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "qty",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="w-full text-center border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "rate",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="w-full text-right border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={item.amount}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "amount",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="w-full text-right border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Btn
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems((it) => [
                    ...it,
                    { product: "", qty: "", rate: "", amount: "" },
                  ])
                }
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Row
              </Btn>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-3">
                {[
                  ["Subtotal", fmt(subtotal)],
                  ["GST (18%)", `+ ${fmt(gst)}`],
                  ["Discount", `- ${fmt(discount)}`],
                  ["Total", fmt(total)],
                ].map(([l, v], i) => (
                  <div
                    key={l}
                    className={`flex justify-between text-sm ${i === 3 ? "font-bold text-slate-900 border-t border-slate-200 pt-3" : "text-slate-600"}`}
                  >
                    <span>{l}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <Select
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={setPaymentStatus}
                  options={["Paid", "Unpaid", "Partial"]}
                />
                <Btn
                  variant="primary"
                  className="w-full justify-center"
                  onClick={handleSavePurchase}
                  icon={<Check className="w-4 h-4" />}
                >
                  Save Purchase
                </Btn>
              </div>
            </Card>
            
          </div>
        </div>
      ) : (
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <Input
              value={searchHistory}
              onChange={setSearchHistory}
              placeholder="Search purchases..."
              icon={<Search className="w-4 h-4" />}
            />
            
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["PO No.", "Supplier", "Date", "Items", "Total", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPurchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-600">
                    {purchase.id}
                  </td>
                  <td className="px-5 py-3.5 text-slate-900">
                    {purchase.supplier}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                    {purchase.date}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {purchase.items}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {fmt(purchase.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    {statusBadge(purchase.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ─── INVENTORY SCREEN ─────────────────────────────────────────────────────────

function InventoryScreen() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value="231"
          sub="Across 4 categories"
          trend="neutral"
          icon={<Package className="w-5 h-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Total Stock Value"
          value="₹24.8L"
          sub="+6.2% this month"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Low Stock Items"
          value="3"
          sub="Action required"
          trend="down"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Out of Stock"
          value="1"
          sub="Reorder pending"
          trend="down"
          icon={<XCircle className="w-5 h-5" />}
          color="bg-red-50 text-red-500"
        />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Low Stock Alerts</h3>
        <p className="text-xs text-slate-500 mb-4">
          Items that need immediate reordering
        </p>
        <div className="space-y-3">
          {products
            .filter((p) => p.stock <= p.minStock)
            .map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${p.stock === 0 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 ${p.stock === 0 ? "text-red-500" : "text-amber-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${p.stock === 0 ? "text-red-500" : "text-amber-600"}`}
                  >
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                  </p>
                  <p className="text-xs text-slate-500">Min: {p.minStock}</p>
                </div>
                <Btn
                  variant={p.stock === 0 ? "danger" : "outline"}
                  size="sm"
                  icon={<ShoppingCart className="w-3.5 h-3.5" />}
                >
                  Reorder
                </Btn>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Current Stock</h3>
          <div className="flex gap-2">
            <Btn
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Adjust Stock
            </Btn>
            <Btn
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Btn>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Product",
                "Category",
                "In Stock",
                "Min Level",
                "Value",
                "Status",
              ].map((h) => (
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
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge label={p.category} variant="blue" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold font-mono ${p.stock === 0 ? "text-red-500" : p.stock <= p.minStock ? "text-amber-600" : "text-slate-900"}`}
                    >
                      {p.stock}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                          backgroundColor:
                            p.stock === 0
                              ? "#EF4444"
                              : p.stock <= p.minStock
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-mono">
                  {p.minStock}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {fmt(p.price * p.stock)}
                </td>
                <td className="px-5 py-3.5">
                  {statusBadge(p.stock === 0 ? "Inactive" : p.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── REPORTS SCREEN ───────────────────────────────────────────────────────────

import PurchaseReport from "./reports/PurchaseReport";
import ProfitLossReport from "./reports/ProfitLossReport";
import GSTReport from "./reports/GSTReport";
import InventoryReport from "./reports/InventoryReport";
import SalesReport from "./reports/SalesReport";

function ReportsScreen() {
  const [activeReport, setActiveReport] = useState("sales");
  const reportTypes = [
    { key: "sales", label: "Sales Report", icon: TrendingUp },
    { key: "purchase", label: "Purchase Report", icon: ShoppingCart },
    { key: "pl", label: "Profit & Loss", icon: BarChart3 },
    { key: "gst", label: "GST Report", icon: Percent },
    { key: "inventory", label: "Inventory Report", icon: Package },
  ];

  const renderActiveReport = () => {
    switch (activeReport) {
      case "sales":
        return <SalesReport />;
      case "purchase":
        return <PurchaseReport />;
      case "pl":
        return <ProfitLossReport />;
      case "gst":
        return <GSTReport />;
      case "inventory":
        return <InventoryReport />;
      default:
        return <SalesReport />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {reportTypes.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeReport === r.key ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}
          >
            <r.icon className="w-4 h-4" />
            {r.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Btn
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
          >
            Export Excel
          </Btn>
          <Btn
            variant="outline"
            size="md"
            icon={<Printer className="w-4 h-4" />}
          >
            Print PDF
          </Btn>
        </div>
      </div>

      {renderActiveReport()}
    </div>
  );
}


// ─── EXPENSES SCREEN ──────────────────────────────────────────────────────────

function ExpensesScreen() {
  const [showModal, setShowModal] = useState(false);

  // Local editable list so added expenses appear in the table below.
  const [expenseList, setExpenseList] = useState(expenses);

  const [form, setForm] = useState({
    category: "Rent",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMode: "Bank Transfer",
    reference: "",
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showModal && (
        <Modal title="Add Expense" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v }))}
              options={[
                "Rent",
                "Utilities",
                "Salaries",
                "Marketing",
                "Logistics",
                "Maintenance",
                "Other",
              ]}
            />
            <Input
              label="Description"
              placeholder="August rent payment"
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (₹)"
                placeholder="45000"
                value={form.amount}
                onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
              />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(v) => setForm((f) => ({ ...f, date: v }))}
              />
            </div>
            <Select
              label="Payment Mode"
              value={form.paymentMode}
              onChange={(v) => setForm((f) => ({ ...f, paymentMode: v }))}
              options={[
                "Cash",
                "Bank Transfer",
                "UPI",
                "Credit Card",
                "Cheque",
              ]}
            />
            <Input
              label="Reference / Receipt No."
              placeholder="REF-001"
              value={form.reference}
              onChange={(v) => setForm((f) => ({ ...f, reference: v }))}
            />
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const amountNum = Number(form.amount || 0);
                  if (!form.description.trim()) {
                    showToast("Description is required", "error");
                    return;
                  }
                  if (!Number.isFinite(amountNum) || amountNum <= 0) {
                    showToast("Amount must be greater than 0", "error");
                    return;
                  }

                  const newId =
                    expenseList.length > 0
                      ? Math.max(...expenseList.map((x) => x.id)) + 1
                      : 1;

                  const newExpense = {
                    id: newId,
                    category: form.category,
                    description: form.description,
                    date: form.date,
                    amount: amountNum,
                    paymentMode: form.paymentMode,
                    reference: form.reference || "",
                    status: "Paid",
                  };

                  setExpenseList((prev) => [newExpense, ...prev]);
                  setShowModal(false);
                  setForm({
                    category: "Rent",
                    description: "",
                    date: new Date().toISOString().slice(0, 10),
                    amount: "",
                    paymentMode: "Bank Transfer",
                    reference: "",
                  });
                  showToast("Expense saved successfully", "success");
                }}
                className="flex-1 justify-center"
              >
                Save Expense
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Expenses (Aug)"
          value={`₹${Number(expenseList.reduce((s, e) => s + (Number(e.amount) || 0), 0)).toLocaleString("en-IN")}`}
          sub=""
          trend="up"
          icon={<Wallet className="w-5 h-5" />}
          color="bg-red-50 text-red-500"
        />
        <StatCard
          label="Largest Expense"
          value="Salaries"
          sub="₹1,25,000 (60.7%)"
          trend="neutral"
          icon={<Users className="w-5 h-5" />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Pending Payments"
          value="₹12,400"
          sub="1 item pending"
          trend="neutral"
          icon={<Clock className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Expense History</h3>
          <Btn
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Expense
          </Btn>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Category",
                "Description",
                "Date",
                "Amount",
                "Mode",
                "Status",
              ].map((h) => (
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
            {expenseList.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <Badge label={e.category} variant="purple" />
                </td>
                <td className="px-5 py-3.5 text-slate-900">{e.description}</td>
                <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                  {e.date}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {fmt(e.amount)}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{e.paymentMode}</td>
                <td className="px-5 py-3.5">{statusBadge(e.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

function UsersScreen() {
  const [employeeList, setEmployeeList] = useState(employees);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [role, setRole] = useState("Cashier");
const [department, setDepartment] = useState("");
const [phone, setPhone] = useState("");
const [password, setPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
const [phoneError, setPhoneError] = useState("");

const handleSaveEmployee = () => {

  const updatedEmployee = {
    id: editingId ?? Date.now(),
    name,
    email,
    role,
    department,
    phone,
    password,
    status: "Active",
    lastActive: "Just now",
  };

  if (editingId !== null) {

    setEmployeeList(
      employeeList.map((emp) =>
        emp.id === editingId ? updatedEmployee : emp
      )
    );

  } else {

    setEmployeeList([...employeeList, updatedEmployee]);

  }

  setEditingId(null);

  setName("");
  setEmail("");
  setRole("Cashier");
  setDepartment("");
  setPhone("");
  setPassword("");

  setShowModal(false);

};

const handleEdit = (employee) => {
  setName(employee.name);
  setEmail(employee.email);
  setRole(employee.role);
  setDepartment(employee.department);
  setPhone(employee.phone || "");
  setPassword(employee.password || "");

  setEditingId(employee.id);

  setShowModal(true);
};

const handleDelete = (id) => {
  if (window.confirm("Delete this employee?")) {
    setEmployeeList(employeeList.filter((emp) => emp.id !== id));
  }
};

  return (
    <div className="space-y-5">
      {showModal && (
        <Modal
  title={editingId ? "Update Employee" : "Add Employee"}
  onClose={() => {
    setEditingId(null);

    setName("");
    setEmail("");
    setRole("Cashier");
    setDepartment("");
    setPhone("");
    setPassword("");

    setShowModal(false);
  }}
>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
  label="Full Name"
  placeholder="Priya Sharma"
  value={name}
  onChange={setName}
/>
              <Input
  label="Email"
  placeholder="priya@business.in"
  value={email}
  onChange={setEmail}
  icon={<Mail className="w-4 h-4" />}
/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
  label="Role"
  value={role}
  onChange={setRole}
  options={["Owner", "Manager", "Cashier", "Accountant"]}
/>
              <Input
  label="Department"
  placeholder="Sales"
  value={department}
  onChange={setDepartment}
/>
            </div>
            <Input
  label="Phone"
  placeholder="+91"
  value={phone}
  onChange={(value) => {
    // Allow only digits
    const digits = value.replace(/\D/g, "");

    // Limit to 10 digits
    if (digits.length <= 10) {
      setPhone(digits);
      setPhoneError("");
    }
  }}
  error={phoneError}
/>
            <Input
  label="Temporary Password"
  type="password"
  value={password}
  onChange={(value) => {
    setPassword(value);
    setPasswordError("");
  }}
  icon={<Lock className="w-4 h-4" />}
  error={passwordError}
/>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Permissions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "View Dashboard",
                  "Create Invoices",
                  "Manage Products",
                  "View Reports",
                  "Manage Customers",
                  "Access Settings",
                ].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600 rounded"
                      defaultChecked={p !== "Access Settings"}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                  onClick={() => {
  setEditingId(null);

  setName("");
  setEmail("");
  setRole("Cashier");
  setDepartment("");
  setPhone("");
  setPassword("");

  setShowModal(false);
}}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
  variant="primary"
  onClick={handleSaveEmployee}
>
  {editingId ? "Update Employee" : "Add Employee"}
</Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-end">
        <Btn
          variant="primary"
          size="md"
          onClick={() => {
  setEditingId(null);

  setName("");
  setEmail("");
  setRole("Cashier");
  setDepartment("");
  setPhone("");
  setPassword("");

  setShowModal(true);
}}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Employee
        </Btn>
      </div>


      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Employee",
                "Email",
                "role",
                "Department",
                "Last Active",
                "Status",
                "Actions",
              ].map((h) => (
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
            {employeeList.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">
                        {e.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900">{e.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-500 text-xs">{e.email}</td>
                <td className="px-5 py-4 text-slate-700 font-medium">{e.role}</td>
                <td className="px-5 py-4 text-slate-600">{e.department}</td>
                <td className="px-5 py-4 text-slate-500 text-xs">{e.lastActive}</td>
                <td className="px-5 py-4">{statusBadge(e.status)}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Btn
  variant="ghost"
  size="sm"
  onClick={() => handleEdit(e)}
  icon={<Edit2 className="w-3.5 h-3.5" />}
/>
                    <Btn
  variant="ghost"
  size="sm"
  onClick={() => handleDelete(e.id)}
  icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── SUPER ADMIN SETTINGS SCREEN ──────────────────────────────────────────────

function SuperAdminSettingsScreen() {
  const [activeTab, setActiveTab] = useState("system");

  // System Settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("30");

  // Email Template states
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to SmartBill",
      status: "active",
    },
    {
      id: 2,
      name: "Invoice Email",
      subject: "Your Invoice - {invoice_no}",
      status: "active",
    },
    {
      id: 3,
      name: "Password Reset",
      subject: "Reset Your Password",
      status: "active",
    },
    {
      id: 4,
      name: "Subscription Reminder",
      subject: "Your subscription expires soon",
      status: "active",
    },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // API Settings states
  const [apiKey, setApiKey] = useState("sk_live_51ABC123XYZ");
  const [showApiKey, setShowApiKey] = useState(false);
  const [rateLimit, setRateLimit] = useState("1000");
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("");

  // Subscription Plans states
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Starter",
      price: "₹499/month",
      users: 5,
      features: "Basic accounting, GST ready",
      status: "active",
    },
    {
      id: 2,
      name: "Professional",
      price: "₹999/month",
      users: 15,
      features: "Advanced reports, multi-user",
      status: "active",
    },
    {
      id: 3,
      name: "Enterprise",
      price: "Custom",
      users: "Unlimited",
      features: "API access, custom domain",
      status: "active",
    },
  ]);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");

  // Payment Gateway states
  const [paymentGateway, setPaymentGateway] = useState("razorpay");
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_123ABC");
  const [stripeKey, setStripeKey] = useState("sk_test_123ABC");
  const [enablePaypal, setEnablePaypal] = useState(false);
  const [enableStripe, setEnableStripe] = useState(false);

  // User Management states
  const [adminUsers, setAdminUsers] = useState([
    {
      id: 1,
      name: "System Admin",
      email: "admin@smartbill.com",
      role: "super-admin",
      status: "active",
      lastLogin: "2 hours ago",
    },
    {
      id: 2,
      name: "Support Lead",
      email: "support@smartbill.com",
      role: "admin",
      status: "active",
      lastLogin: "1 day ago",
    },
  ]);

  // Audit Log states
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: "User Login",
      user: "admin@smartbill.com",
      timestamp: "2024-01-15 10:30 AM",
      status: "success",
    },
    {
      id: 2,
      action: "Settings Updated",
      user: "admin@smartbill.com",
      timestamp: "2024-01-15 10:25 AM",
      status: "success",
    },
    {
      id: 3,
      action: "Backup Completed",
      user: "System",
      timestamp: "2024-01-15 09:00 AM",
      status: "success",
    },
    {
      id: 4,
      action: "User Deleted",
      user: "admin@smartbill.com",
      timestamp: "2024-01-14 04:15 PM",
      status: "warning",
    },
  ]);

  // Support Settings states
  const [supportEmail, setSupportEmail] = useState("support@smartbill.com");
  const [supportPhone, setSupportPhone] = useState("+91-1800-123-4567");
  const [ticketSystem, setTicketSystem] = useState(true);
  const [liveChat, setLiveChat] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState(true);

  // Save handlers
  const handleSaveSystemSettings = () => {
    localStorage.setItem(
      "superAdminSystemSettings",
      JSON.stringify({
        maintenanceMode,
        autoBackup,
        emailNotifications,
        debugMode,
        backupFrequency,
        maxLoginAttempts,
        sessionTimeout,
      }),
    );
    alert("✓ System settings saved successfully!");
  };

  const handleSaveEmailSettings = () => {
    localStorage.setItem(
      "superAdminEmailSettings",
      JSON.stringify({ emailTemplates }),
    );
    alert("✓ Email templates updated successfully!");
  };

  const handleSaveApiSettings = () => {
    localStorage.setItem(
      "superAdminApiSettings",
      JSON.stringify({
        rateLimit,
        webhooksEnabled,
        ipWhitelist,
      }),
    );
    alert("✓ API settings saved successfully!");
  };

  const handleAddPlan = () => {
    if (newPlanName && newPlanPrice) {
      const newPlan = {
        id: plans.length + 1,
        name: newPlanName,
        price: newPlanPrice,
        users: "10",
        features: "Standard features",
        status: "active",
      };
      setPlans([...plans, newPlan]);
      setNewPlanName("");
      setNewPlanPrice("");
      alert("✓ New plan added successfully!");
    }
  };

  const handleDeletePlan = (id) => {
    setPlans(plans.filter((p) => p.id !== id));
    alert("✓ Plan deleted successfully!");
  };

  const handleSavePaymentSettings = () => {
    localStorage.setItem(
      "superAdminPaymentSettings",
      JSON.stringify({
        paymentGateway,
        razorpayKey,
        stripeKey,
        enablePaypal,
        enableStripe,
      }),
    );
    alert("✓ Payment gateway settings saved!");
  };

  const handleSaveSupportSettings = () => {
    localStorage.setItem(
      "superAdminSupportSettings",
      JSON.stringify({
        supportEmail,
        supportPhone,
        ticketSystem,
        liveChat,
        knowledgeBase,
      }),
    );
    alert("✓ Support settings saved successfully!");
  };

  const handleRemoveAdmin = (id) => {
    setAdminUsers(adminUsers.filter((u) => u.id !== id));
    alert("✓ Admin user removed successfully!");
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "system", label: "System Settings", icon: Settings },
          { key: "plans", label: "Subscription Plans", icon: Package },
          { key: "email", label: "Email Templates", icon: Mail },
          { key: "api", label: "API Settings", icon: Zap },
          { key: "payment", label: "Payment Gateway", icon: CreditCard },
          { key: "users", label: "Admin Users", icon: Shield },
          { key: "logs", label: "Audit Logs", icon: BarChart2 },
          { key: "support", label: "Support Settings", icon: MessageSquare },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: SYSTEM SETTINGS */}
      {activeTab === "system" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">System Settings</h3>
          <div className="space-y-4">
            {/* Maintenance Mode */}
            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Maintenance Mode
                </p>
                <p className="text-xs text-slate-500">
                  Temporarily disable user access for maintenance
                </p>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${maintenanceMode ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${maintenanceMode ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            {/* Auto Backup */}
            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Auto Backup
                </p>
                <p className="text-xs text-slate-500">
                  Automatically backup database
                </p>
              </div>
              <button
                onClick={() => setAutoBackup(!autoBackup)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${autoBackup ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${autoBackup ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Email Notifications
                </p>
                <p className="text-xs text-slate-500">
                  Send system notifications via email
                </p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${emailNotifications ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${emailNotifications ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            {/* Debug Mode */}
            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Debug Mode</p>
                <p className="text-xs text-slate-500">
                  Enable detailed error logging
                </p>
              </div>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${debugMode ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${debugMode ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            {/* Backup Frequency */}
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Backup Frequency
              </p>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Max Login Attempts */}
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Max Login Attempts
              </p>
              <input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="5"
              />
            </div>

            {/* Session Timeout */}
            <div className="py-3">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Session Timeout (minutes)
              </p>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="30"
              />
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveSystemSettings}
              icon={<Lock className="w-4 h-4" />}
            >
              Save System Settings
            </Btn>
          </div>
        </Card>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-5">
              Manage Subscription Plans
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {plan.price}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Users: {plan.users}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">{plan.features}</p>
                  <div className="flex gap-2 mt-3">
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      Delete
                    </Btn>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-medium text-slate-900 mb-3">Add New Plan</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Plan Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(e.target.value)}
                  placeholder="Price (e.g., ₹499/month)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Btn
                  variant="primary"
                  onClick={handleAddPlan}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Plan
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: EMAIL TEMPLATES */}
      {activeTab === "email" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Email Templates</h3>
          <div className="space-y-3">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-slate-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{template.name}</p>
                  <p className="text-xs text-slate-500">{template.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    label={template.status}
                    variant={template.status === "active" ? "green" : "gray"}
                  />
                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Edit
                  </Btn>
                </div>
              </div>
            ))}
          </div>
          <Btn
            variant="primary"
            onClick={handleSaveEmailSettings}
            icon={<Mail className="w-4 h-4" />}
            className="mt-5"
          >
            Save Email Templates
          </Btn>
        </Card>
      )}

      {/* TAB 4: API SETTINGS */}
      {activeTab === "api" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">API Settings</h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">API Key</p>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                />
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? "Hide" : "Show"}
                </Btn>
              </div>
            </div>

            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Rate Limit (requests/hour)
              </p>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Enable Webhooks
                </p>
                <p className="text-xs text-slate-500">
                  Allow webhooks for external integrations
                </p>
              </div>
              <button
                onClick={() => setWebhooksEnabled(!webhooksEnabled)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${webhooksEnabled ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${webhooksEnabled ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <div className="py-3">
              <p className="text-sm font-medium text-slate-900 mb-2">
                IP Whitelist (comma-separated)
              </p>
              <input
                type="text"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveApiSettings}
              icon={<Zap className="w-4 h-4" />}
            >
              Save API Settings
            </Btn>
          </div>
        </Card>
      )}

      {/* TAB 5: PAYMENT GATEWAY */}
      {activeTab === "payment" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">
            Payment Gateway Configuration
          </h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Default Payment Gateway
              </p>
              <select
                value={paymentGateway}
                onChange={(e) => setPaymentGateway(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Razorpay Key ID
              </p>
              <input
                type="password"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Stripe Key
              </p>
              <input
                type="password"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Enable PayPal
                </p>
                <p className="text-xs text-slate-500">Allow PayPal payments</p>
              </div>
              <button
                onClick={() => setEnablePaypal(!enablePaypal)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${enablePaypal ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enablePaypal ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Enable Stripe
                </p>
                <p className="text-xs text-slate-500">Allow Stripe payments</p>
              </div>
              <button
                onClick={() => setEnableStripe(!enableStripe)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${enableStripe ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableStripe ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <Btn
              variant="primary"
              onClick={handleSavePaymentSettings}
              icon={<CreditCard className="w-4 h-4" />}
            >
              Save Payment Settings
            </Btn>
          </div>
        </Card>
      )}

      {/* TAB 6: ADMIN USERS */}
      {activeTab === "users" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Admin Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "Name",
                    "Email",
                    "Role",
                    "Status",
                    "Last Login",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={
                          user.role === "super-admin" ? "Super Admin" : "Admin"
                        }
                        variant="blue"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={user.status} variant="green" />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {user.lastLogin}
                    </td>
                    <td className="px-4 py-3">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAdmin(user.id)}
                      >
                        Remove
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === "logs" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Audit Logs</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {log.action}
                  </p>
                  <p className="text-xs text-slate-500">
                    by {log.user} • {log.timestamp}
                  </p>
                </div>
                <Badge
                  label={log.status}
                  variant={log.status === "success" ? "green" : "yellow"}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 8: SUPPORT SETTINGS */}
      {activeTab === "support" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">
            Support Settings
          </h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Support Email
              </p>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Support Phone
              </p>
              <input
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Support Ticket System
                </p>
                <p className="text-xs text-slate-500">
                  Enable ticket system for users
                </p>
              </div>
              <button
                onClick={() => setTicketSystem(!ticketSystem)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${ticketSystem ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${ticketSystem ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Live Chat</p>
                <p className="text-xs text-slate-500">
                  Enable live chat support
                </p>
              </div>
              <button
                onClick={() => setLiveChat(!liveChat)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${liveChat ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${liveChat ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Knowledge Base
                </p>
                <p className="text-xs text-slate-500">
                  Enable public knowledge base
                </p>
              </div>
              <button
                onClick={() => setKnowledgeBase(!knowledgeBase)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${knowledgeBase ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${knowledgeBase ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveSupportSettings}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Save Support Settings
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────

function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("business");

  // GST & Tax toggle states
  const [enableIgst, setEnableIgst] = useState(true);
  const [enableCess, setEnableCess] = useState(false);
  const [enableRcm, setEnableRcm] = useState(false);

  // Transaction Settings states
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [enableCashDiscount, setEnableCashDiscount] = useState(true);
  const [linkOrders, setLinkOrders] = useState(true);

  // Invoice Settings states
  const [showHsn, setShowHsn] = useState(true);
  const [showDesc, setShowDesc] = useState(true);
  const [showBank, setShowBank] = useState(false);

  // Party Management states
  const [enableGrouping, setEnableGrouping] = useState(true);
  const [trackBalance, setTrackBalance] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(true);

  // Item & Inventory states
  const [enableSerial, setEnableSerial] = useState(false);
  const [enableMultiUnit, setEnableMultiUnit] = useState(true);
  const [enableBarcode, setEnableBarcode] = useState(true);

  // Accounting & Books states
  const [enableTrialBalance, setEnableTrialBalance] = useState(true);
  const [autoBankImport, setAutoBankImport] = useState(false);
  const [profitCenter, setProfitCenter] = useState(false);

  // GST Registration state
  const [isComposition, setIsComposition] = useState(false);

  // Customization states
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [sidebarStyle, setSidebarStyle] = useState("expanded");
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("English");
  const [dateFormat, setDateFormat] = useState("DD-MM-YYYY");
  const [timeFormat, setTimeFormat] = useState("24-hour");
  const [currencyFormat, setCurrencyFormat] = useState("Indian");

  // Low Stock Alert states
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Users Permissions states
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "HR Manager",
      department: "HR",
      permissions: {
        sales: true,
        purchase: true,
        inventory: true,
        accounting: true,
        settings: false,
      },
    },
    {
      id: 2,
      name: "Sales Staff",
      department: "Sales",
      permissions: {
        sales: true,
        purchase: false,
        inventory: true,
        accounting: false,
        settings: false,
      },
    },
  ]);

  // Payment Methods states
  const [paymentMethods, setPaymentMethods] = useState({
    sales: ["Cash", "Card", "UPI"],
    purchase: ["Cash", "Cheque", "Bank Transfer"],
    expenses: ["Cash", "Card"],
  });
  const [availablePaymentMethods] = useState([
    "Cash",
    "Card",
    "UPI",
    "Cheque",
    "Bank Transfer",
    "Online",
    "Wallet",
  ]);

  // Security states
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  // Apply theme to document - FIXED: No longer inverted
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#0f172a";
      document.body.style.color = "#f8fafc";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
  }, [theme]);

  // Apply accent color to CSS
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor]);

  // Apply font size
  useEffect(() => {
    const sizeMap = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  // Handle theme save
  const handleSaveCustomization = () => {
    localStorage.setItem(
      "appSettings",
      JSON.stringify({
        theme,
        accentColor,
        sidebarStyle,
        fontSize,
        language,
        dateFormat,
        timeFormat,
        currencyFormat,
      }),
    );
    alert("✓ Customization settings saved successfully!");
  };

  // Handle GST settings save
  const handleSaveGstSettings = () => {
    localStorage.setItem(
      "gstSettings",
      JSON.stringify({
        isComposition,
        enableIgst,
        enableCess,
        enableRcm,
      }),
    );
    alert("✓ GST settings saved successfully!");
  };

  // Handle transaction settings save
  const handleSaveTransactionSettings = () => {
    localStorage.setItem(
      "transactionSettings",
      JSON.stringify({
        passcodeRequired,
        enableCashDiscount,
        linkOrders,
      }),
    );
    alert("✓ Transaction settings saved successfully!");
  };

  // Handle invoice settings save
  const handleSaveInvoiceSettings = () => {
    localStorage.setItem(
      "invoiceSettings",
      JSON.stringify({
        showHsn,
        showDesc,
        showBank,
      }),
    );
    alert("✓ Invoice settings saved successfully!");
  };

  // Handle party settings save
  const handleSavePartySettings = () => {
    localStorage.setItem(
      "partySettings",
      JSON.stringify({
        enableGrouping,
        trackBalance,
        shippingAddress,
      }),
    );
    alert("✓ Party settings saved successfully!");
  };

  // Handle item settings save
  const handleSaveItemSettings = () => {
    localStorage.setItem(
      "itemSettings",
      JSON.stringify({
        enableSerial,
        enableMultiUnit,
        enableBarcode,
      }),
    );
    alert("✓ Item settings saved successfully!");
  };

  // Handle accounting settings save
  const handleSaveAccountingSettings = () => {
    localStorage.setItem(
      "accountingSettings",
      JSON.stringify({
        enableTrialBalance,
        autoBankImport,
        profitCenter,
      }),
    );
    alert("✓ Accounting settings saved successfully!");
  };

  // Handle low stock save
  const handleSaveLowStockSettings = () => {
    localStorage.setItem(
      "lowStockSettings",
      JSON.stringify({
        threshold: lowStockThreshold,
        emailAlerts,
        inAppAlerts,
        smsAlerts,
      }),
    );
    alert("✓ Low stock alert settings saved successfully!");
  };

  // Handle permission update
  const handlePermissionToggle = (empId, module) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === empId
          ? {
              ...emp,
              permissions: {
                ...emp.permissions,
                [module]: !emp.permissions[module],
              },
            }
          : emp,
      ),
    );
  };

  // Handle permissions save
  const handleSavePermissions = () => {
    localStorage.setItem("employeePermissions", JSON.stringify(employees));
    alert("✓ Users permissions saved successfully!");
  };

  // Handle payment method toggle
  const handlePaymentMethodToggle = (type, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [type]: prev[type].includes(method)
        ? prev[type].filter((m) => m !== method)
        : [...prev[type], method],
    }));
  };

  // Handle payment methods save
  const handleSavePaymentMethods = () => {
    localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    alert("✓ Payment methods saved successfully!");
  };

  // Handle security settings save
  const handleSaveSecuritySettings = () => {
    localStorage.setItem(
      "securitySettings",
      JSON.stringify({
        twoFactorAuth,
        sessionTimeout,
      }),
    );
    alert("✓ Security settings saved successfully!");
  };

  // Navin safe tabs configuration
  const tabs = [
    { key: "business", label: "Business Profile", icon: Building2 },
    { key: "gst", label: "GST & Tax", icon: Percent },
    { key: "transaction", label: "Transaction Settings", icon: FileText },
    { key: "invoice", label: "Invoice Settings", icon: Receipt },
    { key: "party", label: "Party Management", icon: Users },
    { key: "item", label: "Item & Inventory", icon: Package2 }, // Fixed here!
    { key: "accounting", label: "Accounting & Books", icon: Landmark },
    { key: "customization", label: "Customization", icon: Settings },
    { key: "stockalert", label: "Low Stock Alert Numbers", icon: AlertCircle },
    { key: "permissions", label: "Users Permissions", icon: Shield },
    { key: "payment", label: "Payment Methods", icon: CreditCard },
    { key: "users", label: "Security & Access", icon: Lock },
  ];

  return (
    <div className="flex gap-6">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-56 p-3 h-fit flex-shrink-0 bg-white border rounded-xl shadow-sm">
        <nav className="space-y-0.5">
          {tabs.map((t) => {
            const IconComponent = t.icon; // Dynamic parsing handle
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* RIGHT SIDE WORKSPACE */}
      <div className="flex-1 space-y-5">
        {/* TAB 1: BUSINESS PROFILE */}
        {activeTab === "business" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Business Information
            </h3>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 flex-shrink-0">
                <div className="text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">Upload Logo</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <Input label="Business Name" value="Sharma Traders" />
                <Input label="Owner Name" value="Vikram Sharma" />
                <Input
                  label="Phone"
                  value="+91 98765 43210"
                  icon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  value="contact@sharmatraders.in"
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Business Type"
                value="Retail"
                options={["Retail", "Wholesale", "Manufacturing", "Services"]}
              />
              <Select
                label="Financial Year Start"
                value="April (Standard India)"
                options={["April (Standard India)", "January"]}
              />
              <div className="col-span-2">
                <Input
                  label="Address"
                  value="Shop No. 14, Sadar Bazaar, Nagpur"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
              <Input label="City" value="Nagpur" />
              <Input label="State" value="Maharashtra" />
              <Input label="Pincode" value="440001" />
              <Select label="Country" value="India" options={["India"]} />
            </div>
            <Btn variant="primary" icon={<Check className="w-4 h-4" />}>
              Save Changes
            </Btn>
          </div>
        )}

        {/* TAB 2: GST & TAX SETTINGS */}
        {activeTab === "gst" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              GST & Tax Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="GSTIN" value="27AAPCS0510Q1Z6" />
              <Select
                label="GST Registration Type"
                value={isComposition ? "Composition" : "Regular"}
                onChange={(e) =>
                  setIsComposition(e.target.value === "Composition")
                }
                options={["Regular", "Composition", "Unregistered"]}
              />
              <Input label="PAN Number" value="AAPCS0510Q" />
              <Select
                label="Default GST Rate %"
                value="18"
                options={["0", "5", "12", "18", "28"]}
              />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable IGST
                  </p>
                  <p className="text-xs text-slate-500">
                    Apply IGST for inter-state transactions
                  </p>
                </div>
                <button
                  onClick={() => setEnableIgst(!enableIgst)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${enableIgst ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableIgst ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Cess
                  </p>
                  <p className="text-xs text-slate-500">
                    Apply additional cess on specific products
                  </p>
                </div>
                <button
                  onClick={() => setEnableCess(!enableCess)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${enableCess ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableCess ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Reverse Charge Mechanism (RCM)
                  </p>
                  <p className="text-xs text-slate-500">
                    Enable reverse charge options in purchase invoices
                  </p>
                </div>
                <button
                  onClick={() => setEnableRcm(!enableRcm)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${enableRcm ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableRcm ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveGstSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save GST Settings
            </Btn>
          </div>
        )}

        {/* TAB 3: TRANSACTION SETTINGS */}
        {activeTab === "transaction" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Transaction Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Default Sale Price"
                value="Retail Price"
                options={[
                  "Retail Price",
                  "Wholesale Price",
                  "Minimum Sale Price",
                ]}
              />
              <Select
                label="Discount Type"
                value="Percentage"
                options={["Percentage", "Flat Amount", "None"]}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Passcode for Sales Return
                  </p>
                  <p className="text-xs text-slate-500">
                    Ask verification lock passcode on every credit note entry
                  </p>
                </div>
                <button
                  onClick={() => setPasscodeRequired(!passcodeRequired)}
                  className={`w-10 h-6 rounded-full relative ${passcodeRequired ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${passcodeRequired ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Cash Discount Field
                  </p>
                  <p className="text-xs text-slate-500">
                    Show custom cash discount row inside ledger transactions
                  </p>
                </div>
                <button
                  onClick={() => setEnableCashDiscount(!enableCashDiscount)}
                  className={`w-10 h-6 rounded-full relative ${enableCashDiscount ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableCashDiscount ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Link Orders to Invoices
                  </p>
                  <p className="text-xs text-slate-500">
                    Auto-convert approved purchase orders into open bills
                  </p>
                </div>
                <button
                  onClick={() => setLinkOrders(!linkOrders)}
                  className={`w-10 h-6 rounded-full relative ${linkOrders ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${linkOrders ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveTransactionSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Transaction Rules
            </Btn>
          </div>
        )}

        {/* TAB 4: INVOICE SETTINGS */}
        {activeTab === "invoice" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Invoice Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Invoice Prefix" value="INV-" />
              <Input label="Starting Number" value="1001" />
              <Input
                label="Invoice Footer"
                value="Thank you for your business!"
              />
              <Select
                label="Invoice Print Paper Size"
                value="Regular A4"
                options={["Regular A4", "Compact A5", "3-Inch Thermal Roll"]}
              />
            </div>

            <div className="mt-5 border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Column Display Options
              </p>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Show HSN Code Column
                  </p>
                  <p className="text-xs text-slate-500">
                    Render HSN block inside invoice grids
                  </p>
                </div>
                <button
                  onClick={() => setShowHsn(!showHsn)}
                  className={`w-10 h-6 rounded-full relative ${showHsn ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${showHsn ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Print Item Specific Description
                  </p>
                  <p className="text-xs text-slate-500">
                    Show a separate descriptions line row below product
                  </p>
                </div>
                <button
                  onClick={() => setShowDesc(!showDesc)}
                  className={`w-10 h-6 rounded-full relative ${showDesc ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${showDesc ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Include Firm Bank Details
                  </p>
                  <p className="text-xs text-slate-500">
                    Automatically print bank details at invoice bottom
                  </p>
                </div>
                <button
                  onClick={() => setShowBank(!showBank)}
                  className={`w-10 h-6 rounded-full relative ${showBank ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${showBank ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>

            {showBank && (
              <div className="grid grid-cols-3 gap-4 mt-3 p-4 bg-slate-50 rounded-xl border">
                <Input label="Bank Name" value="State Bank of India" />
                <Input label="Account Number" value="34001294811" />
                <Input label="IFSC Code" value="SBIN0001042" />
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Invoice Template
              </p>
              <div className="grid grid-cols-3 gap-3">
                {["Classic", "Modern", "Minimal"].map((t, i) => (
                  <button
                    key={t}
                    className={`border-2 rounded-xl p-3 text-center transition-all ${i === 1 ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="h-16 bg-slate-100 rounded-lg mb-2" />
                    <p className="text-xs font-medium text-slate-700">{t}</p>
                  </button>
                ))}
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveInvoiceSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Invoice Settings
            </Btn>
          </div>
        )}

        {/* TAB 5: PARTY MANAGEMENT */}
        {activeTab === "party" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Party Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Party Grouping
                  </p>
                  <p className="text-xs text-slate-500">
                    Categorize retailers, wholesalers and suppliers into
                    structural pools
                  </p>
                </div>
                <button
                  onClick={() => setEnableGrouping(!enableGrouping)}
                  className={`w-10 h-6 rounded-full relative ${enableGrouping ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableGrouping ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Track Party-wise Balance Limits
                  </p>
                  <p className="text-xs text-slate-500">
                    Restrict raw bill allocation if safety credit thresholds
                    cross limit
                  </p>
                </div>
                <button
                  onClick={() => setTrackBalance(!trackBalance)}
                  className={`w-10 h-6 rounded-full relative ${trackBalance ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${trackBalance ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Shipping Address Verification
                  </p>
                  <p className="text-xs text-slate-500">
                    Keep separate shipping and billing text blocks for every
                    party ledger
                  </p>
                </div>
                <button
                  onClick={() => setShippingAddress(!shippingAddress)}
                  className={`w-10 h-6 rounded-full relative ${shippingAddress ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${shippingAddress ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSavePartySettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Party Profiles
            </Btn>
          </div>
        )}

        {/* TAB 6: ITEM & INVENTORY */}
        {activeTab === "item" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Item & Inventory Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Stock Value Formula"
                value="FIFO Method"
                options={["FIFO Method", "Average Base Price Code"]}
              />
              <Input
                label="Low Stock Warning Counter Alert"
                value="10 Units Remaining"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Serial Tracking / Batch Numbers
                  </p>
                  <p className="text-xs text-slate-500">
                    Store dynamic batch indices and expiry timestamps inside
                    database records
                  </p>
                </div>
                <button
                  onClick={() => setEnableSerial(!enableSerial)}
                  className={`w-10 h-6 rounded-full relative ${enableSerial ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableSerial ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Multi-unit Measurement Scale
                  </p>
                  <p className="text-xs text-slate-500">
                    Allow dynamic calculation mappings like Box to individual
                    pieces conversion
                  </p>
                </div>
                <button
                  onClick={() => setEnableMultiUnit(!enableMultiUnit)}
                  className={`w-10 h-6 rounded-full relative ${enableMultiUnit ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableMultiUnit ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Barcode Scanner Integration Hook
                  </p>
                  <p className="text-xs text-slate-500">
                    Map standard text fields inputs direct via optical barcode
                    readings
                  </p>
                </div>
                <button
                  onClick={() => setEnableBarcode(!enableBarcode)}
                  className={`w-10 h-6 rounded-full relative ${enableBarcode ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableBarcode ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveItemSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Inventory Parameters
            </Btn>
          </div>
        )}

        {/* TAB 7: ACCOUNTING & BOOKS */}
        {activeTab === "accounting" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Accounting & Book-keeping
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Trial Balance Reporting
                  </p>
                  <p className="text-xs text-slate-500">
                    Real-time sync sheet layout balancing credits and debits
                    together
                  </p>
                </div>
                <button
                  onClick={() => setEnableTrialBalance(!enableTrialBalance)}
                  className={`w-10 h-6 rounded-full relative ${enableTrialBalance ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableTrialBalance ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Auto Bank Statement Imports
                  </p>
                  <p className="text-xs text-slate-500">
                    Enable automated mapping hooks for institutional bank
                    settlement feeds
                  </p>
                </div>
                <button
                  onClick={() => setAutoBankImport(!autoBankImport)}
                  className={`w-10 h-6 rounded-full relative ${autoBankImport ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${autoBankImport ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Profit Center Allocation tracking
                  </p>
                  <p className="text-xs text-slate-500">
                    Perform split accounting across multi-location business
                    setups
                  </p>
                </div>
                <button
                  onClick={() => setProfitCenter(!profitCenter)}
                  className={`w-10 h-6 rounded-full relative ${profitCenter ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${profitCenter ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveAccountingSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Accounting Rules
            </Btn>
          </div>
        )}

        {/* TAB 8: CUSTOMIZATION */}
        {activeTab === "customization" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-slate-900">
              Customization Settings
            </h3>

            {/* Visual & Appearance Settings */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Visual & Appearance Settings
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Theme & Mode
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      readOnly
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sidebar Style
                  </label>
                  <select
                    value={sidebarStyle}
                    onChange={(e) => setSidebarStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="expanded">Expanded (Text + Icon)</option>
                    <option value="compact">Compact (Icons Only)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Localization & Regional Formats */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Localization & Regional Formats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Language Selection
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time Format
                  </label>
                  <select
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="12-hour">12-Hour (AM/PM)</option>
                    <option value="24-hour">24-Hour Format</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number & Currency Formatting
                  </label>
                  <select
                    value={currencyFormat}
                    onChange={(e) => setCurrencyFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Indian">Indian Style (1,00,000)</option>
                    <option value="International">
                      International Style (100,000)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveCustomization}
              icon={<Check className="w-4 h-4" />}
            >
              Save Customization Settings
            </Btn>
          </div>
        )}

        {/* TAB 9: LOW STOCK ALERT NUMBERS */}
        {activeTab === "stockalert" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Low Stock Alert Numbers
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Set the minimum stock level threshold. When inventory drops to
                or below this number, you'll receive low stock notifications.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Default Low Stock Alert Threshold
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Enter minimum stock units"
                    />
                    <span className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600">
                      Units
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    When stock equals or falls below this number, alert will
                    trigger
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Alert Notification Options
              </h4>
              <div className="space-y-3">
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Email Notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive email alerts when stock falls below threshold
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ${emailAlerts ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${emailAlerts ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      In-App Notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      See notifications in the dashboard
                    </p>
                  </div>
                  <button
                    onClick={() => setInAppAlerts(!inAppAlerts)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ${inAppAlerts ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${inAppAlerts ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      SMS Alerts
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive SMS alerts on your phone
                    </p>
                  </div>
                  <button
                    onClick={() => setSmsAlerts(!smsAlerts)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ${smsAlerts ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${smsAlerts ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveLowStockSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Low Stock Settings
            </Btn>
          </div>
        )}

        {/* TAB 10: USERS PERMISSIONS */}
        {activeTab === "permissions" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Users Permissions Management
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Manage staff and employee access to different modules. Control
                which features each employee can access.
              </p>
            </div>

            <div className="space-y-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {emp.department} Department
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(emp.permissions).map((module) => (
                      <div
                        key={module}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={emp.permissions[module]}
                          onChange={() =>
                            handlePermissionToggle(emp.id, module)
                          }
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                        <label className="text-xs font-medium text-slate-700 capitalize cursor-pointer">
                          {module}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Available Modules
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {[
                  "Sales",
                  "Purchase",
                  "Inventory",
                  "Accounting",
                  "Settings",
                ].map((mod) => (
                  <div
                    key={mod}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center"
                  >
                    <p className="text-xs font-medium text-slate-700">{mod}</p>
                  </div>
                ))}
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSavePermissions}
              icon={<Check className="w-4 h-4" />}
            >
              Save Permissions
            </Btn>
          </div>
        )}

        {/* TAB 11: PAYMENT METHODS */}
        {activeTab === "payment" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Payment Methods Configuration
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Select which payment methods are available for each transaction
                type (Sales, Purchase, Expenses).
              </p>
            </div>

            <div className="space-y-6">
              {/* Sales Payment Methods */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Sales Transactions
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.sales.includes(method)}
                        onChange={() =>
                          handlePaymentMethodToggle("sales", method)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Purchase Payment Methods */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Purchase Transactions
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.purchase.includes(method)}
                        onChange={() =>
                          handlePaymentMethodToggle("purchase", method)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expenses Payment Methods */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Expenses (e.g., Light Bill, Internet, etc.)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.expenses.includes(method)}
                        onChange={() =>
                          handlePaymentMethodToggle("expenses", method)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSavePaymentMethods}
              icon={<Check className="w-4 h-4" />}
            >
              Save Payment Methods
            </Btn>
          </div>
        )}

        {/* TAB 12: SECURITY SETTINGS */}
        {activeTab === "users" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  icon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-slate-500">
                      Require OTP on login
                    </p>
                  </div>
                  <button
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${twoFactorAuth ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${twoFactorAuth ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Session Timeout
                    </p>
                    <p className="text-xs text-slate-500">
                      Auto-logout after 30 minutes of inactivity
                    </p>
                  </div>
                  <button
                    onClick={() => setSessionTimeout(!sessionTimeout)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${sessionTimeout ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${sessionTimeout ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
              <Btn
                variant="primary"
                onClick={handleSaveSecuritySettings}
                icon={<Lock className="w-4 h-4" />}
              >
                Update Password
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── NOTIFICATIONS SCREEN ─────────────────────────────────────────────────────

function NotificationsScreen() {
  const typeIcon = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };
  const typeBg = {
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200",
    success: "bg-emerald-50 border-emerald-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500">
          {notifications.filter((n) => !n.read).length} unread notifications
        </p>
        <Btn variant="ghost" size="sm">
          Mark all as read
        </Btn>
      </div>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${n.read ? "bg-white border-slate-200 opacity-70" : typeBg[n.type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{typeIcon[n.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {n.time}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
          </div>
          {!n.read && (
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────

function ProfileScreen() {
  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">AU</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50">
              <Edit2 className="w-3 h-3 text-slate-600" />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Admin User</h3>
            <p className="text-sm text-slate-500">
              Business Owner · Sharma Traders
            </p>
            <Badge label="Pro Plan" variant="blue" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value="Admin" />
          <Input label="Last Name" value="User" />
          <Input
            label="Email"
            value="admin@business.in"
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Phone"
            value="+91 98765 43210"
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
        <Btn
          variant="primary"
          className="mt-5"
          icon={<Check className="w-4 h-4" />}
        >
          Update Profile
        </Btn>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Account Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            ["342", "Customers"],
            ["7", "Products Active"],
            ["1,042", "Invoices"],
          ].map(([v, l]) => (
            <div key={l} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-blue-600">{v}</p>
              <p className="text-xs text-slate-500 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

function AppShell({ role, onLogout, page, onNav }) {
  const [collapsed, setCollapsed] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const renderPage = () => {
    switch (page) {
      case "super-dashboard":
        return <SuperAdminDashboard />;
      case "dashboard":
        return <BusinessDashboard onNav={onNav} />;
      case "customers":
        return <CustomersScreen />;
      case "suppliers":
        return <SuppliersScreen />;
      case "products":
        return <ProductsScreen />;
      case "pos":
        return <POSScreen />;
      case "purchase":
        return <PurchaseScreen />;
      case "inventory":
        return <InventoryScreen />;
      case "reports":
        return <ReportsScreen />;
      case "expenses":
        return <ExpensesScreen />;
      case "users":
        return <UsersScreen />;
      case "settings":
        return role === "superadmin" ? (
          <SuperAdminSettingsScreen />
        ) : (
          <SettingsScreen />
        );
      case "notifications":
        return <NotificationsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <BusinessDashboard onNav={onNav} />;
    }
  };

  return (
    <div
      className="flex h-screen bg-slate-100 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Sidebar
        page={page}
        onNav={onNav}
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          page={page}
          onLogout={onLogout}
          onNav={onNav}
          role={role}
          notifCount={unread}
        />
        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────

const APP_PAGES = [
  "dashboard",
  "super-dashboard",
  "customers",
  "suppliers",
  "products",
  "pos",
  "purchase",
  "inventory",
  "reports",
  "expenses",
  "users",
  "settings",
  "notifications",
  "profile",
];

function getPageFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "app") return null;
  const pageKey = segments[1];
  return APP_PAGES.includes(pageKey) ? pageKey : "dashboard";
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState("owner");
  const [page, setPage] = useState(() => {
    const routePage = getPageFromPath(location.pathname);
    return (
      routePage ?? (role === "superadmin" ? "super-dashboard" : "dashboard")
    );
  });

  useEffect(() => {
    const routePage = getPageFromPath(location.pathname);

    // When user lands on /app (no page segment), pick role-based default.
    if (location.pathname === "/app") {
      setPage(role === "superadmin" ? "super-dashboard" : "dashboard");
      return;
    }

    // Otherwise, trust the explicit route segment (e.g., /app/super-dashboard).
    if (routePage) {
      setPage(routePage);
    }
  }, [location.pathname, role]);

  const handleLogin = (r) => {
    setRole(r);
    setPage(r === "superadmin" ? "super-dashboard" : "dashboard");
    navigate("/app");
  };

  const handleLogout = () => {
    setPage("dashboard");
    navigate("/");
  };

  const navAuth = useCallback(
    (v) => {
      if (v === "landing") navigate("/");
      else navigate(`/${v}`);
    },
    [navigate],
  );

  const navApp = useCallback(
    (p) => {
      setPage(p);
      if (p === "dashboard" || p === "super-dashboard") navigate("/app");
      else navigate(`/app/${p}`);
    },
    [navigate],
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNav={navAuth} />} />
      <Route
        path="/login"
        element={
          <AuthScreen view="login" onNav={navAuth} onLogin={handleLogin} />
        }
      />
      <Route
        path="/register"
        element={
          <AuthScreen view="register" onNav={navAuth} onLogin={handleLogin} />
        }
      />
      <Route
        path="/forgot"
        element={<AuthScreen view="forgot" onNav={navAuth} />}
      />
      <Route
        path="/app"
        element={
          <AppShell
            role={role}
            onLogout={handleLogout}
            page={page}
            onNav={navApp}
          />
        }
      />
      <Route
        path="/app/:pageKey"
        element={
          <AppShell
            role={role}
            onLogout={handleLogout}
            page={page}
            onNav={navApp}
          />
        }
      />
      <Route path="*" element={<LandingPage onNav={navAuth} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
