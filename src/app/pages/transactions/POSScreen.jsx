import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { posProducts } from "../../data/mockData";
import { fmt } from "../../utils/format";
import { Badge, Btn, Card, Input, Select } from "../../components/common/ui";
import { fetchCustomers } from "../../api/customerAPI";
import { createOrder } from "../../api/orderAPI";
import { getProducts } from "../../api/productAPI";

export default function POSScreen() {
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productList, setProductList] = useState(posProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  // Helper to extract product ID safely (supporting MongoDB _id and legacy id)
  const getProductId = (p) => {
    if (!p) return undefined;
    return p._id || p.id;
  };

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

  const filteredProducts = (productList || []).filter(
    (p) =>
      p &&
      ((p.name && String(p.name).toLowerCase().includes((search || "").toLowerCase())) ||
        (p.sku && String(p.sku).toLowerCase().includes((search || "").toLowerCase())))
  );

  const addToCart = (p) => {
    const targetId = getProductId(p);
    if ((p.stock || 0) <= 0) {
      setError(`"${p.name}" is out of stock!`);
      return;
    }
    setError("");

    setCart((c) => {
      const ex = c.find((i) => getProductId(i.product) === targetId);
      if (ex) {
        if (ex.qty >= p.stock) {
          setError(`Cannot add more than available stock (${p.stock}) for ${p.name}.`);
          return c;
        }
        return c.map((i) =>
          getProductId(i.product) === targetId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...c, { product: p, qty: 1, discount: 0 }];
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
            if (delta > 0 && nextQty > (i.product.stock || 0)) {
              setError(`Cannot exceed available stock (${i.product.stock}) for ${i.product.name}.`);
              return i;
            }
            return { ...i, qty: Math.max(1, nextQty) };
          }
          return i;
        })
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => {
    setError("");
    setCart((c) => c.filter((i) => getProductId(i.product) !== id));
  };

  const subtotal = cart.reduce(
    (s, i) => s + (Number(i?.product?.price) || 0) * i.qty * (1 - (Number(i.discount) || 0) / 100),
    0
  );
  const gst = Math.round(
    cart.reduce((sum, i) => {
      const price = Number(i?.product?.price) || 0;
      const disc = Number(i.discount) || 0;
      const itemSubtotal = price * i.qty * (1 - disc / 100);
      const productGstRate = Number(i?.product?.gst ?? i?.product?.gstRate ?? 18);
      return sum + (itemSubtotal * productGstRate) / 100;
    }, 0)
  );
  const total = subtotal + gst;
  const effectiveGstRate = subtotal > 0 ? Math.round((gst / subtotal) * 100) : 0;

  const paidValue = Number(amountPaid);
  const balanceDue = Number.isFinite(paidValue)
    ? Math.max(0, total - paidValue)
    : total;

  const selectedCustomer = customers.find((c) => c.name === customer);

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) return;
    setError("");

    // Default amount paid to the full total if left blank.
    const effectivePaid = paidValue > 0 ? paidValue : total;

    const items = cart.map((i) => ({
      productId: getProductId(i.product),
      name: i.product.name,
      sku: i.product.sku || "",
      price: Number(i.product.price) || 0,
      qty: i.qty,
      discount: Number(i.discount) || 0,
      amount: (Number(i.product.price) || 0) * i.qty,
    }));

    const payload = {
      customerId: selectedCustomer ? (selectedCustomer._id || selectedCustomer.id) : null,
      customerName: customer,
      customerEmail: selectedCustomer?.email || "",
      items,
      subtotal: Math.round(subtotal),
      gstRate: effectiveGstRate,
      gst,
      totalOrderValue: Math.round(total),
      amountPaid: Math.round(effectivePaid),
      paymentMode,
    };

    setSaving(true);
    try {
      const res = await createOrder(payload);
      setLastOrder(res.order);
      setShowInvoice(true);
    } catch (err) {
      setError(err?.message || "Failed to save order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintInvoice = () => {
    const order = lastOrder;
    const invoiceItems =
      order?.items && order.items.length > 0
        ? order.items
        : cart.map((i) => ({
            name: i.product?.name || "Item",
            qty: i.qty,
            price: Number(i.product?.price) || 0,
            amount: (Number(i.product?.price) || 0) * i.qty,
          }));

    const invoiceSubtotal = order?.subtotal ?? subtotal;
    const invoiceGst = order?.gst ?? gst;
    const invoiceTotal = order?.totalOrderValue ?? total;
    const invoicePaid = order?.amountPaid ?? (paidValue > 0 ? paidValue : total);
    const invoiceDue = order?.balanceDue ?? Math.max(0, invoiceTotal - invoicePaid);
    const invoiceNo = order?.invoiceNo || "INV-001";
    const dateStr = order?.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");
    const status = order?.status || (invoicePaid >= invoiceTotal ? "Paid" : invoicePaid > 0 ? "Partial" : "Due");

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
      status === "Paid" ? "#dcfce7" : status === "Partial" ? "#fef9c3" : "#fee2e2";
    const statusColor =
      status === "Paid" ? "#15803d" : status === "Partial" ? "#a16207" : "#b91c1c";

    const activeBiz = (() => {
      try {
        const rawUser = localStorage.getItem("smartbill_user");
        const u = rawUser ? JSON.parse(rawUser) : {};
        const id = u?._id || u?.id;
        const key = id ? `businessInfo_${id}` : "businessInfo";
        const rawB = localStorage.getItem(key) || localStorage.getItem("businessInfo");
        const b = rawB ? JSON.parse(rawB) : {};
        return { ...u, ...b };
      } catch {
        return {};
      }
    })();

    const bName = activeBiz.businessName || "Smart Bill Business";
    const bTagline = activeBiz.tagline || "";
    const bAddress = [activeBiz.address, activeBiz.city, activeBiz.state, activeBiz.pincode].filter(Boolean).join(", ");
    const bGstin = activeBiz.gstin ? `GSTIN: ${activeBiz.gstin}` : "";
    const bPhone = activeBiz.phone ? `Ph: ${activeBiz.phone}` : "";

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
            .footer-note { margin-top: 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
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

            <div class="footer-note">
              Thank you for your business! Powered by SmartBill Pro
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

  if (showInvoice) {
    const order = lastOrder;
    const invoiceItems =
      order?.items && order.items.length > 0
        ? order.items
        : cart.map((i) => ({
            name: i.product?.name || "Item",
            qty: i.qty,
            price: Number(i.product?.price) || 0,
            amount: (Number(i.product?.price) || 0) * i.qty,
          }));

    const invoiceSubtotal = order?.subtotal ?? subtotal;
    const invoiceGst = order?.gst ?? gst;
    const invoiceTotal = order?.totalOrderValue ?? total;
    const invoicePaid = order?.amountPaid ?? (paidValue > 0 ? paidValue : total);
    const invoiceDue = order?.balanceDue ?? Math.max(0, invoiceTotal - invoicePaid);

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowInvoice(false);
              setCart([]);
              setAmountPaid("");
              setLastOrder(null);
            }}
          >
            ← Back to Billing
          </Btn>
          <div className="flex gap-2">
            <Btn
              variant="primary"
              size="sm"
              onClick={handlePrintInvoice}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Invoice
            </Btn>
            <Btn
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Btn>
          </div>
        </div>

        {/* Printable Invoice Document Card */}
        <Card id="printable-invoice" className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">SmartBill Pro</span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sharma Traders, Mumbai</p>
              <p className="text-xs font-mono text-slate-400">GSTIN: 27AAPCS0510Q1Z6</p>
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
                  label={order?.status || (invoicePaid >= invoiceTotal ? "Paid" : invoicePaid > 0 ? "Partial" : "Due")}
                  variant={
                    (order?.status || (invoicePaid >= invoiceTotal ? "Paid" : invoicePaid > 0 ? "Partial" : "Due")) === "Paid"
                      ? "green"
                      : (order?.status || (invoicePaid >= invoiceTotal ? "Paid" : invoicePaid > 0 ? "Partial" : "Due")) === "Partial"
                        ? "yellow"
                        : "red"
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-6 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Billed To</p>
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
                  <td className="py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{i.name}</td>
                  <td className="py-3 text-xs text-center font-mono font-medium text-slate-600 dark:text-slate-300">{i.qty}</td>
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
                <span className="font-mono font-medium">{fmt(invoiceSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>GST Tax</span>
                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">+{fmt(invoiceGst)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-base">{fmt(invoiceTotal)}</span>
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
                  className={`font-mono font-bold ${invoiceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                >
                  {fmt(invoiceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls (Hidden on Print) */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 no-print">
            <Btn
              variant="primary"
              onClick={handlePrintInvoice}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Invoice
            </Btn>
            <Btn
              variant="outline"
              onClick={handlePrintInvoice}
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
    <div className="flex gap-5 h-[calc(100vh-160px)]">
      {/* Left: Products */}
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
            icon={<RefreshCw className={`w-4 h-4 ${loadingProducts ? "animate-spin" : ""}`} />}
            className="ml-3"
          >
            Refresh
          </Btn>
        </div>
        {loadingProducts ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading products from database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
            <Package className="w-10 h-10 text-slate-300 mb-2" />
            <p className="font-medium text-slate-700">No products found</p>
            <p className="text-xs text-slate-400">Add products in the Products section to sell here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {filteredProducts.map((p, idx) => {
              const pId = getProductId(p) || idx;
              const isOut = (p.stock || 0) <= 0;
              return (
                <button
                  key={pId}
                  onClick={() => addToCart(p)}
                  disabled={isOut}
                  className={`bg-white border rounded-xl p-3 text-left transition-all group active:scale-[0.98] flex items-center gap-4 ${
                    isOut
                      ? "opacity-60 border-slate-200 cursor-not-allowed bg-slate-50"
                      : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{p.sku || "NO-SKU"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">
                      {fmt(p.price)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        isOut
                          ? "bg-red-50 text-red-500"
                          : p.stock < 10
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isOut ? "Out of Stock" : `Stock: ${p.stock}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Current Bill Sidebar */}
      <Card className="w-96 flex-shrink-0 flex flex-col h-full shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        {/* Header & Customer Selection */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
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
                onClick={() => setCart([])}
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
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all cursor-pointer"
            >
              <option value="Walk-in Customer">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

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
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-2.5 text-slate-400 dark:text-slate-500 shadow-inner">
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
              const itemId = item && item.product ? getProductId(item.product) || idx : idx;
              const prodName = item?.product?.name || "Item";
              const prodPrice = Number(item?.product?.price) || 0;
              return (
                <div
                  key={itemId}
                  className="bg-slate-50/90 dark:bg-slate-800/70 hover:bg-slate-100/90 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 transition-all shadow-2xs group"
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1 leading-snug">
                      {prodName}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(itemId)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQty(itemId, -1)}
                        className="w-5 h-5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 dark:text-white min-w-[20px] text-center font-mono">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(itemId, 1)}
                        className="w-5 h-5 rounded-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block font-medium">
                        @{fmt(prodPrice)}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {fmt(prodPrice * item.qty)}
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
              <span className="font-mono font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>GST</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">+{fmt(gst)}</span>
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
              <span className="font-mono text-sm">{fmt(paidValue - total)}</span>
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
            className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4 text-white" />
            <span>{saving ? "Saving..." : "Generate Invoice"}</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
