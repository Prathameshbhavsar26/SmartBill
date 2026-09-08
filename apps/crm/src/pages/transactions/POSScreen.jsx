import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart2,
  Download,
  Minus,
  Package,
  Plus,
  Printer,
  Receipt,
  ScanLine,
  ShoppingCart,
  Trash2,
  X,
  RefreshCw,
  RotateCcw,
  Tag,
  Percent,
  CheckCircle2,
  Edit3,
  QrCode,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
  Wallet,
  Eye,
  EyeOff,
  Lock,
  FileText,
  History,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  User,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { fmt } from "@shared/utils/format";
import { Badge, Btn, Card, Input, Select, Modal, StepperInput } from "@shared/components/common/ui";
import { fetchCustomers, createCustomer } from "@shared/api/customerAPI";
import { createOrder, createOrderReturn, fetchOrders } from "@shared/api/orderAPI";
import { getProducts } from "@shared/api/productAPI";
import { getInvoiceSettings } from "@shared/api/invoiceSettingsAPI";
import { fetchPartySettings } from "@shared/api/partySettingsAPI";
import { useTransactionSettings } from "@shared/hooks/useTransactionSettings";

export default function POSScreen() {
  const { settings: txSettings } = useTransactionSettings();

  const [cart, setCart] = useState([]);
  const [isBillingSideOpen, setIsBillingSideOpen] = useState(true);
  const [lastAddedItemId, setLastAddedItemId] = useState(null);
  const [showDetailedBilledModal, setShowDetailedBilledModal] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showSummaryBreakdown, setShowSummaryBreakdown] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [customer, setCustomer] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("smartbill_payment_settings");
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return null;
  });

  const [salesPaymentModes, setSalesPaymentModes] = useState(() => {
    return ["Cash", "UPI", "Credit Card", "Debit Card"];
  });

  const [paymentMode, setPaymentMode] = useState("Cash");

  const [transactionRef, setTransactionRef] = useState("");
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitRows, setSplitRows] = useState([
    { id: 1, mode: "Cash", amount: "", ref: "" },
    { id: 2, mode: "UPI", amount: "", ref: "" },
  ]);

  const handleAddSplitRow = () => {
    const nextId = splitRows.length > 0 ? Math.max(...splitRows.map((r) => r.id)) + 1 : 1;
    setSplitRows((prev) => [
      ...prev,
      {
        id: nextId,
        mode: "Credit Card",
        amount: "",
        ref: "",
      },
    ]);
  };

  const handleRemoveSplitRow = (id) => {
    if (splitRows.length <= 2) return;
    setSplitRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSplitRowChange = (id, field, value) => {
    setSplitRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAutoFillRemaining = (id, targetTotal) => {
    const currentOthers = splitRows
      .filter((r) => r.id !== id)
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const needed = Math.max(0, targetTotal - currentOthers);
    handleSplitRowChange(id, "amount", String(needed));
  };

  // Listen to paymentSettingsUpdated events
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem("smartbill_payment_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          setPaymentSettings(parsed);
          const validModes = ["Cash", "UPI", "Credit Card", "Debit Card"];
          setSalesPaymentModes(validModes);
          if (!validModes.includes(paymentMode)) {
            setPaymentMode(validModes[0]);
          }
        }
      } catch (_) {}
    };

    window.addEventListener("paymentSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("paymentSettingsUpdated", handleUpdate);
  }, [paymentMode]);

  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [invSettings, setInvSettings] = useState({});
  const [partySettings, setPartySettings] = useState({
    enableGrouping: true,
    trackBalance: false,
    shippingAddress: true,
  });

  // Global Invoice Discount state (for Entire Invoice mode)
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // --- SALES RETURN MODAL STATES ---
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRecentOrdersModal, setShowRecentOrdersModal] = useState(false);
  const [recentSearch, setRecentSearch] = useState("");
  const [pastOrders, setPastOrders] = useState([]);
  const [returnInvoiceNo, setReturnInvoiceNo] = useState("");
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnPasscode, setReturnPasscode] = useState("");
  const [showReturnPasscode, setShowReturnPasscode] = useState(false);
  const [requirePasscode, setRequirePasscode] = useState(false);
  const [returnReason, setReturnReason] = useState("Customer Return");
  const [returnPaymentMode, setReturnPaymentMode] = useState("Cash");
  const [processingReturn, setProcessingReturn] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [manualReturnProduct, setManualReturnProduct] = useState("");

  const filteredPastOrders = useMemo(() => {
    if (!recentSearch.trim()) return pastOrders;
    const q = recentSearch.toLowerCase();
    return pastOrders.filter(
      (o) =>
        (o.invoiceNo && o.invoiceNo.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.orderNumber && String(o.orderNumber).toLowerCase().includes(q))
    );
  }, [pastOrders, recentSearch]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  // Helper to extract product ID safely (supporting MongoDB _id and legacy id)
  const getProductId = (p) => {
    if (!p) return undefined;
    return p._id || p.id;
  };

  // Pricing rule from Transaction Settings: Retail Price, Wholesale Price, or Minimum Sale Price
  const getProductDefaultPrice = useCallback(
    (p) => {
      if (!p) return 0;
      const mode = txSettings?.salePrice || "Retail Price";
      if (mode === "Wholesale Price") {
        return p.wholesalePrice && Number(p.wholesalePrice) > 0
          ? Number(p.wholesalePrice)
          : p.cost && Number(p.cost) > 0
            ? Math.round(Number(p.cost) * 1.15)
            : Number(p.price) || 0;
      }
      if (mode === "Minimum Sale Price") {
        return p.minPrice && Number(p.minPrice) > 0
          ? Number(p.minPrice)
          : p.cost && Number(p.cost) > 0
            ? Number(p.cost)
            : Number(p.price) || 0;
      }
      return Number(p.price) || 0;
    },
    [txSettings?.salePrice]
  );

  // Derived selected customer matching current customer input
  const selectedCustomer = useMemo(() => {
    if (!customer || !customer.trim() || customer === "Walk-in Customer") return null;
    return (customers || []).find(
      (c) =>
        c &&
        c.name &&
        String(c.name).trim().toLowerCase() === String(customer).trim().toLowerCase()
    );
  }, [customers, customer]);

  const isNewCustomer = Boolean(
    customer &&
    customer.trim() !== "" &&
    customer !== "Walk-in Customer" &&
    !selectedCustomer
  );

  const handleCustomerChange = (val) => {
    setCustomer(val);
    if (!val || val.trim() === "" || val === "Walk-in Customer") {
      setCustomerPhone("");
      setCustomerCity("");
      setCustomerEmail("");
    }
  };

  // Auto-sync customer contact details when an existing customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerPhone(selectedCustomer.phone || "");
      setCustomerCity(selectedCustomer.city || "");
      setCustomerEmail(selectedCustomer.email || "");
    }
  }, [selectedCustomer]);

  // Load products from backend API with fallback
  const loadProductsList = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await getProducts();
      if (res && Array.isArray(res.products) && res.products.length > 0) {
        setProductList(res.products.filter((p) => p && (p.status === "Active" || !p.status)));
      }
    } catch {
      // Fallback
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load past orders for sales returns
  const loadPastOrders = useCallback(async () => {
    try {
      const res = await fetchOrders();
      if (res && Array.isArray(res.orders)) {
        setPastOrders(res.orders);
      }
    } catch (err) {
      console.warn("Failed to load past orders for return:", err);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    // Load invoice settings
    getInvoiceSettings().then(res => {
      if(res?.settings) setInvSettings(res.settings);
    }).catch(console.warn);

    // Load party settings
    fetchPartySettings().then(res => {
      if (res?.partySettings) setPartySettings(res.partySettings);
    }).catch(console.warn);

    const handleSettingsUpdated = (e) => {
      if (e.detail) setPartySettings(e.detail);
    };
    window.addEventListener("partySettingsUpdated", handleSettingsUpdated);

    // Load real customers from MongoDB
    fetchCustomers()
      .then((res) => {
        const list = Array.isArray(res?.customers) ? res.customers : Array.isArray(res) ? res : [];
        setCustomers(list);
      })
      .catch(console.warn);

    // Load past orders
    loadPastOrders();

    // Load products
    loadProductsList();

    return () => window.removeEventListener("partySettingsUpdated", handleSettingsUpdated);
  }, [loadProductsList, loadPastOrders]);

  const handleOpenReturnModal = () => {
    setShowReturnModal(true);
    setReturnError("");
    setReturnInvoiceNo("");
    setSelectedReturnOrder(null);
    setReturnItems([]);
    setReturnPasscode("");
    loadPastOrders();
  };

  const filteredProducts = (productList || []).filter(
    (p) =>
      p &&
      ((p.name && String(p.name).toLowerCase().includes((search || "").toLowerCase())) ||
        (p.sku && String(p.sku).toLowerCase().includes((search || "").toLowerCase())))
  );

  const allowNegativeStock = txSettings?.allowNegativeStock === true;
  const allowDiscount = txSettings?.allowDiscount !== false;
  const allowPriceEditing = txSettings?.allowPriceEditing === true;
  const discountAppliedOn = txSettings?.discountAppliedOn || "Item-wise";
  const discountType = txSettings?.discountType || "Percentage";
  const maxDiscountLimit = Number(txSettings?.maximumDiscount || 100);

  const addToCart = useCallback((p) => {
    const targetId = getProductId(p);
    const inStock = Number(p.stock) || 0;

    if (!allowNegativeStock && inStock <= 0) {
      setError(`"${p.name}" is out of stock! Enable Negative Stock in Transaction Settings to allow selling.`);
      return;
    }
    setError("");

    setCart((c) => {
      const ex = c.find((i) => getProductId(i.product) === targetId);
      if (ex) {
        if (!allowNegativeStock && ex.qty >= inStock) {
          setError(`Cannot add more than available stock (${inStock}) for ${p.name}.`);
          return c;
        }
        return c.map((i) =>
          getProductId(i.product) === targetId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      const initialPrice = getProductDefaultPrice(p);
      return [
        ...c,
        {
          product: p,
          price: initialPrice,
          qty: 1,
          discount: 0,
        },
      ];
    });

    // Auto-open billing side panel & highlight newly added product
    setIsBillingSideOpen(true);
    setLastAddedItemId(targetId);
    setTimeout(() => {
      setLastAddedItemId((prev) => (prev === targetId ? null : prev));
    }, 2200);
    showToast(`✓ Added "${p.name}" to Bill`);
  }, [allowNegativeStock, getProductDefaultPrice]);

  const handleScanBarcode = useCallback(
    (code) => {
      if (!code) return;
      const clean = String(code).trim().toLowerCase();
      const matched = productList.find(
        (p) =>
          (p.sku && String(p.sku).trim().toLowerCase() === clean) ||
          (p.barcode && String(p.barcode).trim().toLowerCase() === clean) ||
          (p.name && String(p.name).trim().toLowerCase() === clean) ||
          (p._id && String(p._id).toLowerCase() === clean)
      );
      if (matched) {
        addToCart(matched);
        showToast(`✓ Added "${matched.name}" via scan`);
      } else {
        setError(`No product found with barcode / SKU: "${code}"`);
      }
    },
    [productList, addToCart]
  );

  const updateQty = (id, delta) => {
    setError("");
    setCart((c) =>
      c
        .map((i) => {
          const itemPId = getProductId(i.product);
          if (itemPId === id) {
            const nextQty = i.qty + delta;
            const inStock = Number(i.product?.stock) || 0;
            if (!allowNegativeStock && delta > 0 && nextQty > inStock) {
              setError(`Cannot exceed available stock (${inStock}) for ${i.product?.name}.`);
              return i;
            }
            return { ...i, qty: Math.max(1, nextQty) };
          }
          return i;
        })
        .filter((i) => i.qty > 0)
    );
  };

  const updateExactQty = (id, val) => {
    setError("");
    setCart((c) =>
      c.map((i) => {
        const itemPId = getProductId(i.product);
        if (itemPId === id) {
          let nextQty = val === "" ? "" : Number(val);
          if (nextQty !== "" && nextQty < 1) nextQty = 1;
          const inStock = Number(i.product?.stock) || 0;
          if (!allowNegativeStock && nextQty !== "" && nextQty > inStock) {
            setError(`Cannot exceed available stock (${inStock}) for ${i.product?.name}.`);
            nextQty = Math.max(1, inStock);
          }
          return { ...i, qty: nextQty || 1 };
        }
        return i;
      })
    );
  };

  const updateItemPrice = (id, val) => {
    const numericPrice = Math.max(0, Number(val) || 0);
    setCart((c) =>
      c.map((i) =>
        getProductId(i.product) === id ? { ...i, price: numericPrice } : i
      )
    );
  };

  const updateItemDiscount = (id, val) => {
    const numericVal = Math.max(0, Number(val) || 0);
    if (discountType === "Percentage" && maxDiscountLimit < 100 && numericVal > maxDiscountLimit) {
      setError(`Discount cannot exceed ${maxDiscountLimit}% as per Transaction Settings.`);
    } else {
      setError("");
    }
    setCart((c) =>
      c.map((i) =>
        getProductId(i.product) === id ? { ...i, discount: numericVal } : i
      )
    );
  };

  const removeItem = (id) => {
    setError("");
    setCart((c) => c.filter((i) => getProductId(i.product) !== id));
  };

  // Financial Calculations
  const calculatedItems = useMemo(() => {
    return cart.map((i) => {
      const unitPrice =
        i.price !== undefined
          ? Number(i.price)
          : getProductDefaultPrice(i.product);
      const disc =
        allowDiscount && discountAppliedOn === "Item-wise"
          ? Number(i.discount) || 0
          : 0;

      let itemSubtotal = unitPrice * i.qty;
      if (disc > 0) {
        if (discountType === "Percentage") {
          itemSubtotal = itemSubtotal * (1 - disc / 100);
        } else if (discountType === "Flat Amount") {
          itemSubtotal = Math.max(0, itemSubtotal - disc);
        }
      }

      const productGstRate = Number(
        i?.product?.gst ?? i?.product?.gstRate ?? 18
      );
      const itemGst = (itemSubtotal * productGstRate) / 100;

      return {
        ...i,
        unitPrice,
        itemSubtotal,
        productGstRate,
        itemGst,
      };
    });
  }, [
    cart,
    allowDiscount,
    discountAppliedOn,
    discountType,
    getProductDefaultPrice,
  ]);

  const grossSubtotal = calculatedItems.reduce(
    (s, i) => s + i.itemSubtotal,
    0
  );

  // Global Invoice Discount (if applied on Entire Invoice)
  let invoiceDiscountAmount = 0;
  if (allowDiscount && discountAppliedOn === "Entire Invoice" && globalDiscount > 0) {
    if (discountType === "Percentage") {
      invoiceDiscountAmount = (grossSubtotal * globalDiscount) / 100;
    } else {
      invoiceDiscountAmount = Math.min(grossSubtotal, globalDiscount);
    }
  }

  // Cash Discount calculation
  let cashDiscountAmount = 0;
  const cashDiscountPct = Number(txSettings?.cashDiscountPercent || 0);
  if (paymentMode === "Cash" && cashDiscountPct > 0) {
    cashDiscountAmount = ((grossSubtotal - invoiceDiscountAmount) * cashDiscountPct) / 100;
  }

  const subtotal = Math.max(
    0,
    grossSubtotal - invoiceDiscountAmount - cashDiscountAmount
  );

  const gst = Math.round(
    calculatedItems.reduce((sum, i) => sum + i.itemGst, 0)
  );

  const enableRoundOff = txSettings?.enableRoundOff === true;
  const unroundedTotal = subtotal + gst;
  const total = enableRoundOff ? Math.round(unroundedTotal) : Number(unroundedTotal.toFixed(2));
  const roundOffAmount = enableRoundOff ? Number((total - unroundedTotal).toFixed(2)) : 0;

  const effectiveGstRate =
    subtotal > 0 ? Math.round((gst / subtotal) * 100) : 0;

  const isCash = paymentMode === "Cash" || paymentMode === "cash";
  const isCashRounding = Boolean(paymentSettings?.transactionRules?.cashRounding ?? true);
  const roundedTotal = isCash && isCashRounding ? Math.round(total) : total;
  const cashRoundOff = isCash && isCashRounding ? (roundedTotal - total) : 0;

  const paidValue = Number(amountPaid);
  const balanceDue = Number.isFinite(paidValue)
    ? Math.max(0, roundedTotal - paidValue)
    : roundedTotal;

  const isDigitalMode = ["UPI", "UPI & QR Code", "Credit / Debit Card", "Card", "Bank Transfer", "Digital Wallet", "Wallet"].includes(paymentMode);
  const requireRef = Boolean(paymentSettings?.transactionRules?.requireReferenceNumber && isDigitalMode);
  const allowSplit = Boolean(paymentSettings?.transactionRules?.allowSplitPayment ?? true);

  const totalSplitAllocated = splitRows.reduce(
    (sum, r) => sum + (Number(r.amount) || 0),
    0
  );
  const remainingSplitToAllocate = Math.max(0, roundedTotal - totalSplitAllocated);
  const splitChangeToReturn = Math.max(0, totalSplitAllocated - roundedTotal);

  const upiSplitTotal = splitRows
    .filter((r) => r.mode.toLowerCase().includes("upi") || r.mode.toLowerCase().includes("qr"))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const cardSplitTotal = splitRows
    .filter((r) => r.mode.toLowerCase().includes("card"))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const bankSplitTotal = splitRows
    .filter((r) => r.mode.toLowerCase().includes("bank"))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const cashSplitTotal = splitRows
    .filter((r) => r.mode.toLowerCase().includes("cash"))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const hasAnyDigitalInSplit = splitRows.some(
    (r) =>
      r.mode.toLowerCase().includes("upi") ||
      r.mode.toLowerCase().includes("qr") ||
      r.mode.toLowerCase().includes("card") ||
      r.mode.toLowerCase().includes("bank") ||
      r.mode.toLowerCase().includes("wallet")
  );

  const activeBiz = (() => {
    try {
      const rawUser = localStorage.getItem("smartbill_user");
      const u = rawUser ? JSON.parse(rawUser) : {};
      const id = u?._id || u?.id;
      const key = id ? `businessInfo_${id}` : "businessInfo";
      const rawB =
        localStorage.getItem(key) || localStorage.getItem("businessInfo");
      const b = rawB ? JSON.parse(rawB) : {};
      return { ...u, ...b };
    } catch {
      return {};
    }
  })();

  const bName = paymentSettings?.bankSettings?.accountHolderName || activeBiz.businessName || "Smart Bill Business";
  const bTagline = activeBiz.tagline || "";
  const bAddress = [
    activeBiz.address,
    activeBiz.city,
    activeBiz.state,
    activeBiz.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  const bGstin = activeBiz.gstin ? `GSTIN: ${activeBiz.gstin}` : "";
  const bPhone = activeBiz.phone ? `Ph: ${activeBiz.phone}` : "";
  const bBankName = paymentSettings?.bankSettings?.bankName || activeBiz.bankName || "";
  const bAccNo = paymentSettings?.bankSettings?.accountNumber || activeBiz.accountNumber || "";
  const bIfsc = paymentSettings?.bankSettings?.ifscCode || activeBiz.ifscCode || "";
  const bAccType = paymentSettings?.bankSettings?.accountType || "Current";
  const bBranch = paymentSettings?.bankSettings?.branchName || activeBiz.branchName || "";
  const bUpiId = paymentSettings?.upiSettings?.upiId || activeBiz.upiId || "";
  const bTerms = activeBiz.invoiceTerms || "";
  const bFooter =
    activeBiz.invoiceFooter ||
    activeBiz.invoiceFooterNote ||
    "Thank you for your business! Visit Again 🙏";

  const handlePrintInvoice = (orderOverride) => {
    const order = orderOverride || lastOrder;
    const invoiceItems =
      order?.items && order.items.length > 0
        ? order.items
        : cart.map((i) => ({
          name: i.product?.name || "Item",
          sku: i.product?.sku || "",
          qty: i.qty,
          price:
            i.price !== undefined
              ? Number(i.price)
              : getProductDefaultPrice(i.product),
          amount:
            (i.price !== undefined
              ? Number(i.price)
              : getProductDefaultPrice(i.product)) * i.qty,
        }));

    const invoiceSubtotal = order?.subtotal ?? subtotal;
    const invoiceGst = order?.gst ?? gst;
    const invoiceTotal = order?.totalOrderValue ?? roundedTotal;
    const invoicePaid = order?.amountPaid ?? (paidValue > 0 ? paidValue : roundedTotal);
    const invoiceDue = order?.balanceDue ?? Math.max(0, invoiceTotal - invoicePaid);
    const invoiceNo = order?.invoiceNo || "INV-001";
    const dateStr = order?.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");
    const status =
      order?.status ||
      (invoicePaid >= invoiceTotal
        ? "Paid"
        : invoicePaid > 0
          ? "Partial"
          : "Due");

    const fmtVal = (v) => "₹" + (Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const s = invSettings || {};
    const tpl = s.template === "Modern" 
      ? { headerBg: s.primaryColor || '#2563eb', headerColor: '#ffffff', border: `1px solid ${s.primaryColor || '#2563eb'}` }
      : s.template === "Minimal"
      ? { headerBg: 'transparent', headerColor: '#333333', border: '1px solid #eeeeee' }
      : { headerBg: '#f8fafc', headerColor: '#0f172a', border: '1px solid #e2e8f0' };
      
    const pSize = s.paperSize || "A4";
    let cssPageSize = "A4";
    let maxW = "680px";
    if(pSize.includes("Thermal 58")) { cssPageSize = "58mm auto"; maxW = "300px"; }
    else if(pSize.includes("Thermal 80")) { cssPageSize = "80mm auto"; maxW = "400px"; }

    // Dynamic UPI QR generation
    const upiCfg = paymentSettings?.upiSettings || {};
    const showUpiQr = (upiCfg.enabled ?? true) && (upiCfg.showDynamicQrOnInvoice ?? true) && (upiCfg.upiId || bUpiId);
    const resolvedUpiId = upiCfg.upiId || bUpiId;
    const resolvedPayee = upiCfg.payeeName || bName;
    const dynamicQrUrl = showUpiQr
      ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          `upi://pay?pa=${resolvedUpiId}&pn=${resolvedPayee}&am=${invoiceTotal}&cu=INR`
        )}&margin=4`
      : "";

    // Bank details
    const bankCfg = paymentSettings?.bankSettings || {};
    const showBank = (bankCfg.enabled ?? true) && (bankCfg.showOnInvoice ?? true) && (bankCfg.bankName || bBankName);

    const itemRows = invoiceItems
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; text-align: left;">
          ${item.name || "Item"}
          ${s.showDescription && item.sku ? `<div style="font-size:10px; color:#64748b; font-weight:normal;">SKU: ${item.sku}</div>` : ""}
        </td>
        ${s.showHSN ? `<td style="padding: 10px 8px; text-align: center; color: #475569; font-size:11px;">${item.hsn || "-"}</td>` : ""}
        <td style="padding: 10px 8px; text-align: center; color: #475569; font-family: monospace;">${item.qty || 1}</td>
        <td style="padding: 10px 8px; text-align: right; color: #475569; font-family: monospace;">${fmtVal(item.price || 0)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${fmtVal(item.amount || (item.price || 0) * (item.qty || 1))}</td>
      </tr>
    `
      )
      .join("");

    const statusBg = status === "Paid" ? "#dcfce7" : status === "Partial" ? "#fef9c3" : "#fee2e2";
    const statusColor = status === "Paid" ? "#15803d" : status === "Partial" ? "#a16207" : "#b91c1c";

    const bnk = s.showBankDetails ? `
      <div class="bank-info" style="margin-top: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px;">
        <strong>Bank Details:</strong><br/>
        Bank: ${s.bankName || bBankName} | A/C Name: ${s.accountHolder || bName}<br/>
        A/C No: ${s.accountNumber || bAccNo} | IFSC: ${s.ifsc || bIfsc}
      </div>
    ` : "";
    
    const upi = s.showUPIQR ? `<div style="font-size:11px; margin-top:10px;"><strong>UPI ID:</strong> ${s.upiId || bUpiId}</div>` : "";

    const terms = s.termsAndConditions ? `<div style="font-size: 10px; color: #64748b; margin-top: 10px; white-space: pre-wrap;"><strong>Terms:</strong><br/>${s.termsAndConditions}</div>` : "";

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice - ${invoiceNo}</title>
          <style>
            @page { size: ${cssPageSize}; margin: 10mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: sans-serif; color: #0f172a; background: #ffffff; padding: 20px; font-size: 13px; }
            .invoice-card { max-width: ${maxW}; margin: 0 auto; border: ${tpl.border}; border-radius: 12px; padding: 28px; background: #ffffff; }
            .header-table { width: 100%; margin-bottom: 24px; padding: 16px; background-color: ${tpl.headerBg}; color: ${tpl.headerColor}; border-radius: 8px; }
            .brand { font-size: 22px; font-weight: 800; }
            .subtext { font-size: 12px; margin-top: 2px; opacity: 0.9; }
            .inv-title { font-size: 20px; font-weight: 800; font-family: monospace; text-align: right; text-transform: uppercase; }
            .status-pill { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-top: 6px; background: ${statusBg}; color: ${statusColor}; }
            .bill-to { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
            .bill-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
            .bill-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; padding: 8px; text-align: right; }
            .totals-container { display: flex; justify-content: flex-end; }
            .totals-box { width: 260px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
            .row { display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px; }
            .row.total { border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 15px; font-weight: 800; color: #0f172a; }
            .row.due { border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px; font-weight: 700; }
            .footer-note { margin-top: 28px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .footer-greeting { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <table class="header-table">
              <tr>
                <td style="border:none; padding:0;">
                  <div class="brand">${activeBiz.businessName || "Your Business Name"}</div>
                  ${activeBiz.address ? `<div class="subtext">${activeBiz.address}, ${activeBiz.city}</div>` : ""}
                  ${activeBiz.gstin ? `<div class="subtext">GSTIN: ${activeBiz.gstin}</div>` : ""}
                </td>
                <td style="border:none; padding:0; text-align:right;">
                  <div class="inv-title">${s.invoiceTitle || "Tax Invoice"}</div>
                  <div class="subtext">${invoiceNo}</div>
                  <div class="subtext">Date: ${dateStr}</div>
                  <div><span class="status-pill">${status}</span></div>
                </td>
              </tr>
            </table>

            <div class="bill-to">
              <div class="bill-label">Billed To</div>
              <div class="bill-name">${s.showCustomerName ? (order?.customerName || customer) : "Customer"}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">Item</th>
                  ${s.showHSN ? `<th style="text-align: center;">HSN</th>` : ""}
                  <th style="text-align: center;">Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <div class="totals-container">
              <div class="totals-box">
                <div class="row">
                  <span>Subtotal</span>
                  <span style="font-family: monospace;">${fmtVal(invoiceSubtotal)}</span>
                </div>
                ${s.showTax ? `
                <div class="row">
                  <span>GST Tax</span>
                  <span style="font-family: monospace; color: #16a34a;">+${fmtVal(invoiceGst)}</span>
                </div>
                ` : ""}
                <div class="row total">
                  <span>Total Amount</span>
                  <span style="font-family: monospace; color: ${s.primaryColor || '#2563eb'};">${fmtVal(invoiceTotal)}</span>
                </div>
                <div class="row" style="margin-top: 4px;">
                  <span>Amount Paid</span>
                  <span style="font-family: monospace; color: #16a34a; font-weight: 700;">${fmtVal(invoicePaid)}</span>
                </div>
                ${s.showBalanceDue ? `
                <div class="row due">
                  <span>Balance Due</span>
                  <span style="font-family: monospace; color: ${invoiceDue > 0 ? "#dc2626" : "#16a34a"};">${fmtVal(invoiceDue)}</span>
                </div>
                ` : ""}
              </div>
            </div>


            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <div>
                ${terms}
              </div>
              ${s.showSignature ? `
              <div style="text-align: right; width: 150px; display: flex; flex-direction: column; justify-content: flex-end;">
                ${s.signatureUrl ? `<img src="${s.signatureUrl}" style="height: 50px; object-fit: contain; margin-bottom: 5px;" />` : `<div style="height: 50px; border-bottom: 1px dashed #ccc; margin-bottom: 5px;"></div>`}
                <div style="font-size: 10px; font-weight: 600;">Authorized Signatory</div>
              </div>
              ` : ""}
            </div>

            <div class="footer-note">
              <div class="footer-greeting">${s.invoiceFooter || bFooter}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    let printWin = null;
    try {
      printWin = window.open("", "_blank", "width=800,height=900");
    } catch (_) {}

    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 300);
    } else {
      // Fallback using invisible iframe so it NEVER gets blocked by popup blockers
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(printHtml);
        frameDoc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch (_) {}
          }, 1500);
        }, 300);
      }
    }
  };

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) return;
    setError("");

    // Validate reference number if required by business rule
    if (!isSplitMode && requireRef && !transactionRef.trim()) {
      setError(`Please enter the UTR / Transaction Reference Number for ${paymentMode}.`);
      return;
    }

    // Validate discount restrictions
    if (discountType === "Percentage" && maxDiscountLimit < 100) {
      if (discountAppliedOn === "Item-wise") {
        for (const item of cart) {
          if (Number(item.discount || 0) > maxDiscountLimit) {
            setError(`Discount of ${item.discount}% on "${item.product?.name}" exceeds allowed limit of ${maxDiscountLimit}%.`);
            return;
          }
        }
      } else if (globalDiscount > maxDiscountLimit) {
        setError(`Invoice discount of ${globalDiscount}% exceeds allowed limit of ${maxDiscountLimit}%.`);
        return;
      }
    }

    let finalPaymentMode = paymentMode;
    let effectivePaid = paidValue > 0 ? paidValue : roundedTotal;
    let splitPaymentsPayload = [];

    if (isSplitMode) {
      const validSplits = splitRows.filter((r) => Number(r.amount) > 0);
      if (validSplits.length === 0) {
        setError("Please enter payment amounts for at least one split method.");
        return;
      }
      effectivePaid = validSplits.reduce((sum, r) => sum + Number(r.amount), 0);
      splitPaymentsPayload = validSplits.map((r) => ({
        mode: r.mode,
        amount: Number(r.amount),
        referenceNo: r.ref || "",
      }));
      finalPaymentMode = `Split (${validSplits.map((r) => `${r.mode}: ₹${Number(r.amount).toLocaleString("en-IN")}`).join(", ")})`;
    }

    const items = calculatedItems.map((i) => ({
      productId: getProductId(i.product),
      name: i.product?.name || "Item",
      sku: i.product?.sku || "",
      price: i.unitPrice,
      qty: i.qty,
      discount: Number(i.discount) || 0,
      amount: i.itemSubtotal,
    }));

    let currentCustomerId = selectedCustomer
      ? selectedCustomer._id || selectedCustomer.id
      : null;
    let currentCustomerName = customer || "Walk-in Customer";
    let currentCustomerEmail = selectedCustomer?.email || customerEmail.trim();

    if (!selectedCustomer && customer.trim()) {
      try {
        const newCust = await createCustomer({
          name: customer.trim(),
          phone: customerPhone.trim(),
          city: customerCity.trim(),
          email: customerEmail.trim(),
        });
        currentCustomerId =
          newCust.customer?._id ||
          newCust.customer?.id ||
          newCust._id ||
          null;
        currentCustomerName =
          newCust.customer?.name || newCust.name || customer.trim();
        fetchCustomers()
          .then((res) => {
            if (res && Array.isArray(res.customers))
              setCustomers(res.customers);
          })
          .catch(() => {});
      } catch (err) {
        console.error("Failed to auto-create customer", err);
      }
    }

    const payload = {
      customerId: currentCustomerId,
      customerName: currentCustomerName,
      customerEmail: currentCustomerEmail,
      items,
      subtotal: Math.round(subtotal),
      gstRate: effectiveGstRate,
      gst,
      discount: invoiceDiscountAmount,
      cashDiscount: cashDiscountAmount,
      totalOrderValue: Math.round(roundedTotal),
      amountPaid: Math.round(effectivePaid),
      balanceDue: Math.max(0, Math.round(roundedTotal) - Math.round(effectivePaid)),
      paymentMode: finalPaymentMode,
      splitPayments: splitPaymentsPayload,
      transactionRef: transactionRef.trim() || undefined,
    };

    setSaving(true);
    try {
      const res = await createOrder(payload);
      setLastOrder(res.order);
      setPaymentModalOpen(false);

      // Trigger real-time low-stock and inventory event dispatch
      window.dispatchEvent(new CustomEvent("stockUpdated"));
      window.dispatchEvent(new CustomEvent("orderCreated", { detail: res.order }));

      // Behavior: Print After Saving
      if (txSettings?.printAfterSaving) {
        handlePrintInvoice(res.order);
      }

      // Show Print Preview
      setShowInvoice(true);
      showToast(`✓ Invoice ${res.order?.invoiceNo || ""} generated successfully!`);
      loadPastOrders();
      loadProductsList();
    } catch (err) {
      setError(err?.message || "Failed to save order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInitiatePayment = () => {
    if (cart.length === 0) {
      setError("Please add at least one product to the cart before generating an invoice.");
      return;
    }
    setError("");

    if (isSplitMode) {
      // In split mode: if any digital payment method exists (UPI, QR, Card, Bank, Wallet), open the modal
      if (hasAnyDigitalInSplit || upiSplitTotal > 0 || cardSplitTotal > 0 || bankSplitTotal > 0) {
        setPaymentModalOpen(true);
      } else {
        handleGenerateInvoice();
      }
      return;
    }

    if (isDigitalMode) {
      setPaymentModalOpen(true);
    } else {
      handleGenerateInvoice();
    }
  };

  // --- SALES RETURN EXECUTION ---
  const handleSelectOrderForReturn = (order) => {
    setSelectedReturnOrder(order);
    setReturnInvoiceNo(order.invoiceNo);
    const initialItems = (order.items || []).map((it) => ({
      ...it,
      returnQty: it.qty,
      selected: true,
    }));
    setReturnItems(initialItems);
  };

  const handleProcessSalesReturn = async () => {
    setReturnError("");
    setProcessingReturn(true);

    try {
      const activeItemsToReturn = returnItems
        .filter((it) => it.selected && Number(it.returnQty) > 0)
        .map((it) => ({
          productId: it.productId,
          name: it.name,
          sku: it.sku,
          price: it.price,
          qty: Number(it.returnQty),
          amount: (Number(it.price) || 0) * Number(it.returnQty),
        }));

      if (activeItemsToReturn.length === 0) {
        setReturnError("Please select at least one item and quantity to return.");
        setProcessingReturn(false);
        return;
      }

      const totalRefund = activeItemsToReturn.reduce(
        (s, i) => s + (i.amount || 0),
        0
      );

      const payload = {
        orderId: selectedReturnOrder?._id,
        invoiceNo: returnInvoiceNo.trim(),
        items: activeItemsToReturn,
        reason: returnReason,
        refundAmount: totalRefund,
        paymentMode: returnPaymentMode,
        passcode: returnPasscode,
      };

      const res = await createOrderReturn(payload);

      showToast(
        `✓ Sales Return processed! Refund: ${fmt(res.refundAmount)}${
          res.restoredStock ? " (Stock restored to inventory)" : ""
        }`
      );
      setShowReturnModal(false);
      loadProductsList();
    } catch (err) {
      setReturnError(
        err?.response?.data?.message || err?.message || "Failed to process sales return."
      );
    } finally {
      setProcessingReturn(false);
    }
  };

  if (showInvoice) {
    const order = lastOrder;
    const invoiceItems =
      order?.items && order.items.length > 0
        ? order.items
        : cart.map((i) => ({
            name: i.product?.name || "Item",
            qty: i.qty,
            price:
              i.price !== undefined
                ? Number(i.price)
                : getProductDefaultPrice(i.product),
            amount:
              (i.price !== undefined
                ? Number(i.price)
                : getProductDefaultPrice(i.product)) * i.qty,
          }));

    const invoiceSubtotal = order?.subtotal ?? subtotal;
    const invoiceGst = order?.gst ?? gst;
    const invoiceTotal = order?.totalOrderValue ?? total;
    const invoicePaid =
      order?.amountPaid ?? (paidValue > 0 ? paidValue : total);
    const invoiceDue =
      order?.balanceDue ?? Math.max(0, invoiceTotal - invoicePaid);

    return (
      <div className="max-w-2xl mx-auto">
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowInvoice(false);
            setCart([]);
            setAmountPaid("");
            setGlobalDiscount(0);
            setLastOrder(null);
          }}
          className="mb-4"
        >
          ← Back to Billing
        </Btn>
        <Card className="p-8" id="printable-invoice">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {activeBiz.logoUrl ? (
                  <img
                    src={activeBiz.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <BarChart2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">
                    {activeBiz.businessName || "Smart Bill"}
                  </h2>
                  {activeBiz.tagline && (
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {activeBiz.tagline}
                    </p>
                  )}
                </div>
              </div>
              {bAddress && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {bAddress}
                </p>
              )}
              {bGstin && (
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {bGstin}
                </p>
              )}
              {bPhone && (
                <p className="text-xs font-mono text-slate-400">{bPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xl tracking-tight">
                {order?.invoiceNo || "INV-001"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Date:{" "}
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN")
                  : new Date().toLocaleDateString("en-IN")}
              </p>
              <div className="mt-1.5 flex justify-end">
                <Badge
                  label={
                    order?.status ||
                    (invoicePaid >= invoiceTotal
                      ? "Paid"
                      : invoicePaid > 0
                        ? "Partial"
                        : "Due")
                  }
                  variant={
                    (order?.status ||
                      (invoicePaid >= invoiceTotal
                        ? "Paid"
                        : invoicePaid > 0
                          ? "Partial"
                          : "Due")) === "Paid"
                      ? "green"
                      : (order?.status ||
                            (invoicePaid >= invoiceTotal
                              ? "Paid"
                              : invoicePaid > 0
                                ? "Partial"
                                : "Due")) === "Partial"
                        ? "yellow"
                        : "red"
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-6 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Billed To
            </p>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {order?.customerName || customer}
            </p>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="text-left pb-2.5">Item</th>
                <th className="text-center pb-2.5">Qty</th>
                <th className="text-right pb-2.5">Rate</th>
                <th className="text-right pb-2.5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoiceItems.map((i, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {i.name}
                  </td>
                  <td className="py-3 text-xs text-center font-mono font-medium text-slate-600 dark:text-slate-300">
                    {i.qty}
                  </td>
                  <td className="py-3 text-xs text-right font-mono text-slate-600 dark:text-slate-400">
                    {fmt(i.price)}
                  </td>
                  <td className="py-3 text-xs text-right font-mono font-bold text-slate-900 dark:text-white">
                    {fmt(i.amount || i.price * i.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-medium">
                  {fmt(invoiceSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>GST Tax</span>
                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  +{fmt(invoiceGst)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-base">
                  {fmt(invoiceTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1">
                <span>Amount Paid</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {fmt(invoicePaid)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-700/60">
                <span>Balance Due</span>
                <span
                  className={`font-mono font-bold ${
                    invoiceDue > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {fmt(invoiceDue)}
                </span>
              </div>
            </div>
          </div>

          {(bBankName || bUpiId) && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs bg-slate-50/60 dark:bg-slate-800/40 p-3.5 rounded-xl">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank & Payment Details
              </p>
              {bBankName && (
                <p className="text-slate-500 dark:text-slate-400">
                  Bank: {bBankName} {bAccNo ? `| A/C: ${bAccNo}` : ""}{" "}
                  {bIfsc ? `| IFSC: ${bIfsc}` : ""}
                </p>
              )}
              {bUpiId && (
                <p className="text-blue-600 dark:text-blue-400 font-mono font-semibold mt-0.5">
                  UPI ID: {bUpiId}
                </p>
              )}
            </div>
          )}

          {bTerms && (
            <div className="mt-4 text-xs bg-slate-50/60 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                Terms & Conditions
              </p>
              <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line text-[11px] leading-relaxed">
                {bTerms}
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100/60 dark:border-blue-900/40 inline-block max-w-md w-full">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {bFooter}
              </p>
            </div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">
              Powered by SmartBill Pro
            </p>
          </div>

          {/* Payment Method & Split Details */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs bg-slate-50/60 dark:bg-slate-800/40 p-3.5 rounded-xl">
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method: <span className="text-blue-600 dark:text-blue-400 font-semibold">{order?.paymentMode || paymentMode}</span>
            </p>
            {Array.isArray(order?.splitPayments) && order.splitPayments.length > 0 && (
              <div className="mt-2 space-y-1 pl-2 border-l-2 border-blue-500">
                {order.splitPayments.map((sp, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span>{sp.mode} {sp.referenceNo ? `(Ref: ${sp.referenceNo})` : ""}:</span>
                    <span className="font-mono font-bold">{fmt(sp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 no-print">
            <Btn
              variant="primary"
              onClick={() => handlePrintInvoice(order)}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Invoice
            </Btn>
            <Btn
              variant="outline"
              onClick={() => handlePrintInvoice(order)}
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Btn>
            {(customerPhone || order?.customerPhone) ? (
              <a
                href={`https://wa.me/${String(customerPhone || order?.customerPhone).replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hello ${order?.customerName || customer || "Customer"},\n\nThank you for your purchase from ${activeBiz.businessName || "SmartBill"}!\n*Invoice No:* ${order?.invoiceNo || "INV-001"}\n*Total Amount:* ₹${(order?.totalOrderValue ?? invoiceTotal).toLocaleString("en-IN")}\n*Status:* ${order?.status || "Paid"}\n\nHave a great day!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Share on WhatsApp
              </a>
            ) : null}
            <Btn
              variant="ghost"
              onClick={() => {
                setShowInvoice(false);
                setCart([]);
                setAmountPaid("");
                setGlobalDiscount(0);
                setLastOrder(null);
              }}
            >
              ← Back / New Invoice
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-110px)] relative">
      {/* Success Notification */}
      {successToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Left: Products List */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <Input
            value={search}
            onChange={setSearch}
            icon={<ScanLine className="w-4 h-4" />}
            className="flex-1"
          />
          <Btn
            variant="outline"
            size="md"
            onClick={loadProductsList}
            disabled={loadingProducts}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${loadingProducts ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Btn>
          <Btn
            variant="outline"
            size="md"
            onClick={() => {
              loadPastOrders();
              setShowRecentOrdersModal(true);
            }}
            icon={<FileText className="w-4 h-4 text-blue-600" />}
          >
            Invoices ({pastOrders.length})
          </Btn>
          <Btn
            variant="secondary"
            size="md"
            onClick={handleOpenReturnModal}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Sales Return
          </Btn>
        </div>

        {/* Pricing tier notification badge if wholesale / min price configured */}
        {txSettings?.salePrice && txSettings.salePrice !== "Retail Price" && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-lg px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <span className="font-semibold">
              Pricing Tier: {txSettings.salePrice}
            </span>
            <span className="text-[11px] text-blue-500">
              Active in Transaction Settings
            </span>
          </div>
        )}

        {loadingProducts ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading products from database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm bg-gray-50 rounded-md border border-dashed border-gray-200 p-6">
            <Package className="w-10 h-10 text-gray-300 mb-2" />
            <p className="font-medium text-gray-700">No products found</p>
            <p className="text-xs text-gray-400">
              Add products in the Products section to sell here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {filteredProducts.map((p, idx) => {
              const pId = getProductId(p) || idx;
              const stockCount = Number(p.stock) || 0;
              const isOut = !allowNegativeStock && stockCount <= 0;
              const defaultPrice = getProductDefaultPrice(p);

              return (
                <button
                  key={pId}
                  onClick={() => addToCart(p)}
                  disabled={isOut}
                  className={`bg-white border rounded-md p-3 text-left transition-colors group flex items-center gap-4 ${
                    isOut
                      ? "opacity-60 border-gray-200 cursor-not-allowed bg-gray-50"
                      : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {p.sku || "NO-SKU"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">
                      {fmt(defaultPrice)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        stockCount <= 0
                          ? allowNegativeStock
                            ? "bg-purple-50 text-purple-600"
                            : "bg-red-50 text-red-500"
                          : stockCount < 10
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {stockCount <= 0
                        ? allowNegativeStock
                          ? `Backorder (${stockCount})`
                          : "Out of Stock"
                        : `Stock: ${stockCount}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile / Tablet Backdrop when side billing panel is open */}
      {isBillingSideOpen && (
        <div
          onClick={() => setIsBillingSideOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in"
        />
      )}

      {/* Floating Billed Products Trigger when side panel is closed */}
      {!isBillingSideOpen && (
        <button
          type="button"
          onClick={() => setIsBillingSideOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-in fade-in"
        >
          <ShoppingBag className="w-5 h-5 animate-bounce" />
          <div className="text-left">
            <p className="text-xs font-bold leading-tight">
              Billed Products ({cart.length})
            </p>
            <p className="text-[10px] font-mono opacity-90">{fmt(roundedTotal)} • Tap to Open</p>
          </div>
        </button>
      )}

      {/* Right: Billed Products Side Panel / Drawer */}
      <Card
        className={`${
          isBillingSideOpen ? "flex" : "hidden lg:flex"
        } fixed lg:static inset-y-0 right-0 z-40 lg:z-auto w-full sm:w-[460px] lg:w-[440px] xl:w-[480px] flex-shrink-0 flex-col h-full rounded-none lg:rounded-md border-l lg:border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-2xl lg:shadow-sm transition-all`}
      >
        {/* Header & Compact Customer Selection */}
        <div className="p-3 bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug tracking-tight">
                  Products to Bill
                </h3>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {cart.length} {cart.length === 1 ? "product" : "products"} •{" "}
                  {cart.reduce((s, i) => s + i.qty, 0)} units
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetailedBilledModal(true)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2 py-1 rounded-lg transition-all font-bold border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 cursor-pointer"
                    title="Open full detailed table breakdown"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Table View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCart([]);
                      setGlobalDiscount(0);
                    }}
                    className="text-[10px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded-lg transition-all font-bold border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 cursor-pointer"
                    title="Clear all items in cart"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIsBillingSideOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden cursor-pointer"
                title="Close billing panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enhanced Customer Bar with Automatic Contact Info for New Customers */}
          <div className="bg-white dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs space-y-2 transition-all">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedCustomer
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400"
                    : isNewCustomer
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 animate-pulse"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                {selectedCustomer ? (
                  <UserCheck className="w-4 h-4" />
                ) : isNewCustomer ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <input
                  list="pos-customers-list"
                  value={customer}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  placeholder="Walk-in Customer (or search/type customer name...)"
                  className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                {customer && customer !== "Walk-in Customer" && (
                  <button
                    type="button"
                    onClick={() => handleCustomerChange("Walk-in Customer")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition cursor-pointer"
                    title="Reset to Walk-in Customer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <datalist id="pos-customers-list">
                  <option value="Walk-in Customer">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c._id || c.name} value={c.name} />
                  ))}
                </datalist>
              </div>

              {/* Verified or New Status Badge */}
              {selectedCustomer ? (
                <button
                  type="button"
                  onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  title="Toggle client details"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Verified</span>
                  {showCustomerDetails ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              ) : isNewCustomer ? (
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 flex-shrink-0 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>New Client</span>
                </span>
              ) : null}
            </div>

            {/* AUTOMATIC CONTACT INPUTS FOR NEW CUSTOMER */}
            {isNewCustomer && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold px-0.5">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <UserPlus className="w-3 h-3" />
                    Customer Details (Auto-saved to CRM):
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">
                    On billing
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative">
                    <Phone className="w-3 h-3 absolute left-2 top-2 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="Mobile / Phone *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="w-3 h-3 absolute left-2 top-2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="City / Area"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 relative">
                    <Mail className="w-3 h-3 absolute left-2 top-2 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EXISTING CUSTOMER SUMMARY (Automatic) */}
            {selectedCustomer && (
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate font-medium">
                    {selectedCustomer.phone ? (
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {selectedCustomer.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No phone saved</span>
                    )}
                    {selectedCustomer.city && (
                      <span className="flex items-center gap-0.5 text-slate-500 text-[10px]">
                        • <MapPin className="w-2.5 h-2.5 text-slate-400" />{" "}
                        {selectedCustomer.city}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      Paid: {fmt(selectedCustomer.totalPaid || 0)}
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        Number(selectedCustomer.balance) !== 0
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      Due: {fmt(Math.abs(selectedCustomer.balance || 0))}
                    </span>
                  </div>
                </div>

                {/* If toggled, also allow editing existing details */}
                {showCustomerDetails && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 animate-in fade-in">
                    <input
                      type="tel"
                      placeholder="Edit Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Edit City"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Edit Email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="col-span-2 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Item Scrollable List - Maximized Height */}
        <div className="flex-1 overflow-y-auto min-h-[160px] p-3 space-y-2 bg-slate-50/40 dark:bg-slate-900/40">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center mb-2.5 text-gray-400 dark:text-gray-500">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Your cart is empty
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[190px]">
                Click products on the left to add items
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const itemId =
                item && item.product ? getProductId(item.product) || idx : idx;
              const prodName = item?.product?.name || "Item";
              const unitPrice =
                item.price !== undefined
                  ? Number(item.price)
                  : getProductDefaultPrice(item.product);

              return (
                <div
                  key={itemId}
                  className={`border rounded-xl p-3 transition-all shadow-2xs group space-y-2 ${
                    lastAddedItemId === itemId
                      ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/40 animate-pulse"
                      : "bg-slate-50/90 dark:bg-slate-800/70 hover:bg-slate-100/90 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-snug">
                          {prodName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.product?.sku || "NO-SKU"}
                        </p>
                      </div>
                    </div>
                    {lastAddedItemId === itemId && (
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">
                        Just Added
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(itemId)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Qty Counter */}
                    <StepperInput
                      min={1}
                      value={item.qty}
                      onChange={(val) => updateExactQty(itemId, val)}
                      inputClassName="w-10 py-1"
                    />

                    {/* Unit Price (Editable if allowPriceEditing is true) */}
                    <div className="flex items-center gap-1">
                      {allowPriceEditing ? (
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-blue-300 rounded px-1.5 py-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">@₹</span>
                          <input
                            type="number"
                            min={0}
                            value={item.price !== undefined ? item.price : unitPrice}
                            onChange={(e) => updateItemPrice(itemId, e.target.value)}
                            className="w-16 text-xs font-mono font-bold text-blue-600 bg-transparent outline-none text-right"
                            title="Edit Unit Price (Allowed in Settings)"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          @{fmt(unitPrice)}
                        </span>
                      )}
                    </div>

                    {/* Item-wise Discount Input (if enabled) */}
                    {allowDiscount && discountAppliedOn === "Item-wise" && (
                      <div className="flex items-center gap-1 bg-amber-50/70 border border-amber-200 rounded px-1.5 py-0.5">
                        <span className="text-[10px] text-amber-700 font-medium">
                          {discountType === "Percentage" ? "%" : "₹"}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={item.discount || 0}
                          onChange={(e) =>
                            updateItemDiscount(itemId, e.target.value)
                          }
                          className="w-12 text-xs font-mono font-bold text-amber-800 bg-transparent outline-none text-right"
                        />
                      </div>
                    )}

                    {/* Line Total */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {fmt(
                          (unitPrice * item.qty) *
                            (discountType === "Percentage"
                              ? 1 - (Number(item.discount) || 0) / 100
                              : 1) -
                            (discountType === "Flat Amount"
                              ? Number(item.discount) || 0
                              : 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Financial Controls */}
        <div className="p-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 space-y-2 flex-shrink-0">
          {/* Quick Summary Card with Collapsible Details */}
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  Payable:
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-base">
                  {fmt(roundedTotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryBreakdown(!showSummaryBreakdown)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showSummaryBreakdown ? "Hide Tax/Discount" : "Tax & Discount ▾"}</span>
              </button>
            </div>

            {/* Collapsible Breakdown (Subtotal, GST, Discounts, Rounding) */}
            {showSummaryBreakdown && (
              <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-1 text-[11px] animate-in fade-in">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmt(grossSubtotal)}</span>
                </div>
                {allowDiscount && discountAppliedOn === "Entire Invoice" && (
                  <div className="flex justify-between items-center text-amber-700">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Invoice Discount ({discountType === "Percentage" ? "%" : "₹"})
                    </span>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.5">
                      <input
                        type="number"
                        min={0}
                        value={globalDiscount}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          if (
                            discountType === "Percentage" &&
                            maxDiscountLimit < 100 &&
                            val > maxDiscountLimit
                          ) {
                            setError(`Invoice discount cannot exceed ${maxDiscountLimit}%.`);
                          } else {
                            setError("");
                          }
                          setGlobalDiscount(val);
                        }}
                        className="w-12 text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300 bg-transparent outline-none text-right"
                      />
                      <span className="text-[10px] font-bold text-amber-700">
                        -{fmt(invoiceDiscountAmount)}
                      </span>
                    </div>
                  </div>
                )}
                {paymentMode === "Cash" && cashDiscountPct > 0 && cashDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Cash Discount ({cashDiscountPct}%)</span>
                    <span className="font-mono">-{fmt(cashDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>GST Tax</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    +{fmt(gst)}
                  </span>
                </div>
                {enableRoundOff && roundOffAmount !== 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Round-off</span>
                    <span className="font-mono">
                      {roundOffAmount > 0 ? `+${fmt(roundOffAmount)}` : `-${fmt(Math.abs(roundOffAmount))}`}
                    </span>
                  </div>
                )}
                {isCash && isCashRounding && cashRoundOff !== 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Cash Rounding</span>
                    <span className="font-mono">
                      {cashRoundOff > 0 ? `+${fmt(cashRoundOff)}` : `-${fmt(Math.abs(cashRoundOff))}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Split Payment Toggle */}
          {allowSplit && (
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                Split Multi-Payment
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = !isSplitMode;
                  setIsSplitMode(next);
                  if (next && splitRows.length === 2 && !splitRows[0].amount) {
                    const half = Math.floor(roundedTotal / 2);
                    setSplitRows([
                      { id: 1, mode: "Cash", amount: String(half), ref: "" },
                      { id: 2, mode: "UPI", amount: String(roundedTotal - half), ref: "" },
                    ]);
                  }
                }}
                className={`px-2 py-0.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                  isSplitMode
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300"
                }`}
              >
                {isSplitMode ? "✓ Split Active" : "Enable Multi-Split"}
              </button>
            </div>
          )}

          {isSplitMode ? (
            <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 rounded-xl space-y-2 text-xs shadow-2xs">
              <div className="flex items-center justify-between pb-1 border-b border-blue-200/60 dark:border-blue-800/60">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                  Split Allocations
                </span>
                <span className="text-[10px] font-bold font-mono text-blue-700 dark:text-blue-300">
                  ₹{totalSplitAllocated.toLocaleString("en-IN")} / ₹{roundedTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Split Rows */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {splitRows.map((row) => (
                  <div
                    key={row.id}
                    className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-slate-800 space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <select
                        value={row.mode}
                        onChange={(e) => handleSplitRowChange(row.id, "mode", e.target.value)}
                        className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-200 flex-1 outline-none"
                      >
                        {["Cash", "UPI", "Credit Card", "Debit Card"].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>

                      <div className="relative w-20">
                        <span className="absolute left-1 top-0.5 text-[10px] text-slate-400 font-mono">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={row.amount}
                          onChange={(e) => handleSplitRowChange(row.id, "amount", e.target.value)}
                          placeholder="0"
                          className="w-full text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 pl-4 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      {splitRows.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSplitRow(row.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition cursor-pointer"
                          title="Remove method"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <input
                        type="text"
                        value={row.ref}
                        onChange={(e) => handleSplitRowChange(row.id, "ref", e.target.value)}
                        placeholder="Ref (Opt)"
                        className="flex-1 text-[9px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 outline-none"
                      />
                      
                      {(row.mode.toLowerCase().includes("upi") || row.mode.toLowerCase().includes("qr")) && (
                        <button
                          type="button"
                          onClick={() => setPaymentModalOpen(true)}
                          className="text-[9px] font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                          title="Open dynamic UPI QR Code"
                        >
                          <QrCode className="w-2.5 h-2.5" />
                          <span>QR</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAutoFillRemaining(row.id, roundedTotal)}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded cursor-pointer"
                        title="Auto-balance remaining amount"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Split Row Button */}
              <button
                type="button"
                onClick={handleAddSplitRow}
                className="w-full py-1 border border-dashed border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Method</span>
              </button>

              {/* Split Summary & Status */}
              <div className="pt-1 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[10px] font-bold">
                {totalSplitAllocated === roundedTotal ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Balanced
                  </span>
                ) : totalSplitAllocated < roundedTotal ? (
                  <span className="text-amber-600 dark:text-amber-400 font-mono">
                    ₹{remainingSplitToAllocate.toLocaleString("en-IN")} Rem.
                  </span>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-mono">
                    ₹{splitChangeToReturn.toLocaleString("en-IN")} Change
                  </span>
                )}
                <span className="font-mono text-slate-900 dark:text-white">
                  {Math.round((totalSplitAllocated / (roundedTotal || 1)) * 100)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                    Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {["Cash", "UPI", "Credit Card", "Debit Card"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                    Amount Paid
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={amountPaid}
                      placeholder={roundedTotal}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white pl-5 pr-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {paidValue > roundedTotal ? (
                <div className="flex justify-between items-center text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg px-2.5 py-1 text-emerald-700 dark:text-emerald-400 shadow-2xs">
                  <span>Change Return:</span>
                  <span className="font-mono">{fmt(paidValue - roundedTotal)}</span>
                </div>
              ) : balanceDue > 0 ? (
                <div className="flex justify-between items-center text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2.5 py-1 text-rose-700 dark:text-rose-400 shadow-2xs">
                  <span>Balance Due:</span>
                  <span className="font-mono">{fmt(balanceDue)}</span>
                </div>
              ) : null}

              {/* UTR / Reference Input when required */}
              {requireRef && (
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>UTR / Ref No</span>
                    <span className="text-red-500">*Required</span>
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter Reference/UTR No"
                    className="w-full border border-amber-300 dark:border-amber-700 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 text-xs font-mono text-slate-900 dark:text-white px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-1 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-2.5 py-1 shadow-2xs">
              <span className="truncate flex-1 font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                title="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary Billing CTA Button */}
          <button
            type="button"
            onClick={handleInitiatePayment}
            disabled={saving || cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Processing Bill...</span>
              </>
            ) : isSplitMode ? (
              hasAnyDigitalInSplit ? (
                <>
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Collect Split Payment ({fmt(roundedTotal)})</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 text-white" />
                  <span>Generate Invoice ({fmt(roundedTotal)})</span>
                </>
              )
            ) : isDigitalMode ? (
              <>
                <QrCode className="w-4 h-4 text-white" />
                <span>Scan QR & Pay {fmt(roundedTotal)}</span>
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 text-white" />
                <span>Generate & Print Invoice ({fmt(roundedTotal)})</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Process Sales Return
                  </h3>
                  <p className="text-xs text-slate-500">
                    Return sold items and restore inventory according to Transaction Settings.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Return Settings Summary Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap gap-2 justify-between">
              <span>
                Stock Restoral:{" "}
                <strong>
                  {txSettings?.restoreStockAfterReturn !== false
                    ? "Automatic"
                    : "Disabled"}
                </strong>
              </span>
              <span>
                Partial Return:{" "}
                <strong>
                  {txSettings?.allowPartialReturn !== false ? "Allowed" : "Full Only"}
                </strong>
              </span>
              <span>
                Passcode:{" "}
                <strong>
                  {txSettings?.requireReturnPasscode ? "Required" : "Not Required"}
                </strong>
              </span>
            </div>

            {/* Invoice Lookup */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Select Invoice / Enter Invoice No.
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={returnInvoiceNo}
                  onChange={(e) => setReturnInvoiceNo(e.target.value)}
                  className="flex-1 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const match = pastOrders.find(
                      (o) =>
                        o.invoiceNo?.toLowerCase() ===
                        returnInvoiceNo.trim().toLowerCase()
                    );
                    if (match) {
                      handleSelectOrderForReturn(match);
                      setReturnError("");
                    } else {
                      setReturnError("No order found with this invoice number.");
                    }
                  }}
                >
                  Lookup
                </Btn>
              </div>
            </div>

            {/* Quick list of past orders */}
            {!selectedReturnOrder && pastOrders.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Recent Invoices
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {pastOrders.slice(0, 5).map((o) => (
                    <button
                      key={o._id}
                      type="button"
                      onClick={() => handleSelectOrderForReturn(o)}
                      className="w-full text-left text-xs p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex justify-between items-center"
                    >
                      <span className="font-mono font-bold text-blue-600">
                        {o.invoiceNo}
                      </span>
                      <span className="text-slate-500">
                        {o.customerName} • {fmt(o.totalOrderValue)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct product return if allowReturnWithoutInvoice is true */}
            {!selectedReturnOrder && txSettings?.allowReturnWithoutInvoice && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">
                  Or Add Direct Item to Return (No Invoice Mode)
                </label>
                <div className="flex gap-2">
                  <select
                    value={manualReturnProduct}
                    onChange={(e) => setManualReturnProduct(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <option value="">Select product to return...</option>
                    {productList.map((p) => (
                      <option key={p._id || p.name} value={p._id || p.name}>
                        {p.name} ({fmt(p.price)})
                      </option>
                    ))}
                  </select>
                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prod = productList.find(
                        (p) => (p._id || p.name) === manualReturnProduct
                      );
                      if (prod) {
                        setReturnItems((prev) => [
                          ...prev,
                          {
                            productId: prod._id,
                            name: prod.name,
                            sku: prod.sku,
                            price: prod.price,
                            qty: 1,
                            returnQty: 1,
                            selected: true,
                          },
                        ]);
                      }
                    }}
                  >
                    Add
                  </Btn>
                </div>
              </div>
            )}

            {/* Items list for Return */}
            {returnItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Items & Return Quantities:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {returnItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        {txSettings?.allowPartialReturn !== false && (
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setReturnItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, selected: checked } : it
                                )
                              );
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            @{fmt(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Return Qty:</span>
                        {txSettings?.allowPartialReturn !== false ? (
                          <input
                            type="number"
                            min={1}
                            max={item.qty || 999}
                            value={item.returnQty}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              setReturnItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, returnQty: val } : it
                                )
                              );
                            }}
                            className="w-16 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-right"
                          />
                        ) : (
                          <span className="font-mono font-bold">
                            {item.qty || 1} (Full)
                          </span>
                        )}
                        <span className="font-mono font-bold text-rose-600 min-w-[60px] text-right">
                          {fmt((item.price || 0) * (item.returnQty || 1))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passcode input if requireReturnPasscode is enabled */}
            {txSettings?.requireReturnPasscode && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Authorization Passcode / Password (Required)
                </label>
                <div className="relative">
                  <input
                    type={showReturnPasscode ? "text" : "password"}
                    value={returnPasscode}
                    onChange={(e) => setReturnPasscode(e.target.value)}
                    className="w-full border border-amber-300 bg-amber-50/40 rounded-lg px-3 py-2 pr-10 text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowReturnPasscode(!showReturnPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600/70 hover:text-amber-700 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showReturnPasscode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Reason & Refund Mode */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Return Reason
                </label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Refund Method
                </label>
                <select
                  value={returnPaymentMode}
                  onChange={(e) => setReturnPaymentMode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  {["Cash", "UPI", "Bank Transfer", "Credit Note"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {returnError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                {returnError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => setShowReturnModal(false)}
              >
                Cancel
              </Btn>
              <Btn
                variant="danger"
                size="md"
                onClick={handleProcessSalesReturn}
                disabled={processingReturn || returnItems.length === 0}
              >
                {processingReturn ? "Processing..." : "Confirm & Process Return"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── RECENT INVOICES MODAL ── */}
      {showRecentOrdersModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Recent Generated Invoices
                  </h3>
                  <p className="text-xs text-slate-500">
                    View, print or download any previously generated invoice.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecentOrdersModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by invoice # or customer name..."
                value={recentSearch}
                onChange={(e) => setRecentSearch(e.target.value)}
                className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={loadPastOrders}
                className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 max-h-96">
              {filteredPastOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No invoices found.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="text-left pb-2.5">Invoice #</th>
                      <th className="text-left pb-2.5">Customer</th>
                      <th className="text-left pb-2.5">Date</th>
                      <th className="text-right pb-2.5">Amount</th>
                      <th className="text-center pb-2.5">Status</th>
                      <th className="text-right pb-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredPastOrders.map((ord) => {
                      const ordDate = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-IN")
                        : "—";
                      return (
                        <tr key={ord._id || ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 font-mono font-bold text-blue-600">
                            {ord.invoiceNo || ord.orderNumber || "INV-001"}
                          </td>
                          <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                            {ord.customerName || "Walk-in Customer"}
                          </td>
                          <td className="py-2.5 text-slate-500 font-mono">{ordDate}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {fmt(ord.totalOrderValue || ord.total || 0)}
                          </td>
                          <td className="py-2.5 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === "Paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : ord.status === "Partial"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {ord.status || "Paid"}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                setLastOrder(ord);
                                setShowInvoice(true);
                                setShowRecentOrdersModal(false);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT COLLECTION MODAL ── */}
      {paymentModalOpen && (
        <Modal
          title={isSplitMode ? "Collect Split Multi-Payment" : `Collect Payment: ${paymentMode}`}
          onClose={() => setPaymentModalOpen(false)}
          className="max-w-md"
        >
          <div className="space-y-4">
            {/* Header Amount Box */}
            {isSplitMode ? (
              <div className="bg-blue-50/90 dark:bg-blue-950/50 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-center shadow-xs">
                {upiSplitTotal > 0 ? (
                  <>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
                      UPI Amount to Collect via QR
                    </span>
                    <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      ₹{upiSplitTotal.toLocaleString("en-IN")}
                    </span>
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>Total Bill: ₹{roundedTotal.toLocaleString("en-IN")}</span>
                      <span>·</span>
                      <span className="text-emerald-700 dark:text-emerald-400">Cash: ₹{cashSplitTotal.toLocaleString("en-IN")}</span>
                      {cardSplitTotal > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-purple-700 dark:text-purple-400">Card: ₹{cardSplitTotal.toLocaleString("en-IN")}</span>
                        </>
                      )}
                      {bankSplitTotal > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-indigo-700 dark:text-indigo-400">Bank: ₹{bankSplitTotal.toLocaleString("en-IN")}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : cardSplitTotal > 0 ? (
                  <>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-1">
                      Card Amount to Swipe on POS
                    </span>
                    <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                      ₹{cardSplitTotal.toLocaleString("en-IN")}
                    </span>
                    <div className="mt-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Total Bill: ₹{roundedTotal.toLocaleString("en-IN")} · Cash: ₹{cashSplitTotal.toLocaleString("en-IN")}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                      Total Split Bill
                    </span>
                    <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      ₹{roundedTotal.toLocaleString("en-IN")}
                    </span>
                    <div className="mt-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Cash Tender: ₹{cashSplitTotal.toLocaleString("en-IN")}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Total Payable Amount
                </span>
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  ₹{roundedTotal.toLocaleString("en-IN")}
                </span>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Ready for Customer Scan & Payment
                  </span>
                </div>
              </div>
            )}

            {/* Multi-Split Mode Views */}
            {isSplitMode ? (
              <div className="space-y-3">
                {/* UPI QR Code specifically for the UPI split portion */}
                {(upiSplitTotal > 0 || splitRows.some((r) => r.mode.toLowerCase().includes("upi") || r.mode.toLowerCase().includes("qr"))) && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs space-y-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs inline-block mx-auto">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          `upi://pay?pa=${bUpiId || "smartbill@upi"}&pn=${encodeURIComponent(
                            bName || "SmartBill Store"
                          )}&am=${upiSplitTotal > 0 ? upiSplitTotal : roundedTotal}&cu=INR`
                        )}&margin=4`}
                        alt="UPI QR Code"
                        className="w-44 h-44 mx-auto rounded-lg"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {bName || "SmartBill Enterprise Store"}
                      </p>
                      <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {bUpiId || "merchant@upi"}
                      </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg py-1 px-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      QR encoded for UPI portion: ₹{upiSplitTotal > 0 ? upiSplitTotal.toLocaleString("en-IN") : roundedTotal.toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Scan with <strong>GPay, PhonePe, Paytm, BHIM, Amazon Pay</strong>, or any UPI app.
                    </p>
                  </div>
                )}

                {/* Card Swipe Section */}
                {cardSplitTotal > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl p-3.5 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center mx-auto">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Swipe Card on POS EDC Terminal
                    </p>
                    <p className="text-xs text-purple-800 dark:text-purple-300 font-mono font-bold">
                      Enter Card Amount: <strong>₹{cardSplitTotal.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>
                )}

                {/* Bank Transfer Section */}
                {bankSplitTotal > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-purple-600" />
                      <span>Bank IMPS/NEFT Amount: <strong className="text-blue-600 font-mono">₹{bankSplitTotal.toLocaleString("en-IN")}</strong></span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Bank: {bBankName || "HDFC Bank"} | A/C: {bAccNo || "50200012345678"} | IFSC: {bIfsc || "HDFC0001234"}
                    </p>
                  </div>
                )}

                {/* Split Breakdown List */}
                <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 rounded-xl p-3 space-y-2 text-xs">
                  <p className="font-bold text-blue-900 dark:text-blue-200">Split Breakdown Allocations</p>
                  <div className="space-y-1 divide-y divide-blue-100 dark:divide-blue-900/40">
                    {splitRows
                      .filter((r) => Number(r.amount) > 0)
                      .map((row) => (
                        <div key={row.id} className="pt-1 flex items-center justify-between text-slate-800 dark:text-slate-200">
                          <span className="font-medium">{row.mode} {row.ref ? `(${row.ref})` : ""}:</span>
                          <span className="font-mono font-bold">₹{Number(row.amount).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Single Payment Mode Views (When not in split mode) */
              <>
                {/* UPI & QR Code View */}
                {(paymentMode.toLowerCase().includes("upi") || paymentMode.toLowerCase().includes("qr")) && (
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs inline-block mx-auto mb-2">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                            `upi://pay?pa=${bUpiId || "smartbill@upi"}&pn=${encodeURIComponent(
                              bName || "SmartBill Store"
                            )}&am=${roundedTotal}&cu=INR`
                          )}&margin=4`}
                          alt="UPI QR Code"
                          className="w-44 h-44 mx-auto rounded-lg"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {bName || "SmartBill Enterprise Store"}
                        </p>
                        <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {bUpiId || "merchant@upi"}
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        Scan with <strong>GPay, PhonePe, Paytm, BHIM, Amazon Pay</strong>, or any UPI banking app.
                      </p>
                    </div>
                  </div>
                )}

                {/* Card / POS Terminal View */}
                {paymentMode.toLowerCase().includes("card") && (
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center mx-auto">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Swipe / Tap Card on POS EDC Machine
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300">
                      Enter <strong>₹{roundedTotal}</strong> on terminal and swipe customer's Visa, Mastercard, or RuPay card.
                    </p>
                  </div>
                )}

                {/* Bank Transfer View */}
                {paymentMode.toLowerCase().includes("bank") && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-purple-600" />
                      <span>Business Bank Details</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Bank:</strong> {bBankName || "HDFC Bank"} ({bAccType || "Current"})
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Account No:</strong> {bAccNo || "50200012345678"}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>IFSC:</strong> {bIfsc || "HDFC0001234"}
                    </p>
                  </div>
                )}

                {/* UTR / Transaction Reference Input */}
                {requireRef && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                      <span>UTR / Transaction Reference No</span>
                      <span className="text-red-500 font-bold">*Required</span>
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. UPI Ref / Approval Code / UTR"
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <Btn
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 text-xs"
              >
                Change Mode / Back
              </Btn>

              <button
                type="button"
                onClick={handleGenerateInvoice}
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{saving ? "Generating..." : "Payment Received → Generate Invoice"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detailed Billed Products Breakdown Table Modal */}
      {showDetailedBilledModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Detailed Billed Products Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review and adjust all items, quantities, and rates before billing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailedBilledModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No products in bill yet.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Product / SKU</th>
                      <th className="py-3 px-3 text-right">Unit Rate</th>
                      <th className="py-3 px-3 text-center">Quantity</th>
                      {allowDiscount && discountAppliedOn === "Item-wise" && (
                        <th className="py-3 px-3 text-center">Discount</th>
                      )}
                      <th className="py-3 px-3 text-right">Tax (GST)</th>
                      <th className="py-3 px-3 text-right">Line Total</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {calculatedItems.map((item, idx) => {
                      const itemId = getProductId(item.product) || idx;
                      const prodName = item.product?.name || "Product";
                      const sku = item.product?.sku || "NO-SKU";
                      const unitPrice = item.unitPrice;

                      return (
                        <tr
                          key={itemId}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-slate-400 font-mono">
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900 dark:text-white text-xs">
                              {prodName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              SKU: {sku}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {fmt(unitPrice)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex justify-center">
                              <StepperInput
                                min={1}
                                value={item.qty}
                                onChange={(val) => updateExactQty(itemId, val)}
                                inputClassName="w-10 py-1"
                              />
                            </div>
                          </td>
                          {allowDiscount && discountAppliedOn === "Item-wise" && (
                            <td className="py-3 px-3 text-center">
                              <span className="text-amber-700 dark:text-amber-400 font-mono font-medium text-xs">
                                {item.discount
                                  ? `${item.discount}${discountType === "Percentage" ? "%" : "₹"}`
                                  : "-"}
                              </span>
                            </td>
                          )}
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                            +{fmt(item.itemGst)} ({item.productGstRate}%)
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                            {fmt(item.itemSubtotal + item.itemGst)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(itemId)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Summary Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Items: <strong className="text-slate-900 dark:text-white">{cart.length}</strong>
                </span>
                <span>
                  Units: <strong className="text-slate-900 dark:text-white">{cart.reduce((s, i) => s + i.qty, 0)}</strong>
                </span>
                <span>
                  Total Payable:{" "}
                  <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                    {fmt(roundedTotal)}
                  </strong>
                </span>
              </div>
              <div className="flex gap-2">
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedBilledModal(false)}
                >
                  Close
                </Btn>
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowDetailedBilledModal(false);
                    handleInitiatePayment();
                  }}
                  disabled={cart.length === 0}
                >
                  Proceed to Bill →
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



