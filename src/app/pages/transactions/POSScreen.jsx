import { useEffect, useState } from "react";
import {
  BarChart2,
  Calculator,
  Download,
  Mail,
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
  const [emailStatus, setEmailStatus] = useState(null);

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
    setEmailStatus(null);

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
      setEmailStatus({
        sent: res.emailSent,
        message: res.emailMessage || "",
      });
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
            setEmailStatus(null);
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

          {emailStatus && (
            <div
              className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                emailStatus.sent
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
              }`}
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>
                {emailStatus.sent
                  ? "Invoice emailed successfully to the customer."
                  : `Invoice email not sent: ${emailStatus.message}`}
              </span>
            </div>
          )}

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

      {/* Right: Cart */}
      <Card className="w-80 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-3">Current Bill</h3>
          <Select
            label="Customer"
            value={customer}
            onChange={setCustomer}
            options={[
              "Walk-in Customer",
              ...customers.map((c) => c.name),
            ]}
          />
          {selectedCustomer && (
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Orders</span>
                <span className="font-mono font-semibold text-slate-900">
                  {fmt(selectedCustomer.totalOrderValue || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {fmt(selectedCustomer.totalPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance Due</span>
                <span
                  className={`font-mono font-semibold ${(selectedCustomer.balance || 0) > 0 ? "text-red-500" : "text-slate-900"}`}
                >
                  {fmt(Math.abs(selectedCustomer.balance || 0))}
                </span>
              </div>
            </div>
          )}
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
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Amount Paid (₹)
            </label>
            <input
              type="number"
              min={0}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={String(Math.round(total))}
              className="w-full border border-slate-200 rounded-lg bg-white text-sm text-slate-900 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1.5"
            />
          </div>
          <div className="flex justify-between text-sm font-semibold bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <span className="text-red-600">Balance Due</span>
            <span className="font-mono text-red-600">
              {fmt(balanceDue)}
            </span>
          </div>
          <Select
            label="Payment Mode"
            value={paymentMode}
            onChange={setPaymentMode}
            options={["Cash", "UPI", "Card", "Bank Transfer", "Credit"]}
          />
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Btn
            variant="success"
            onClick={handleGenerateInvoice}
            disabled={cart.length === 0 || saving}
            className="w-full justify-center"
            icon={<Receipt className="w-4 h-4" />}
          >
            {saving ? "Saving..." : "Generate Invoice"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
