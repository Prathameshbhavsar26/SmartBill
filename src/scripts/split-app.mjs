import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcApp = path.join(__dirname, "..", "app");
const appFile = path.join(srcApp, "App.jsx.backup");

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

if (!fs.existsSync(appFile)) {
  throw new Error("App.jsx.backup not found. Restore backup before splitting.");
}

write(
  "data/mockData.js",
  slice(102, 591).replace(/^const /gm, "export const ") + "\n",
);

write(
  "utils/format.js",
  slice(593, 599).replace(/^const fmt/gm, "export const fmt") + "\n",
);

write(
  "components/common/ui.jsx",
  `import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, XCircle, AlertCircle } from "lucide-react";

${slice(604, 1055).replace(/^function /gm, "export function ")}
`,
);

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

write(
  "components/layout/Sidebar.jsx",
  `import { ChevronRight, Menu, X } from "lucide-react";
import { NAV_GROUPS, SUPER_ADMIN_ITEMS } from "./navConfig";

${slice(1104, 1218).replace("function Sidebar", "export default function Sidebar")}
`,
);

write(
  "components/layout/Topbar.jsx",
  `import { Bell, ChevronDown, LogOut, UserCircle } from "lucide-react";

${slice(1222, 1239).replace(/^const PAGE_LABELS/gm, "export const PAGE_LABELS")}
${slice(1241, 1316).replace("function Topbar", "export default function Topbar")}
`,
);

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

const pages = [
  {
    name: "LandingPage.jsx",
    start: 1432,
    end: 1753,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "AuthScreen.jsx",
    start: 1756,
    end: 2193,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "SuperAdminDashboard.jsx",
    start: 2196,
    end: 2392,
    extra: `import {
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
`,
  },
  {
    name: "BusinessDashboard.jsx",
    start: 2395,
    end: 2598,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "CustomersScreen.jsx",
    start: 2601,
    end: 3109,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "SuppliersScreen.jsx",
    start: 3112,
    end: 3539,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "ProductsScreen.jsx",
    start: 3542,
    end: 4121,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "POSScreen.jsx",
    start: 4124,
    end: 4410,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "PurchaseScreen.jsx",
    start: 4413,
    end: 4860,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "InventoryScreen.jsx",
    start: 4863,
    end: 5031,
    extra: `import { useState } from "react";
import { AlertTriangle, Download, Filter, Package, Search } from "lucide-react";
import { products } from "../data/mockData";
import { fmt } from "../utils/format";
import { Btn, Card, statusBadge } from "../components/common/ui";
`,
  },
  {
    name: "ReportsScreen.jsx",
    start: 5034,
    end: 5101,
    extra: `import { useState } from "react";
import {
  BarChart3,
  Download,
  Package,
  Percent,
  Printer,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import PurchaseReport from "../reports/PurchaseReport";
import ProfitLossReport from "../reports/ProfitLossReport";
import GSTReport from "../reports/GSTReport";
import InventoryReport from "../reports/InventoryReport";
import SalesReport from "../reports/SalesReport";
import { Btn } from "../components/common/ui";
`,
  },
  {
    name: "ExpensesScreen.jsx",
    start: 5105,
    end: 5335,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "UsersScreen.jsx",
    start: 5338,
    end: 5631,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "BusinessesScreen.jsx",
    start: 5634,
    end: 5757,
    extra: `import { useState } from "react";
import { Building2, Download, Eye, Filter, Plus, Search } from "lucide-react";
import { businesses } from "../data/mockData";
import { fmt, fmtK } from "../utils/format";
import { Btn, Card, statusBadge } from "../components/common/ui";
`,
  },
  {
    name: "SuperAdminSettingsScreen.jsx",
    start: 5759,
    end: 6441,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "SettingsScreen.jsx",
    start: 6444,
    end: 8135,
    extra: `import { useState } from "react";
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
`,
  },
  {
    name: "NotificationsScreen.jsx",
    start: 8138,
    end: 8185,
    extra: `import { Bell, CheckCircle, Info } from "lucide-react";
import { notifications } from "../data/mockData";
import { Card } from "../components/common/ui";
`,
  },
  {
    name: "ProfileScreen.jsx",
    start: 8188,
    end: 8250,
    extra: `import { Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { Btn, Card, Input } from "../components/common/ui";
`,
  },
];

for (const page of pages) {
  let body = slice(page.start, page.end);
  if (page.name === "ReportsScreen.jsx") {
    body = body
      .replace(/^import .+\n/gm, "")
      .replace(/^\n+/, "");
  }
  body = body.replace(/^function /gm, "export default function ");
  write(`pages/${page.name}`, page.extra + "\n" + body + "\n");
}

const renames = [
  ["pages/CustomersScreen.jsx", "useState(customers)", "useState(initialCustomers)"],
  ["pages/SuppliersScreen.jsx", "useState(suppliers)", "useState(initialSuppliers)"],
  ["pages/ProductsScreen.jsx", "useState(products)", "useState(initialProducts)"],
  ["pages/ExpensesScreen.jsx", "useState(expenses)", "useState(initialExpenses)"],
  ["pages/UsersScreen.jsx", "useState(employees)", "useState(initialEmployees)"],
];

for (const [file, from, to] of renames) {
  const full = path.join(srcApp, file);
  let content = fs.readFileSync(full, "utf8");
  content = content.replace(from, to);
  fs.writeFileSync(full, content);
}

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

${slice(8328, 8345)}
${slice(8347, 8450)}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
`,
);

console.log("Split complete.");
