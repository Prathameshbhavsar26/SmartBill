import { useState, useEffect, useCallback, useMemo } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchSuppliers } from "../../api/supplierAPI";
import { getProducts } from "../../api/productAPI";
import { createPurchase, fetchPurchases } from "../../api/purchaseAPI";
import { fmt } from "../../utils/format";
import {
  Btn,
  Card,
  Input,
  Select,
  Toast,
  statusBadge,
} from "../../components/common/ui";

const GST_OPTIONS = [0, 5, 12, 18, 28];
const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Cheque",
  "Other",
];

export default function PurchaseScreen() {
  const [productList, setProductList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");

  // Form states
  const [supplier, setSupplier] = useState("");
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState("");
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      product: "",
      qty: 1,
      unit: "pcs",
      rate: "",
      gstRate: 18,
      discount: 0,
      amount: 0,
      gstAmount: 0,
    },
  ]);

  const [searchHistory, setSearchHistory] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial data from APIs
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, suppRes, purchRes] = await Promise.allSettled([
        getProducts(),
        fetchSuppliers(),
        fetchPurchases(),
      ]);

      if (prodRes.status === "fulfilled") {
        setProductList(prodRes.value?.products || []);
      }
      if (suppRes.status === "fulfilled") {
        const raw = suppRes.value;
        const list = Array.isArray(raw?.suppliers)
          ? raw.suppliers
          : Array.isArray(raw)
            ? raw
            : [];
        setSupplierList(list);
        if (list.length > 0 && !supplier) {
          setSupplier(list[0].name);
        }
      }
      if (purchRes.status === "fulfilled") {
        setPurchaseList(purchRes.value?.purchases || []);
      }
    } catch (err) {
      console.error("Failed to load purchase page data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update item field and recalculate values
  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const next = { ...item, [field]: value };

        if (field === "product") {
          const selected = productList.find(
            (p) => p.name === value || (p._id || p.id) === value
          );
          if (selected) {
            next.productId = selected._id || selected.id;
            next.product = selected.name;
            next.unit = selected.unit || "pcs";
            next.rate =
              selected.cost !== undefined && selected.cost > 0
                ? selected.cost
                : selected.price || 0;
            next.gstRate = selected.gst !== undefined ? selected.gst : 18;
          }
        }

        const qty = Number(next.qty) || 0;
        const rate = Number(next.rate) || 0;
        const disc = Number(next.discount) || 0;
        const gstR = Number(next.gstRate) || 0;

        const baseAmount = Math.max(0, qty * rate - disc);
        const calculatedGst = baseAmount * (gstR / 100);

        next.amount = baseAmount;
        next.gstAmount = calculatedGst;

        return next;
      })
    );
  };

  // Selected products for duplicate prevention
  const selectedProductNames = useMemo(() => {
    return items.map((it) => it.product).filter(Boolean);
  }, [items]);

  // Real-time Payment Summary calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [items]);

  const totalGst = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.gstAmount) || 0), 0);
  }, [items]);

  const totalDiscount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return subtotal + totalGst;
  }, [subtotal, totalGst]);

  // Amount Paid & Remaining Amount calculations
  const { amountPaid, remainingAmount } = useMemo(() => {
    if (paymentStatus === "Paid") {
      return { amountPaid: totalAmount, remainingAmount: 0 };
    }
    if (paymentStatus === "Partially Paid") {
      const paidNum = Number(amountPaidInput) || 0;
      const remaining = Math.max(0, totalAmount - paidNum);
      return { amountPaid: paidNum, remainingAmount: remaining };
    }
    return { amountPaid: 0, remainingAmount: totalAmount };
  }, [paymentStatus, totalAmount, amountPaidInput]);

  // Add Item Row
  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        product: "",
        qty: 1,
        unit: "pcs",
        rate: "",
        gstRate: 18,
        discount: 0,
        amount: 0,
        gstAmount: 0,
      },
    ]);
  };

  // Remove Item Row
  const removeItemRow = (index) => {
    if (items.length <= 1) {
      showToast("At least one product item is required", "error");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    setSupplier(supplierList[0]?.name || "");
    setSupplierInvoiceNo("");
    setPurchaseOrderNo("");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setPaymentStatus("Unpaid");
    setPaymentMethod("Cash");
    setAmountPaidInput("");
    setNotes("");
    setItems([
      {
        productId: "",
        product: "",
        qty: 1,
        unit: "pcs",
        rate: "",
        gstRate: 18,
        discount: 0,
        amount: 0,
        gstAmount: 0,
      },
    ]);
  };

  // Save Purchase Handler
  const handleSavePurchase = async () => {
    if (saving) return;

    // Validation
    if (!supplier || !supplier.trim()) {
      showToast("Supplier selection is required", "error");
      return;
    }
    if (!purchaseDate) {
      showToast("Purchase date is required", "error");
      return;
    }

    const validItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product || item.product === "Select Product") {
        showToast(`Please select a product for row ${i + 1}`, "error");
        return;
      }
      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        showToast(`Quantity for product "${item.product}" must be greater than 0`, "error");
        return;
      }
      const rate = Number(item.rate);
      if (!Number.isFinite(rate) || rate < 0) {
        showToast(`Purchase rate for product "${item.product}" cannot be negative`, "error");
        return;
      }
      const disc = Number(item.discount || 0);
      if (disc < 0) {
        showToast(`Discount for product "${item.product}" cannot be negative`, "error");
        return;
      }
      if (disc > qty * rate) {
        showToast(`Discount for product "${item.product}" cannot exceed item amount`, "error");
        return;
      }

      validItems.push({
        productId: item.productId,
        productName: item.product,
        quantity: qty,
        unit: item.unit || "pcs",
        purchaseRate: rate,
        gstRate: Number(item.gstRate) || 0,
        gstAmount: item.gstAmount,
        discount: disc,
        itemAmount: item.amount,
      });
    }

    if (validItems.length === 0) {
      showToast("Please add at least one valid product", "error");
      return;
    }

    if (paymentStatus === "Partially Paid") {
      const paid = Number(amountPaidInput);
      if (!Number.isFinite(paid) || paid <= 0) {
        showToast("Amount paid must be greater than 0 for Partially Paid status", "error");
        return;
      }
      if (paid > totalAmount) {
        showToast("Amount paid cannot exceed total purchase amount", "error");
        return;
      }
    }

    const selectedSupplierObj = supplierList.find((s) => s.name === supplier);

    const payload = {
      supplierId: selectedSupplierObj?._id || selectedSupplierObj?.id || null,
      supplierName: supplier,
      supplierInvoiceNo,
      purchaseOrderNo,
      purchaseDate,
      dueDate: dueDate || null,
      items: validItems,
      subtotal,
      gstTotal: totalGst,
      discountTotal: totalDiscount,
      totalAmount,
      paymentStatus,
      paymentMethod: ["Paid", "Partially Paid"].includes(paymentStatus)
        ? paymentMethod
        : "Cash",
      amountPaid,
      remainingAmount,
      notes,
    };

    setSaving(true);
    try {
      await createPurchase(payload);
      showToast("Purchase saved and stock updated successfully!", "success");
      resetForm();
      await loadData();
      setActiveTab("history");
    } catch (err) {
      console.error("SAVE PURCHASE ERROR:", err);
      showToast(
        err.response?.data?.message || err.message || "Failed to save purchase",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Filtered purchases for History tab
  const filteredPurchases = useMemo(() => {
    return purchaseList.filter((purchase) => {
      const q = searchHistory.toLowerCase();
      const inv = (purchase.supplierInvoiceNo || purchase.invoiceNo || purchase._id || "").toLowerCase();
      const supp = (purchase.supplierName || purchase.supplier || "").toLowerCase();
      const po = (purchase.purchaseOrderNo || "").toLowerCase();
      return inv.includes(q) || supp.includes(q) || po.includes(q);
    });
  }, [purchaseList, searchHistory]);

  return (
    <div className="space-y-5">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          ["entry", "New Purchase"],
          ["history", "Purchase History"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setActiveTab(String(k))}
            className={`pb-3 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer ${
              activeTab === k
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {activeTab === "entry" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Purchase Details Card */}
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4 text-base">
                Purchase Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Supplier *"
                  value={supplier}
                  onChange={setSupplier}
                  options={supplierList.map((s) => s.name)}
                />
                <Input
                  label="Supplier Invoice No."
                  placeholder="SUPP-INV-001"
                  value={supplierInvoiceNo}
                  onChange={setSupplierInvoiceNo}
                />
                <Input
                  label="Purchase Order No. (Optional)"
                  placeholder="PO-2024-001"
                  value={purchaseOrderNo}
                  onChange={setPurchaseOrderNo}
                />
                <Input
                  label="Purchase Date *"
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

            {/* Products Section Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 text-base">
                  Products
                </h3>
                <span className="text-xs text-slate-500">
                  {items.length} item{items.length !== 1 ? "s" : ""} added
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="pb-2 min-w-[160px]">Product *</th>
                      <th className="pb-2 w-20 text-center">Qty *</th>
                      <th className="pb-2 w-20 text-center">Unit</th>
                      <th className="pb-2 w-28 text-right">Purchase Rate *</th>
                      <th className="pb-2 w-24 text-center">GST %</th>
                      <th className="pb-2 w-24 text-right">Discount</th>
                      <th className="pb-2 w-28 text-right">Amount</th>
                      <th className="pb-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        {/* Product Selection */}
                        <td className="py-2 pr-2">
                          <select
                            value={item.product}
                            onChange={(e) =>
                              updateItem(i, "product", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select Product</option>
                            {productList.map((p) => {
                              const pName = p.name;
                              const isTaken =
                                selectedProductNames.includes(pName) &&
                                item.product !== pName;
                              return (
                                <option
                                  key={p._id || p.id}
                                  value={pName}
                                  disabled={isTaken}
                                >
                                  {pName} {isTaken ? "(Already selected)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-1">
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
                                  : Number(e.target.value)
                              )
                            }
                            className="w-full text-center border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                          />
                        </td>

                        {/* Unit */}
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) =>
                              updateItem(i, "unit", e.target.value)
                            }
                            placeholder="pcs"
                            className="w-full text-center border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-slate-50/50"
                          />
                        </td>

                        {/* Purchase Rate */}
                        <td className="py-2 px-1">
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
                                  : Number(e.target.value)
                              )
                            }
                            placeholder="0"
                            className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                          />
                        </td>

                        {/* GST % */}
                        <td className="py-2 px-1">
                          <select
                            value={item.gstRate}
                            onChange={(e) =>
                              updateItem(i, "gstRate", Number(e.target.value))
                            }
                            className="w-full border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-center font-mono"
                          >
                            {GST_OPTIONS.map((g) => (
                              <option key={g} value={g}>
                                {g}%
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Discount */}
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(
                                i,
                                "discount",
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                            placeholder="0"
                            className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                          />
                        </td>

                        {/* Amount */}
                        <td className="py-2 pl-2 text-right font-mono font-semibold text-slate-900">
                          {fmt(item.amount)}
                        </td>

                        {/* Action */}
                        <td className="py-2 pl-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(i)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Btn
                  variant="outline"
                  size="sm"
                  onClick={addItemRow}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Row
                </Btn>
              </div>
            </Card>
          </div>

          {/* Payment Summary Right Column */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4 text-base">
                Payment Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmt(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>GST</span>
                  <span className="font-mono text-emerald-600">
                    + {fmt(totalGst)}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount</span>
                    <span className="font-mono text-amber-600">
                      - {fmt(totalDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-3 text-base">
                  <span>Total Amount</span>
                  <span className="font-mono">{fmt(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-4 pt-3 border-t border-slate-100">
                {/* Payment Status Dropdown */}
                <Select
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={setPaymentStatus}
                  options={["Unpaid", "Partially Paid", "Paid"]}
                />

                {/* Payment Method (Shown for Paid or Partially Paid) */}
                {["Paid", "Partially Paid"].includes(paymentStatus) && (
                  <Select
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={PAYMENT_METHODS}
                  />
                )}

                {/* Partially Paid Fields */}
                {paymentStatus === "Partially Paid" && (
                  <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Input
                      label="Amount Paid *"
                      type="number"
                      placeholder="0"
                      value={amountPaidInput}
                      onChange={setAmountPaidInput}
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-700 pt-1">
                      <span>Remaining Amount:</span>
                      <span className="font-mono text-red-600">
                        {fmt(remainingAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <Input
                  label="Notes (Optional)"
                  placeholder="Optional payment or purchase details"
                  value={notes}
                  onChange={setNotes}
                />

                {/* Save Purchase Button */}
                <Btn
                  variant="primary"
                  className="w-full justify-center mt-2 py-2.5"
                  onClick={handleSavePurchase}
                  disabled={saving}
                  icon={
                    saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )
                  }
                >
                  {saving ? "Saving Purchase..." : "Save Purchase"}
                </Btn>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Purchase History Tab */
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <Input
              value={searchHistory}
              onChange={setSearchHistory}
              placeholder="Search purchases by supplier, invoice no, or PO no..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No purchase records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    <th className="px-5 py-3.5">Supplier</th>
                    <th className="px-5 py-3.5">Invoice / PO No.</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Items</th>
                    <th className="px-5 py-3.5">Subtotal</th>
                    <th className="px-5 py-3.5">GST</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPurchases.map((purchase) => {
                    const suppName = purchase.supplierName || purchase.supplier || "Supplier";
                    const invNo = purchase.supplierInvoiceNo || purchase.invoiceNo || purchase.id || "-";
                    const poNo = purchase.purchaseOrderNo ? ` (${purchase.purchaseOrderNo})` : "";
                    const dateStr = purchase.purchaseDate
                      ? new Date(purchase.purchaseDate).toISOString().slice(0, 10)
                      : purchase.date || "-";
                    const itemCount = Array.isArray(purchase.items)
                      ? purchase.items.length
                      : purchase.items || 0;
                    const remAmt = purchase.remainingAmount !== undefined ? purchase.remainingAmount : 0;

                    return (
                      <tr
                        key={purchase._id || purchase.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {suppName}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-blue-600">
                          {invNo}
                          {poNo && <span className="text-slate-400">{poNo}</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                          {dateStr}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">
                          {fmt(purchase.subtotal || 0)}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          {fmt(purchase.gstTotal || purchase.gst || 0)}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">
                          {fmt(purchase.totalAmount || purchase.total || 0)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              purchase.paymentStatus === "Paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : purchase.paymentStatus === "Partially Paid"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {purchase.paymentStatus || "Unpaid"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                          {remAmt > 0 ? (
                            <span className="text-red-600">{fmt(remAmt)}</span>
                          ) : (
                            <span className="text-emerald-600">Cleared</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
