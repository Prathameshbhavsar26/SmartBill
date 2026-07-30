/**
 * One-time script to split app/App.jsx into multiple modules.
 * Run: node scripts/split-app.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcApp = path.join(root, "src", "app");
const appFile = path.join(srcApp, "App.jsx");

const lines = fs.readFileSync(appFile, "utf8").split("\n");

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(relPath, content) {
  const full = path.join(srcApp, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, "utf8");
  console.log("Wrote", relPath);
}

// ── mock data ──
const mockData = slice(102, 591);
write(
  "data/mockData.js",
  mockData
    .replace(/^const /gm, "export const ")
    .replace(
      "export const posProducts = products.filter",
      "export const posProducts = products.filter",
    ) + "\n",
);

// ── format utils ──
write(
  "utils/format.js",
  slice(593, 599).replace(/^const fmt/gm, "export const fmt") + "\n",
);

// ── UI components ──
const uiBody = slice(604, 1055);
write(
  "components/common/ui.jsx",
  `import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, XCircle, AlertCircle } from "lucide-react";

${uiBody.replace(/^function /gm, "export function ").replace(
  "function statusBadge",
  "export function statusBadge",
)}
`,
);

// ── nav config ──
write(
  "components/layout/navConfig.js",
  `import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Truck,
  Receipt,
  Wallet,
  Layers,
  Shield,
  Building2,
} from "lucide-react";

${slice(1059, 1102).replace(/^const /gm, "export const ")}
`,
);

// ── Sidebar ──
write(
  "components/layout/Sidebar.jsx",
  `import { ChevronRight, Menu, X } from "lucide-react";
import { NAV_GROUPS, SUPER_ADMIN_ITEMS } from "./navConfig";

${slice(1104, 1218).replace("function Sidebar", "export default function Sidebar")}
`,
);

// ── Topbar ──
write(
  "components/layout/Topbar.jsx",
  `import { Bell, ChevronDown, LogOut, UserCircle } from "lucide-react";

${slice(1222, 1239).replace(/^const PAGE_LABELS/gm, "export const PAGE_LABELS")}
${slice(1241, 1316).replace("function Topbar", "export default function Topbar")}
`,
);

// ── landing constants ──
write(
  "constants/landing.js",
  `import {
  Receipt,
  Package2,
  BarChart3,
  Users,
  Globe,
  Shield,
  Check,
  Star,
} from "lucide-react";

${slice(1320, 1430).replace(/^const /gm, "export const ")}
`,
);

// Page sections with their file names
const pages = [
  { name: "LandingPage.jsx", start: 1432, end: 1752, extra: `import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Menu,
  Receipt,
  Shield,
  Star,
  X,
  Zap,
} from "lucide-react";
import { FEATURES, PLANS, TESTIMONIALS } from "../constants/landing";
import { Btn } from "../components/common/ui";
` },
  { name: "AuthScreen.jsx", start: 1756, end: 2192, extra: `import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { Btn, Card, FixedPhoneInput, Input } from "../components/common/ui";
` },
  { name: "SuperAdminDashboard.jsx", start: 2196, end: 2391, extra: `import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { adminStats, businesses } from "../data/mockData";
import { fmt, fmtK } from "../utils/format";
import { Card, StatCard } from "../components/common/ui";
` },
  { name: "BusinessDashboard.jsx", start: 2395, end: 2597, extra: `import { useState } from "react";
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
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { dailySales, invoices, pieData, salesData } from "../data/mockData";
import { fmt, fmtK } from "../utils/format";
import { Btn, Card, StatCard, statusBadge } from "../components/common/ui";
` },
  { name: "CustomersScreen.jsx", start: 2601, end: 3108, extra: `import { useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { customers as initialCustomers } from "../data/mockData";
import { fmt } from "../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  FixedPhoneInput,
  Input,
  Modal,
  Toast,
  statusBadge,
} from "../components/common/ui";
` },
  { name: "SuppliersScreen.jsx", start: 3112, end: 3538, extra: `import { useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { suppliers as initialSuppliers } from "../data/mockData";
import { fmt } from "../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  FixedPhoneInput,
  Input,
  Modal,
  Toast,
  statusBadge,
} from "../components/common/ui";
` },
  { name: "ProductsScreen.jsx", start: 3542, end: 4120, extra: `import { useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { products as initialProducts } from "../data/mockData";
import { fmt } from "../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  Select,
  Toast,
  statusBadge,
} from "../components/common/ui";
` },
  { name: "POSScreen.jsx", start: 4124, end: 4409, extra: `import { useState } from "react";
import {
  Calculator,
  Minus,
  Plus,
  Receipt,
  ScanLine,
  Search,
  Trash2,
} from "lucide-react";
import { posProducts } from "../data/mockData";
import { fmt } from "../utils/format";
import { Btn, Card, Input } from "../components/common/ui";
` },
  { name: "PurchaseScreen.jsx", start: 4413, end: 4859, extra: `import { useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import { suppliers } from "../data/mockData";
import { fmt } from "../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  Select,
  Toast,
  statusBadge,
} from "../components/common/ui";
` },
  { name: "InventoryScreen.jsx", start: 4863, end: 5030, extra: `import { useState } from "react";
import { AlertTriangle, Download, Filter, Package, Search } from "lucide-react";
import { products } from "../data/mockData";
import { fmt } from "../utils/format";
import { Btn, Card, statusBadge } from "../components/common/ui";
` },
  { name: "ReportsScreen.jsx", start: 5040, end: 5101, extra: `import {
  BarChart2,
  FileText,
  PieChart,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Card } from "../components/common/ui";
` },
  { name: "ExpensesScreen.jsx", start: 5105, end: 5334, extra: `import { useState } from "react";
import {
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { expenses as initialExpenses } from "../data/mockData";
import { fmt } from "../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  Toast,
  statusBadge,
} from "../components/common/ui";
` },
  { name: "UsersScreen.jsx", start: 5338, end: 5630, extra: `import { useState } from "react";
import {
  Edit2,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCircle,
} from "lucide-react";
import { employees as initialEmployees } from "../data/mockData";
import {
  Btn,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  Toast,
  statusBadge,
} from "../components/common/ui";
` },
  { name: "BusinessesScreen.jsx", start: 5634, end: 5755, extra: `import { useState } from "react";
import { Building2, Download, Eye, Filter, Plus, Search } from "lucide-react";
import { businesses } from "../data/mockData";
import { fmt, fmtK } from "../utils/format";
import { Btn, Card, statusBadge } from "../components/common/ui";
` },
  { name: "SuperAdminSettingsScreen.jsx", start: 5759, end: 6440, extra: `import { useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Percent,
  Phone,
  Shield,
  Tag,
  UserCircle,
} from "lucide-react";
import { Btn, Card, Input, Select, Toast } from "../components/common/ui";
` },
  { name: "SettingsScreen.jsx", start: 6444, end: 8134, extra: `import { useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Percent,
  Phone,
  Receipt,
  Shield,
  Tag,
  UserCircle,
} from "lucide-react";
import { Btn, Card, Input, Select, Toast } from "../components/common/ui";
` },
  { name: "NotificationsScreen.jsx", start: 8138, end: 8184, extra: `import { Bell, CheckCircle, Info } from "lucide-react";
import { notifications } from "../data/mockData";
import { Card } from "../components/common/ui";
` },
  { name: "ProfileScreen.jsx", start: 8188, end: 8249, extra: `import { Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { Btn, Card, Input } from "../components/common/ui";
` },
];

for (const page of pages) {
  let body = slice(page.start, page.end);
  body = body.replace(/^function /gm, "export default function ");
  // Fix data references that were renamed in imports
  body = body
    .replace(/\bcustomers\b(?!\s*as)/g, (m, offset, str) => {
      if (str.slice(offset).startsWith("initialCustomers")) return m;
      if (str.slice(Math.max(0, offset - 20), offset).includes("initialCustomers")) return "initialCustomers";
      if (page.name === "CustomersScreen.jsx") {
        const before = str.slice(0, offset);
        if (before.endsWith("import { customers") || before.endsWith("from \"../data/mockData\"")) return m;
        if (before.includes("useState(customers)")) return "initialCustomers";
      }
      return m;
    });

  write(
    `pages/${page.name}`,
    page.extra + "\n" + body + "\n",
  );
}

// Fix CustomersScreen - use initialCustomers
let customersFile = fs.readFileSync(path.join(srcApp, "pages/CustomersScreen.jsx"), "utf8");
customersFile = customersFile.replace(
  "useState(customers)",
  "useState(initialCustomers)",
);
fs.writeFileSync(path.join(srcApp, "pages/CustomersScreen.jsx"), customersFile);

// Similar fixes for other screens
const renames = [
  ["pages/SuppliersScreen.jsx", "useState(suppliers)", "useState(initialSuppliers)"],
  ["pages/ProductsScreen.jsx", "useState(products)", "useState(initialProducts)"],
  ["pages/ExpensesScreen.jsx", "useState(expenses)", "useState(initialExpenses)"],
  ["pages/UsersScreen.jsx", "useState(employees)", "useState(initialEmployees)"],
];
for (const [file, from, to] of renames) {
  let content = fs.readFileSync(path.join(srcApp, file), "utf8");
  content = content.replace(from, to);
  fs.writeFileSync(path.join(srcApp, file), content);
}

// ── AppShell ──
write(
  "AppShell.jsx",
  `import { useState } from "react";
import Revenue from "./components/revenue";
import BusinessesNew from "./BusinessesNew";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import { notifications } from "./data/mockData";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import CustomersScreen from "./pages/CustomersScreen";
import SuppliersScreen from "./pages/SuppliersScreen";
import ProductsScreen from "./pages/ProductsScreen";
import POSScreen from "./pages/POSScreen";
import PurchaseScreen from "./pages/PurchaseScreen";
import InventoryScreen from "./pages/InventoryScreen";
import ReportsScreen from "./pages/ReportsScreen";
import ExpensesScreen from "./pages/ExpensesScreen";
import UsersScreen from "./pages/UsersScreen";
import SuperAdminSettingsScreen from "./pages/SuperAdminSettingsScreen";
import SettingsScreen from "./pages/SettingsScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import ProfileScreen from "./pages/ProfileScreen";

${slice(8253, 8324).replace("function AppShell", "export default function AppShell")}
`,
);

// ── AppRoutes + root App ──
write(
  "App.jsx",
  `import { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthScreen from "./pages/AuthScreen";
import AppShell from "./AppShell";

${slice(8328, 8345).replace(/^const APP_PAGES/gm, "const APP_PAGES")}
${slice(8347, 8458).replace(/^export default function App/m, "export default function App")}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
`,
);

console.log("\nDone! Backup original App.jsx manually if needed, then run npm run build to verify.");
