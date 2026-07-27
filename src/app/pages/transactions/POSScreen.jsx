import { useState } from "react";
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
import { posProducts, customers } from "../../data/mockData";
import { fmt } from "../../utils/format";
import { Badge, Btn, Card, Input, Select } from "../../components/common/ui";

export default function POSScreen() {
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
