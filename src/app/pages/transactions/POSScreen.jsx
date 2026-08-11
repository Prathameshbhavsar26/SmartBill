import { useEffect, useState } from "react";
import {
  BarChart2,
  Calculator,
  Download,
  Minus,
  Package,
  Plus,
  Printer,
  Receipt,
  ScanLine,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { posProducts } from "../../data/mockData";
import { fmt } from "../../utils/format";
import { Badge, Btn, Card, Input, Select } from "../../components/common/ui";
import { fetchCustomers } from "../../api/customerAPI";
import { createOrder } from "../../api/orderAPI";

export default function POSScreen() {
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [search, setSearch] = useState("");
  const [gstRate] = useState(18);
  const [showInvoice, setShowInvoice] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  // Load customers from the backend.
  useEffect(() => {
    fetchCustomers()
      .then((res) => setCustomers(res.customers || []))
      .catch(() => {
        // Fall back to empty list if backend is unreachable.
        setCustomers([]);
      });
  }, []);

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

  const paidValue = Number(amountPaid);
  const balanceDue = Number.isFinite(paidValue)
    ? Math.max(0, total - paidValue)
    : total;

  // Determine the selected customer object (for running totals display).
  const selectedCustomer =
    customer === "Walk-in Customer"
      ? null
      : customers.find((c) => c.name === customer);

  const handleGenerateInvoice = async () => {
    if (cart.length === 0) return;
    setError("");

    // Default amount paid to the full total if left blank.
    const effectivePaid = paidValue > 0 ? paidValue : total;

    const items = cart.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      sku: i.product.sku || "",
      price: i.product.price,
      qty: i.qty,
      discount: i.discount || 0,
      amount: i.product.price * i.qty,
    }));

    const payload = {
      customerId: selectedCustomer ? selectedCustomer._id : null,
      customerName: customer,
      customerEmail: selectedCustomer?.email || "",
      items,
      subtotal: Math.round(subtotal),
      gstRate,
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

  if (showInvoice) {
    const order = lastOrder;
    return (
      <div className="max-w-2xl mx-auto">
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowInvoice(false);
            setCart([]);
            setAmountPaid("");
            setLastOrder(null);
          }}
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
                {order?.invoiceNo || "INV"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Date:{" "}
                {order?.date
                  ? new Date(order.date).toLocaleDateString("en-IN")
                  : new Date().toLocaleDateString("en-IN")}
              </p>
              <div className="mt-1">
                <Badge
                  label={order?.status || "Paid"}
                  variant={
                    order?.status === "Paid"
                      ? "green"
                      : order?.status === "Partial"
                        ? "yellow"
                        : "red"
                  }
                />
              </div>
            </div>
          </div>



          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-1">Bill To:</p>
            <p className="font-semibold text-slate-900">
              {order?.customerName || customer}
            </p>
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
            <div className="w-56 space-y-2 text-sm">
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
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid</span>
                <span className="font-mono text-emerald-600">
                  {fmt(order?.amountPaid ?? paidValue)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Balance Due</span>
                <span
                  className={`font-mono ${(order?.balanceDue ?? balanceDue) > 0 ? "text-red-500" : "text-emerald-600"}`}
                >
                  {fmt(order?.balanceDue ?? balanceDue)}
                </span>
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
                setAmountPaid("");
                setLastOrder(null);
                setEmailStatus(null);
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

      {/* Right: Current Bill Sidebar (Zero Outer Scroll, All Fields Visible) */}
      <Card className="w-96 flex-shrink-0 flex flex-col h-full shadow-lg border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {/* Header & Customer Selection */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-none">
                  Current Bill
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {cart.length} {cart.length === 1 ? "item" : "items"} •{" "}
                  {cart.reduce((s, i) => s + i.qty, 0)} units
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-0.5 rounded transition-colors font-medium"
                title="Clear all items in cart"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Customer
            </label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2 space-y-1 text-[11px]">
              <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {selectedCustomer.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedCustomer.phone || "No phone"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center pt-0.5">
                <div className="bg-slate-50 dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 block uppercase">
                    Orders
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {fmt(selectedCustomer.totalOrderValue || 0)}
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-1 rounded border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block uppercase">
                    Paid
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {fmt(selectedCustomer.totalPaid || 0)}
                  </span>
                </div>
                <div className="bg-rose-50/50 dark:bg-rose-950/20 p-1 rounded border border-rose-100 dark:border-rose-900/30">
                  <span className="text-[9px] text-rose-600 dark:text-rose-400 block uppercase">
                    Due
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {fmt(Math.abs(selectedCustomer.balance || 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Item Scrollable List (Only Cart Items Scroll) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-2.5 space-y-1.5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                <ShoppingCart className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your cart is empty
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click products on the left to add items
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-2 transition-all"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">
                    {item.product.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 dark:text-white w-5 text-center font-mono">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-5 h-5 rounded bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      @{fmt(item.product.price)}
                    </span>
                    <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                      {fmt(item.product.price * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Financial Controls (Always 100% Visible Without Scrolling) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-2 flex-shrink-0">
          {/* Subtotal & Taxes Breakdown */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>Subtotal</span>
              <span className="font-mono">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>GST ({gstRate}%)</span>
              <span className="font-mono">+{fmt(gst)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-xs pt-1 border-t border-slate-100 dark:border-slate-700">
              <span>Order Total</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {fmt(total)}
              </span>
            </div>
          </div>

          {/* Amount Paid & Quick Presets */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Amount Paid
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAmountPaid(String(total))}
                  className="text-[9px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors"
                >
                  Exact
                </button>
                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountPaid(String(amt))}
                    className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors font-mono"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min={0}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={`Default: ${Math.round(total)}`}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Balance Due vs Change Return */}
          {paidValue > total ? (
            <div className="flex justify-between items-center text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
              <span>Change Return</span>
              <span className="font-mono">{fmt(paidValue - total)}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-2.5 py-1 text-rose-700 dark:text-rose-400">
              <span>Balance Due</span>
              <span className="font-mono">{fmt(balanceDue)}</span>
            </div>
          )}

          {/* Payment Mode Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["Cash", "UPI", "Card", "Bank Transfer", "Credit"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-2.5 py-1">
              {error}
            </p>
          )}

          {/* Generate Invoice Action */}
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={cart.length === 0 || saving}
            style={{
              backgroundColor: "var(--primary, #2563eb)",
              color: "#ffffff",
            }}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold shadow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Receipt className="w-4 h-4 text-white" />
            <span>{saving ? "Saving..." : "Generate Invoice"}</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
