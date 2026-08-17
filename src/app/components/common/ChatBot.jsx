import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Database,
  Loader2,
} from "lucide-react";
import { fetchOrders } from "../../api/orderAPI";
import { fetchCustomers } from "../../api/customerAPI";
import { getProducts } from "../../api/productAPI";
import { getExpenses } from "../../api/expenseApi";
import { fetchSuppliers } from "../../api/supplierAPI";
import { fetchPurchases } from "../../api/purchaseAPI";
import subscriptionAPI from "../../api/subscriptionAPI";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function thisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function today(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/* ─────────────────────────────────────────────────────────────
   Static Knowledge Base (General — works without login)
───────────────────────────────────────────────────────────── */
const STATIC_KB = [
  {
    kw: ["hello", "hi", "hey", "hii", "namaste"],
    get: (_, u) =>
      u
        ? `👋 Hello ${u.firstName || "there"}! I'm **SmartBot**, your personal SmartBill assistant. Ask me anything about your business data or SmartBill features!`
        : "👋 Hello! I'm **SmartBot** — your SmartBill assistant. Ask me anything about plans, billing, or how SmartBill works!",
  },
  {
    kw: ["plan", "pricing", "subscription", "how much", "cost"],
    get: () =>
      "💳 SmartBill has 3 plans:\n\n• **Starter — ₹999/mo**: 500 invoices/month, 2 users\n• **Pro — ₹2,499/mo**: Unlimited invoices, 10 users, GST filing\n• **Enterprise — ₹6,999/mo**: Unlimited everything, API access\n\nAll plans include a **14-day free trial** 🎉",
  },
  {
    kw: ["trial", "free", "14 day"],
    get: () =>
      "🎁 Every new account gets a **14-day free trial** with full access — no credit card required!",
  },
  {
    kw: ["upgrade", "downgrade", "change plan", "switch plan"],
    get: () =>
      "🔄 Go to **Settings → Subscription & Billing** to upgrade or downgrade anytime.\n\n⚡ **Upgrades**: Immediate with prorated discount\n⬇ **Downgrades**: Take effect at end of current billing period",
  },
  {
    kw: ["prorat", "discount", "mid cycle", "remaining days"],
    get: () =>
      "🏷 Prorated discount formula:\n\n`Credit = (current plan price ÷ 30) × days remaining`\n\nExample: 15 days left on Starter → ₹499 credit → Pay ₹2,000 for Pro instead of ₹2,499!",
  },
  {
    kw: ["gst", "tax", "hsn", "igst"],
    get: () =>
      "📊 SmartBill supports full GST billing — CGST, SGST, IGST, HSN codes, and GST filing (Pro/Enterprise). Configure in **Settings → GST & Tax**.",
  },
  {
    kw: ["invoice", "bill", "receipt"],
    get: (ctx) =>
      ctx
        ? `🧾 You can create GST-compliant invoices from the **POS** screen. You've created **${ctx.invoiceCountMonth} invoices** this month.`
        : "🧾 Create GST-compliant invoices from the **POS** screen. Download as PDF, add HSN codes, and track payment status.",
  },
  {
    kw: ["contact", "support", "help", "phone", "email", "reach"],
    get: () =>
      "📞 Reach us at:\n• 📧 support@smartbill.in\n• 📱 +91 98765 43210\n• 💬 Chat: 9 AM – 6 PM (Mon–Sat)",
  },
  {
    kw: ["thank", "thanks", "bye", "goodbye", "ok", "great", "awesome", "perfect"],
    get: (_, u) =>
      `😊 You're welcome${u ? `, ${u.firstName || ""}` : ""}! Anything else I can help with?`,
  },
];

/* ─────────────────────────────────────────────────────────────
   Dynamic KB — answers from real business data
───────────────────────────────────────────────────────────── */
const DYNAMIC_KB = [
  {
    kw: ["my plan", "current plan", "which plan", "what plan", "subscription status", "my subscription"],
    get: (ctx) => {
      if (!ctx) return "Please log in to see your subscription details.";
      const planNames = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
      const plan = planNames[ctx.plan] || ctx.plan || "Starter";
      const status = ctx.subStatus;
      const end = ctx.periodEnd ? new Date(ctx.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;
      return `📋 Your current plan: **${plan}**\nStatus: **${status === "active" ? "✅ Active" : status === "trialing" ? "⏳ Trial" : "❌ Expired"}**${end ? `\nBilling period ends: **${end}**` : ""}\nInvoices this month: **${ctx.invoiceCountMonth} / ${ctx.maxInvoices === Infinity || ctx.maxInvoices > 10000 ? "∞" : ctx.maxInvoices}**`;
    },
  },
  {
    kw: ["trial left", "days left", "days remaining", "expire", "when trial end"],
    get: (ctx) => {
      if (!ctx) return "Log in to check your trial status.";
      if (ctx.subStatus === "active") return `✅ Your **${ctx.plan}** plan is active and renews on **${ctx.periodEnd ? new Date(ctx.periodEnd).toLocaleDateString("en-IN") : "—"}**.`;
      if (ctx.trialEndsAt) {
        const days = Math.max(0, Math.ceil((new Date(ctx.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)));
        return days > 0
          ? `⏳ Your free trial ends in **${days} day${days === 1 ? "" : "s"}** on ${new Date(ctx.trialEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.`
          : "⚠ Your trial has **expired**. Go to **Settings → Subscription & Billing** to activate a plan.";
      }
      return "Please check **Settings → Subscription & Billing** for your trial status.";
    },
  },
  {
    kw: ["my revenue", "total revenue", "how much revenue", "revenue today", "revenue this month", "sales today", "sales this month", "total sales", "how much sale"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your revenue data.";
      const lower = arguments[1]?.toLowerCase() || "";
      return `💰 **Your Sales Summary:**\n• Today: **${fmt(ctx.revenueToday)}**\n• This month: **${fmt(ctx.revenueMonth)}**\n• Total (all time): **${fmt(ctx.revenueTotal)}**\n• Invoices this month: **${ctx.invoiceCountMonth}**`;
    },
  },
  {
    kw: ["revenue", "income", "earning", "sales amount", "total sale"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your revenue data.";
      return `💰 **Your Sales Summary:**\n• Today: **${fmt(ctx.revenueToday)}**\n• This month: **${fmt(ctx.revenueMonth)}**\n• Total (all time): **${fmt(ctx.revenueTotal)}**\n• Invoices this month: **${ctx.invoiceCountMonth}**`;
    },
  },
  {
    kw: ["invoice count", "how many invoice", "number of invoice", "invoices today", "invoices this month", "total invoice"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your invoice data.";
      return `🧾 **Invoice Summary:**\n• Today: **${ctx.invoiceCountToday}** invoice${ctx.invoiceCountToday === 1 ? "" : "s"}\n• This month: **${ctx.invoiceCountMonth}** invoice${ctx.invoiceCountMonth === 1 ? "" : "s"}\n• All time: **${ctx.invoiceCountTotal}** invoices\n• Total billed: **${fmt(ctx.revenueTotal)}**`;
    },
  },
  {
    kw: ["customer", "clients", "how many customer", "total customer", "my customer"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your customer data.";
      const top = ctx.topCustomers?.slice(0, 3).map((c, i) => `${i + 1}. ${c.name} — ${fmt(c.total)}`).join("\n") || "—";
      return `👥 **Customer Summary:**\n• Total customers: **${ctx.customerCount}**\n• Outstanding balance: **${fmt(ctx.totalDue)}**\n\n🏆 **Top customers this month:**\n${top}`;
    },
  },
  {
    kw: ["top customer", "best customer", "biggest customer"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your top customers.";
      if (!ctx.topCustomers?.length) return "📊 No customer sales data available yet.";
      const list = ctx.topCustomers.slice(0, 5).map((c, i) => `${i + 1}. **${c.name}** — ${fmt(c.total)}`).join("\n");
      return `🏆 **Your Top Customers (this month):**\n${list}`;
    },
  },
  {
    kw: ["due", "outstanding", "pending payment", "balance", "unpaid"],
    get: (ctx) => {
      if (!ctx) return "Log in to see outstanding payments.";
      return `⏳ **Outstanding Payments:**\n• Total due from customers: **${fmt(ctx.totalDue)}**\n• Number of customers with dues: **${ctx.customersWithDue}**\n\nGo to **Customers** to view and follow up on pending payments.`;
    },
  },
  {
    kw: ["product", "inventory", "stock", "item", "how many product"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your product data.";
      const lowList = ctx.lowStockProducts?.slice(0, 3).map((p) => `• **${p.name}**: ${p.stock} left (min: ${p.minStock})`).join("\n") || "None ✅";
      return `📦 **Inventory Summary:**\n• Total products: **${ctx.productCount}**\n• Low stock items: **${ctx.lowStockCount}**\n• Out of stock: **${ctx.outOfStockCount}**\n\n⚠ **Low Stock Items:**\n${lowList}`;
    },
  },
  {
    kw: ["low stock", "out of stock", "running out", "reorder", "stock alert"],
    get: (ctx) => {
      if (!ctx) return "Log in to see stock alerts.";
      if (ctx.lowStockCount === 0 && ctx.outOfStockCount === 0) return "✅ All your products are well-stocked! No alerts right now.";
      const outList = ctx.outOfStockProducts?.slice(0, 3).map((p) => `• **${p.name}** — OUT OF STOCK`).join("\n") || "";
      const lowList = ctx.lowStockProducts?.slice(0, 3).map((p) => `• **${p.name}** — ${p.stock} left`).join("\n") || "";
      return `⚠ **Stock Alerts:**\n\n🔴 Out of stock (${ctx.outOfStockCount}):\n${outList || "None"}\n\n🟡 Low stock (${ctx.lowStockCount}):\n${lowList || "None"}\n\nVisit **Inventory** to restock.`;
    },
  },
  {
    kw: ["expense", "expenses", "spending", "cost", "how much spent", "total expense"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your expense data.";
      return `💸 **Expense Summary:**\n• This month: **${fmt(ctx.expenseMonth)}**\n• All time: **${fmt(ctx.expenseTotal)}**\n\n📊 Net this month: **${fmt(ctx.revenueMonth - ctx.expenseMonth)}** (Revenue − Expenses)`;
    },
  },
  {
    kw: ["profit", "net", "loss", "p&l", "earning after expense"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your profit data.";
      const profit = ctx.revenueMonth - ctx.expenseMonth;
      return `📈 **Profit & Loss (This Month):**\n• Revenue: **${fmt(ctx.revenueMonth)}**\n• Expenses: **${fmt(ctx.expenseMonth)}**\n• **Net Profit: ${fmt(profit)}** ${profit >= 0 ? "✅" : "⚠ (loss)"}`;
    },
  },
  {
    kw: ["supplier", "vendor", "how many supplier"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your supplier data.";
      return `🏭 **Supplier Summary:**\n• Total suppliers: **${ctx.supplierCount}**\n• Total payable to suppliers: **${fmt(ctx.totalPayable)}**\n\nGo to **Suppliers** to manage purchases and payables.`;
    },
  },
  {
    kw: ["purchase", "buy", "bought", "purchase this month", "total purchase"],
    get: (ctx) => {
      if (!ctx) return "Log in to see your purchase data.";
      return `🛒 **Purchase Summary:**\n• Purchases this month: **${ctx.purchaseCountMonth}**\n• Spent this month: **${fmt(ctx.purchaseAmountMonth)}**\n• Total all time: **${fmt(ctx.purchaseAmountTotal)}**`;
    },
  },
  {
    kw: ["my business", "business info", "my name", "business name", "who am i"],
    get: (ctx, u) => {
      if (!u) return "Log in to see your business details.";
      return `🏢 **Your Business:**\n• Owner: **${u.firstName} ${u.lastName || ""}**\n• Business: **${u.businessName || "—"}**\n• Email: **${u.email}**\n• Plan: **${ctx?.plan || "—"}**`;
    },
  },
  {
    kw: ["summary", "overview", "dashboard", "how is my business", "business health", "status"],
    get: (ctx, u) => {
      if (!ctx) return "Log in to get your business overview.";
      const profit = ctx.revenueMonth - ctx.expenseMonth;
      return `📊 **Business Overview for ${new Date().toLocaleString("en-IN", { month: "long" })}:**\n\n💰 Revenue: **${fmt(ctx.revenueMonth)}**\n🧾 Invoices: **${ctx.invoiceCountMonth}**\n👥 Customers: **${ctx.customerCount}**\n💸 Expenses: **${fmt(ctx.expenseMonth)}**\n📈 Net Profit: **${fmt(profit)}**\n📦 Products: **${ctx.productCount}** (${ctx.lowStockCount} low stock)\n🏭 Suppliers: **${ctx.supplierCount}**`;
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   Reply engine
───────────────────────────────────────────────────────────── */
function getBotReply(input, ctx, user) {
  const lower = input.toLowerCase();

  // Dynamic KB first (business data questions)
  for (const item of DYNAMIC_KB) {
    if (item.kw.some((kw) => lower.includes(kw))) {
      return item.get(ctx, user);
    }
  }

  // Static KB
  for (const item of STATIC_KB) {
    if (item.kw.some((kw) => lower.includes(kw))) {
      return item.get(ctx, user);
    }
  }

  // Fallback
  if (user) {
    return `🤔 I couldn't find an answer for that, ${user.firstName || ""}. Try asking:\n• "What is my revenue this month?"\n• "How many customers do I have?"\n• "Show me my inventory status"\n• "What is my current plan?"\n\nOr contact support at **support@smartbill.in**`;
  }
  return "🤔 I'm not sure about that. For detailed help, email **support@smartbill.in** or call **+91 98765 43210**.";
}

const SUGGESTIONS_GUEST = [
  "What plans are available?",
  "How does the free trial work?",
  "How do I upgrade mid-cycle?",
  "What is prorated discount?",
];

const SUGGESTIONS_OWNER = [
  "Show my business overview",
  "What is my revenue this month?",
  "How many customers do I have?",
  "Show low stock products",
  "What are my expenses this month?",
  "What is my current plan?",
];

/** Renders **bold** markdown in messages */
function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main ChatBot component
   Props: user (null if not logged in, user object if logged in)
───────────────────────────────────────────────────────────── */
export default function ChatBot({ user }) {
  const isLoggedIn = !!user;
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState(null);       // business context data
  const [ctxLoading, setCtxLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      from: "bot",
      text: user
        ? `👋 Hello **${user.firstName || "there"}**! I'm **SmartBot**, your personal business assistant.\n\nI have access to your live business data — ask me anything!`
        : "👋 Hi! I'm **SmartBot**, your SmartBill assistant.\n\nAsk me about plans, invoices, GST, or any SmartBill feature!",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Load business context when logged in ── */
  const loadContext = useCallback(async () => {
    if (!isLoggedIn) return;
    setCtxLoading(true);
    try {
      const [ordersRes, customersRes, productsRes, expensesRes, suppliersRes, purchasesRes, subRes] =
        await Promise.allSettled([
          fetchOrders(),
          fetchCustomers(),
          getProducts(),
          getExpenses(),
          fetchSuppliers(),
          fetchPurchases(),
          subscriptionAPI.getSubscriptionStatus(),
        ]);

      const orders = ordersRes.value?.orders || [];
      const customers = customersRes.value?.customers || [];
      const products = productsRes.value?.products || [];
      const expenses = expensesRes.value?.expenses || [];
      const suppliers = suppliersRes.value?.suppliers || [];
      const purchases = purchasesRes.value?.purchases || [];
      const sub = subRes.value;

      // Revenue calculations
      const revenueTotal = orders.reduce((s, o) => s + (o.totalOrderValue || 0), 0);
      const revenueMonth = orders.filter((o) => thisMonth(o.createdAt)).reduce((s, o) => s + (o.totalOrderValue || 0), 0);
      const revenueToday = orders.filter((o) => today(o.createdAt)).reduce((s, o) => s + (o.totalOrderValue || 0), 0);
      const invoiceCountTotal = orders.length;
      const invoiceCountMonth = orders.filter((o) => thisMonth(o.createdAt)).length;
      const invoiceCountToday = orders.filter((o) => today(o.createdAt)).length;

      // Customers
      const totalDue = customers.reduce((s, c) => s + (c.balanceDue || c.balance || 0), 0);
      const customersWithDue = customers.filter((c) => (c.balanceDue || c.balance || 0) > 0).length;

      // Top customers by invoice amount this month
      const customerMap = {};
      orders.filter((o) => thisMonth(o.createdAt)).forEach((o) => {
        const name = o.customerName || "Unknown";
        customerMap[name] = (customerMap[name] || 0) + (o.totalOrderValue || 0);
      });
      const topCustomers = Object.entries(customerMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

      // Products
      const lowStockProducts = products.filter((p) => p.stock !== undefined && p.minStock !== undefined && p.stock > 0 && p.stock < p.minStock);
      const outOfStockProducts = products.filter((p) => p.stock !== undefined && p.stock === 0);

      // Expenses
      const expenseTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      const expenseMonth = expenses.filter((e) => thisMonth(e.date || e.createdAt)).reduce((s, e) => s + (e.amount || 0), 0);

      // Suppliers
      const totalPayable = suppliers.reduce((s, sup) => s + (sup.openingBalance || sup.balance || 0), 0);

      // Purchases
      const purchaseCountMonth = purchases.filter((p) => thisMonth(p.createdAt)).length;
      const purchaseAmountMonth = purchases.filter((p) => thisMonth(p.createdAt)).reduce((s, p) => s + (p.totalAmount || p.total || 0), 0);
      const purchaseAmountTotal = purchases.reduce((s, p) => s + (p.totalAmount || p.total || 0), 0);

      // Subscription
      const plan = sub?.subscription?.plan || "starter";
      const subStatus = sub?.subscription?.status || "trialing";
      const trialEndsAt = sub?.subscription?.trialEndsAt;
      const periodEnd = sub?.subscription?.currentPeriodEnd;
      const maxInvoices = sub?.plan?.maxInvoicesPerMonth ?? Infinity;

      setCtx({
        revenueTotal, revenueMonth, revenueToday,
        invoiceCountTotal, invoiceCountMonth, invoiceCountToday,
        customerCount: customers.length, totalDue, customersWithDue, topCustomers,
        productCount: products.length, lowStockProducts, outOfStockProducts,
        lowStockCount: lowStockProducts.length, outOfStockCount: outOfStockProducts.length,
        expenseTotal, expenseMonth,
        supplierCount: suppliers.length, totalPayable,
        purchaseCountMonth, purchaseAmountMonth, purchaseAmountTotal,
        plan, subStatus, trialEndsAt, periodEnd, maxInvoices,
      });
    } catch (err) {
      console.warn("ChatBot context load error:", err);
    } finally {
      setCtxLoading(false);
    }
  }, [isLoggedIn]);

  // Load context once on mount if logged in
  useEffect(() => {
    if (isLoggedIn) loadContext();
  }, [isLoggedIn, loadContext]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = getBotReply(trimmed, ctx, user);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setTyping(false);
      if (!open) setUnread((n) => n + 1);
    }, 600 + Math.random() * 500);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        from: "bot",
        text: user
          ? `👋 Hello **${user.firstName || "there"}**! I'm **SmartBot**. Ask me anything about your business!`
          : "👋 Hi! I'm **SmartBot** — your SmartBill assistant. Ask me anything!",
      },
    ]);
    setInput("");
  };

  const suggestions = isLoggedIn ? SUGGESTIONS_OWNER : SUGGESTIONS_GUEST;
  const showSuggestions = messages.length <= 2;

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)",
          boxShadow: "0 8px 32px rgba(109, 40, 217, 0.45)",
        }}
        aria-label="Open SmartBot chat"
      >
        {open ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow">
            {unread}
          </span>
        )}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "#6D28D9" }}
          />
        )}
      </button>

      {/* ── Chat window ── */}
      <div
        className="fixed bottom-24 right-6 z-50 w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200 transition-all duration-300 origin-bottom-right"
        style={{
          transform: open ? "scale(1)" : "scale(0.85)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          maxHeight: "580px",
          background: "#fff",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)" }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">SmartBot</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-xs">
                {isLoggedIn
                  ? ctxLoading
                    ? "Loading your business data…"
                    : "Connected to your business data"
                  : "Always online · Instant replies"}
              </span>
            </div>
          </div>

          {/* Live data badge */}
          {isLoggedIn && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              {ctxLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Database className="w-3 h-3" />
              )}
              <span>Live</span>
            </div>
          )}

          <div className="flex items-center gap-1 ml-1">
            {isLoggedIn && (
              <button
                onClick={loadContext}
                disabled={ctxLoading}
                title="Refresh business data"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${ctxLoading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              onClick={resetChat}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear chat"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Context loading bar */}
        {isLoggedIn && ctxLoading && (
          <div className="h-0.5 bg-violet-100 overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-indigo-400"
              style={{ width: "60%", animation: "loadBar 1.2s ease-in-out infinite" }}
            />
          </div>
        )}

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ minHeight: 0, maxHeight: "360px", background: "#F8FAFC" }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.from === "bot"
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                    : "bg-slate-200"
                }`}
              >
                {msg.from === "bot" ? (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                  msg.from === "bot"
                    ? "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                    : "text-white rounded-br-sm"
                }`}
                style={
                  msg.from === "user"
                    ? { background: "linear-gradient(135deg, #6D28D9, #4F46E5)" }
                    : {}
                }
              >
                <MessageText text={msg.text} />
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <span className="flex gap-1 items-center">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {showSuggestions && (
          <div className="px-3 pb-2 flex-shrink-0 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium pt-2 pb-1.5 uppercase tracking-wider">
              {isLoggedIn ? "Ask about your business" : "Quick questions"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 bg-white flex-shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isLoggedIn ? "Ask about your business…" : "Ask me anything…"}
            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #6D28D9, #4F46E5)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Branding */}
        <div className="text-center py-1.5 bg-white border-t border-slate-50">
          <span className="text-[10px] text-slate-400">
            {isLoggedIn ? "🔒 Your data is private & secure · " : ""}
            Powered by <span className="font-semibold text-violet-600">SmartBill AI</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes loadBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}
