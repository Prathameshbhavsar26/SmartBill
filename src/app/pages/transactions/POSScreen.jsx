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
  Lock,
  Edit3,
} from "lucide-react";
import { posProducts } from "../../data/mockData";
import { fmt } from "../../utils/format";
import { Badge, Btn, Card, Input, Select, Modal } from "../../components/common/ui";
import { fetchCustomers, createCustomer } from "../../api/customerAPI";
import { createOrder, createOrderReturn, fetchOrders } from "../../api/orderAPI";
import { getProducts } from "../../api/productAPI";
import { useTransactionSettings } from "../../hooks/useTransactionSettings";

export default function POSScreen() {
  const { settings: txSettings } = useTransactionSettings();

  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productList, setProductList] = useState(posProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [customer, setCustomer] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  // Global Invoice Discount state (for Entire Invoice mode)
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // --- SALES RETURN MODAL STATES ---
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [pastOrders, setPastOrders] = useState([]);
  const [returnInvoiceNo, setReturnInvoiceNo] = useState("");
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnPasscode, setReturnPasscode] = useState("");
  const [returnReason, setReturnReason] = useState("Customer Return");
  const [returnPaymentMode, setReturnPaymentMode] = useState("Cash");
  const [processingReturn, setProcessingReturn] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [manualReturnProduct, setManualReturnProduct] = useState("");

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
  const selectedCustomer = (customers || []).find(
    (c) =>
      c &&
      c.name &&
      customer &&
      String(c.name).trim().toLowerCase() === String(customer).trim().toLowerCase()
  );

  // Load products from backend API with fallback
  const loadProductsList = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await getProducts();
      if (res && Array.isArray(res.products) && res.products.length > 0) {
        setProductList(res.products.filter((p) => p && (p.status === "Active" || !p.status)));
      }
    } catch {
      // Fallback to posProducts mock data if backend fails
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load customers and products on mount.
  useEffect(() => {
    fetchCustomers()
      .then((res) => {
        if (res && Array.isArray(res.customers)) {
          setCustomers(res.customers);
        } else {
          setCustomers([]);
        }
      })
      .catch(() => setCustomers([]));

    loadProductsList();
  }, [loadProductsList]);

  // Load past orders for sales returns
  const loadPastOrders = async () => {
    try {
      const res = await fetchOrders();
      if (res && Array.isArray(res.orders)) {
        setPastOrders(res.orders);
      }
    } catch (err) {
      console.warn("Failed to load past orders for return:", err);
    }
  };

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
  const restrictDiscountLimit = txSettings?.restrictDiscountLimit === true;

  const addToCart = (p) => {
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
  };

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
    if (restrictDiscountLimit && discountType === "Percentage" && numericVal > maxDiscountLimit) {
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
  if (paymentMode === "Cash" && txSettings?.enableCashDiscount) {
    const defaultCash = Number(txSettings?.defaultCashDiscount || 0);
    if (defaultCash > 0) {
      if (txSettings?.cashDiscountType === "Percentage") {
        cashDiscountAmount = ((grossSubtotal - invoiceDiscountAmount) * defaultCash) / 100;
      } else {
        cashDiscountAmount = Math.min(
          grossSubtotal - invoiceDiscountAmount,
          defaultCash
        );
      }
    }
  }

  const subtotal = Math.max(
    0,
    grossSubtotal - invoiceDiscountAmount - cashDiscountAmount
  );

  const gst = Math.round(
    calculatedItems.reduce((sum, i) => sum + i.itemGst, 0)
  );

  const total = Math.round(subtotal + gst);
  const effectiveGstRate =
    subtotal > 0 ? Math.round((gst / subtotal) * 100) : 0;

  const paidValue = Number(amountPaid);
  const balanceDue = Number.isFinite(paidValue)
    ? Math.max(0, total - paidValue)
    : total;

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

  const bName = activeBiz.businessName || "Smart Bill Business";
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
  const bBankName = activeBiz.bankName || "";
  const bAccNo = activeBiz.accountNumber || "";
  const bIfsc = activeBiz.ifscCode || "";
  const bUpiId = activeBiz.upiId || "";
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

    const fmtVal = (v) =>
      "₹" +
      (Number(v) || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const itemRows = invoiceItems
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; font-weight: 600; color: #0f172a; text-align: left;">${item.name || "Item"}</td>
        <td style="padding: 10px 8px; text-align: center; color: #475569; font-family: monospace;">${item.qty || 1}</td>
        <td style="padding: 10px 8px; text-align: right; color: #475569; font-family: monospace;">${fmtVal(item.price || 0)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${fmtVal(item.amount || (item.price || 0) * (item.qty || 1))}</td>
      </tr>
    `
      )
      .join("");

    const statusBg =
      status === "Paid"
        ? "#dcfce7"
        : status === "Partial"
          ? "#fef9c3"
          : "#fee2e2";
    const statusColor =
      status === "Paid"
        ? "#15803d"
        : status === "Partial"
          ? "#a16207"
          : "#b91c1c";

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice - ${invoiceNo}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 20px;
              font-size: 13px;
            }
            .invoice-card {
              max-width: 680px;
              margin: 0 auto;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              padding: 28px;
              background: #ffffff;
            }
            .header-table { width: 100%; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
            .brand { font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
            .subtext { font-size: 12px; color: #64748b; margin-top: 2px; }
            .inv-title { font-size: 20px; font-weight: 800; color: #0f172a; font-family: monospace; text-align: right; }
            .status-pill { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-top: 6px; background: ${statusBg}; color: ${statusColor}; }
            .bill-to { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
            .bill-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
            .bill-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; padding: 8px; }
            .totals-container { display: flex; justify-content: flex-end; }
            .totals-box { width: 260px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
            .row { display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 6px; }
            .row.total { border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 15px; font-weight: 800; color: #0f172a; }
            .row.due { border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px; font-weight: 700; }
            .bank-info { margin-top: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; }
            .footer-note { margin-top: 28px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .footer-greeting { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
            .footer-terms { font-size: 10px; color: #64748b; margin-bottom: 6px; white-space: pre-line; }
            .footer-brand { font-size: 10px; color: #94a3b8; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <table class="header-table">
              <tr>
                <td style="border:none; padding:0;">
                  <div class="brand">${bName}</div>
                  ${bTagline ? `<div class="subtext">${bTagline}</div>` : ""}
                  ${bAddress ? `<div class="subtext">${bAddress}</div>` : ""}
                  ${bGstin ? `<div class="subtext">${bGstin} ${bPhone ? " | " + bPhone : ""}</div>` : ""}
                </td>
                <td style="border:none; padding:0; text-align:right;">
                  <div class="inv-title">${invoiceNo}</div>
                  <div class="subtext">Date: ${dateStr}</div>
                  <div><span class="status-pill">${status}</span></div>
                </td>
              </tr>
            </table>

            <div class="bill-to">
              <div class="bill-label">Billed To</div>
              <div class="bill-name">${order?.customerName || customer}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
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
                <div class="row">
                  <span>GST Tax</span>
                  <span style="font-family: monospace; color: #16a34a;">+${fmtVal(invoiceGst)}</span>
                </div>
                <div class="row total">
                  <span>Total Amount</span>
                  <span style="font-family: monospace; color: #2563eb;">${fmtVal(invoiceTotal)}</span>
                </div>
                <div class="row" style="margin-top: 4px;">
                  <span>Amount Paid</span>
                  <span style="font-family: monospace; color: #16a34a; font-weight: 700;">${fmtVal(invoicePaid)}</span>
                </div>
                <div class="row due">
                  <span>Balance Due</span>
                  <span style="font-family: monospace; color: ${invoiceDue > 0 ? "#dc2626" : "#16a34a"};">${fmtVal(invoiceDue)}</span>
                </div>
              </div>
            </div>

            ${
              bBankName || bUpiId
                ? `
              <div class="bank-info">
                <strong>Payment & Bank Details:</strong>
                ${bBankName ? `<div>Bank: ${bBankName} ${bAccNo ? `| A/C: ${bAccNo}` : ""} ${bIfsc ? `| IFSC: ${bIfsc}` : ""}</div>` : ""}
                ${bUpiId ? `<div>UPI ID: ${bUpiId}</div>` : ""}
              </div>
            `
                : ""
            }

            <div class="footer-note">
              <div class="footer-greeting">${bFooter}</div>
              ${bTerms ? `<div class="footer-terms">Terms & Conditions: ${bTerms}</div>` : ""}
              <div class="footer-brand">Powered by SmartBill Pro</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=800,height=900");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 250);
    }
  };

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) return;
    setError("");

    // Validate discount restrictions
    if (restrictDiscountLimit && discountType === "Percentage") {
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

    const effectivePaid = paidValue > 0 ? paidValue : total;

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
      totalOrderValue: Math.round(total),
      amountPaid: Math.round(effectivePaid),
      paymentMode,
    };

    setSaving(true);
    try {
      const res = await createOrder(payload);
      setLastOrder(res.order);

      // Behavior: Print After Saving
      if (txSettings?.printAfterSaving) {
        handlePrintInvoice(res.order);
      }

      // Behavior: Show Print Preview
      if (txSettings?.showPrintPreview !== false) {
        setShowInvoice(true);
      } else {
        // Direct reset for quick billing
        setCart([]);
        setAmountPaid("");
        setGlobalDiscount(0);
        showToast("✓ Invoice created successfully!");
      }
      loadProductsList();
    } catch (err) {
      setError(err?.message || "Failed to save order. Please try again.");
    } finally {
      setSaving(false);
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
        <Card className="p-8">
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

          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 no-print">
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
              New Invoice
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
        <div className="flex items-center gap-3">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search product or scan barcode..."
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

      {/* Right: Current Bill Sidebar */}
      <Card className="w-[440px] flex-shrink-0 flex flex-col h-full rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        {/* Header & Customer Selection */}
        <div className="p-3.5 bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 space-y-2.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug tracking-tight">
                  Current Bill
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {cart.length} {cart.length === 1 ? "item" : "items"} •{" "}
                    {cart.reduce((s, i) => s + i.qty, 0)} units
                  </span>
                </div>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCart([]);
                  setGlobalDiscount(0);
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg transition-all font-semibold border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 cursor-pointer"
                title="Clear all items in cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
              Customer
            </label>
            <input
              list="pos-customers-list"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="pos-customers-list">
              <option value="Walk-in Customer">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c._id || c.name} value={c.name} />
              ))}
            </datalist>
          </div>

          {!selectedCustomer && customer.trim() !== "" && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Phone
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  City
                </label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="City"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {selectedCustomer && (
            <div className="rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-2.5 space-y-2 text-[11px] shadow-2xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  {selectedCustomer.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedCustomer.phone || "No phone"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Orders
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {fmt(selectedCustomer.totalOrderValue || 0)}
                  </span>
                </div>
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                    Paid
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {fmt(selectedCustomer.totalPaid || 0)}
                  </span>
                </div>
                <div className="bg-rose-50/60 dark:bg-rose-950/30 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 block uppercase tracking-wider">
                    Due
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                    {fmt(Math.abs(selectedCustomer.balance || 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Item Scrollable List */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2">
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
                  className="bg-slate-50/90 dark:bg-slate-800/70 hover:bg-slate-100/90 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 transition-all shadow-2xs group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex-1 leading-snug">
                      {prodName}
                    </p>
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
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQty(itemId, -1)}
                        className="w-6 h-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[24px] text-center font-mono">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(itemId, 1)}
                        className="w-6 h-6 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

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
                          placeholder="Disc"
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
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-1.5 text-xs shadow-2xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>Subtotal</span>
              <span className="font-mono font-medium">
                {fmt(grossSubtotal)}
              </span>
            </div>

            {/* Global Invoice Discount Field (if Entire Invoice mode) */}
            {allowDiscount && discountAppliedOn === "Entire Invoice" && (
              <div className="flex justify-between items-center text-amber-700 text-xs py-1 border-t border-dashed border-slate-100">
                <span className="flex items-center gap-1 font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  Invoice Discount ({discountType === "Percentage" ? "%" : "₹"})
                </span>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                  <input
                    type="number"
                    min={0}
                    value={globalDiscount}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      if (
                        restrictDiscountLimit &&
                        discountType === "Percentage" &&
                        val > maxDiscountLimit
                      ) {
                        setError(`Invoice discount cannot exceed ${maxDiscountLimit}%.`);
                      } else {
                        setError("");
                      }
                      setGlobalDiscount(val);
                    }}
                    className="w-14 text-xs font-mono font-bold text-amber-900 bg-transparent outline-none text-right"
                  />
                  <span className="text-[10px] font-bold text-amber-700">
                    -{fmt(invoiceDiscountAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Cash Discount Display */}
            {paymentMode === "Cash" && txSettings?.enableCashDiscount && (
              <div className="flex justify-between text-emerald-600 text-xs">
                <span>
                  Cash Discount (
                  {txSettings?.cashDiscountType === "Percentage"
                    ? `${txSettings.defaultCashDiscount || 0}%`
                    : `₹${txSettings.defaultCashDiscount || 0}`}
                  )
                </span>
                <span className="font-mono font-medium">
                  -{fmt(cashDiscountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>GST Tax</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                +{fmt(gst)}
              </span>
            </div>

            <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span>Order Total</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-base">
                {fmt(total)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Amount Paid
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAmountPaid(String(total))}
                  className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-all cursor-pointer"
                >
                  Exact
                </button>
                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountPaid(String(amt))}
                    className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-all font-mono cursor-pointer"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-extrabold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
            </div>
          </div>

          {paidValue > total ? (
            <div className="flex justify-between items-center text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3 py-2 text-emerald-700 dark:text-emerald-400 shadow-2xs">
              <span>Change Return</span>
              <span className="font-mono text-sm">
                {fmt(paidValue - total)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-xs font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3 py-2 text-rose-700 dark:text-rose-400 shadow-2xs">
              <span>Balance Due</span>
              <span className="font-mono text-sm">{fmt(balanceDue)}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              {["Cash", "UPI", "Card", "Bank Transfer", "Credit"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center justify-between gap-1 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="truncate flex-1 font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 p-0.5 rounded cursor-pointer"
                title="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={cart.length === 0 || saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4 text-white" />
            <span>{saving ? "Saving..." : "Generate Invoice"}</span>
          </button>
        </div>
      </Card>

      {/* --- SALES RETURN MODAL --- */}
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
                  placeholder="e.g. INV-2026-0001"
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
                <input
                  type="password"
                  value={returnPasscode}
                  onChange={(e) => setReturnPasscode(e.target.value)}
                  placeholder="Enter your account password or PIN..."
                  className="w-full border border-amber-300 bg-amber-50/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
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
    </div>
  );
}
