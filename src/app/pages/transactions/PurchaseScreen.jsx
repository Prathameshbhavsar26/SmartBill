import { useState } from "react";
import {
  Check,
  Download,
  Edit2,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import { products, suppliers } from "../../data/mockData";
import { fmt } from "../../utils/format";
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
} from "../../components/common/ui";

export default function PurchaseScreen() {
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
          const selectedProduct = products.find((p) => p.name === value);

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
