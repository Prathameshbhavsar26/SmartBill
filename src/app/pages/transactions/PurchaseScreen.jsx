import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Check,
  Plus,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  createPurchase,
  fetchPurchases,
  markPurchaseAsPaid,
} from "../../api/purchaseAPI";
import { getProducts } from "../../api/productAPI";
import { fetchSuppliers } from "../../api/supplierAPI";
import { fmt } from "../../utils/format";
import { Toast, StepperInput } from "../../components/common/ui";

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
  const [activeTab, setActiveTab] = useState("entry"); // "entry" | "history"

  // Form states
  const [supplier, setSupplier] = useState("");
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState("");
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [purchasePaymentMethods, setPurchasePaymentMethods] = useState(() => {
    try {
      const stored = localStorage.getItem("smartbill_payment_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.purchase) && parsed.purchase.length > 0) {
          return parsed.purchase;
        }
      }
    } catch (_) {}
    return ["Cash", "Bank Transfer", "Cheque / DD", "Credit / Debit Card", "UPI & QR Code"];
  });

  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem("smartbill_payment_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.purchase) && parsed.purchase.length > 0) {
            setPurchasePaymentMethods(parsed.purchase);
          }
        }
      } catch (_) {}
    };
    window.addEventListener("paymentSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("paymentSettingsUpdated", handleUpdate);
  }, []);

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
  const [filterMonth, setFilterMonth] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
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

  // Handle reorder auto-fill from Inventory
  useEffect(() => {
    const reorderData = localStorage.getItem("reorderProduct");
    if (reorderData && productList.length > 0) {
      try {
        const p = JSON.parse(reorderData);
        const selectedProduct = productList.find((prod) => prod.name === p.name);

        if (selectedProduct) {
          const qty = p.minStock || 10;
          const rate =
            selectedProduct.cost !== undefined && selectedProduct.cost > 0
              ? selectedProduct.cost
              : selectedProduct.price || 0;
          const gstRate =
            selectedProduct.gst !== undefined ? selectedProduct.gst : 18;
          const amount = qty * rate;
          const gstAmount = amount * (gstRate / 100);

          setItems([
            {
              productId: selectedProduct._id || selectedProduct.id || "",
              product: selectedProduct.name,
              qty: qty,
              unit: selectedProduct.unit || "pcs",
              rate: rate,
              gstRate: gstRate,
              discount: 0,
              amount: amount,
              gstAmount: gstAmount,
            },
          ]);
          localStorage.removeItem("reorderProduct");
        }
      } catch (err) {
        console.error("Failed to parse reorder product", err);
      }
    }
  }, [productList]);

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

  const selectedProductNames = useMemo(() => {
    return items.map((it) => it.product).filter(Boolean);
  }, [items]);

  // Payment Summary calculations
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

  const removeItemRow = (index) => {
    if (items.length <= 1) {
      showToast("At least one product row is required", "error");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

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


const handleMarkAsPaid = async (purchaseId) => {
  if (!purchaseId) return;

  const confirmed = window.confirm(
    "Are you sure you want to mark this purchase as paid?"
  );

  if (!confirmed) return;

  try {
    const response = await markPurchaseAsPaid(purchaseId);

    const updatedPurchase = response?.purchase;

    setPurchaseList((prev) =>
      prev.map((purchase) =>
        (purchase._id || purchase.id) === purchaseId
          ? updatedPurchase || {
              ...purchase,
              paymentStatus: "Paid",
              amountPaid: purchase.totalAmount || 0,
              remainingAmount: 0,
            }
          : purchase
      )
    );

    showToast("Purchase marked as paid successfully!", "success");
  } catch (err) {
    console.error("MARK PURCHASE AS PAID ERROR:", err);
    showToast(
      err.response?.data?.message ||
        err.message ||
        "Failed to mark purchase as paid",
      "error"
    );
  }
};


  const handleSavePurchase = async () => {
    if (!supplier) {
      showToast("Please select a supplier", "error");
      return;
    }
    if (!purchaseDate) {
      showToast("Please select a purchase date", "error");
      return;
    }

    const validItems = [];
    for (const item of items) {
      if (!item.product) {
        showToast("Please select a product for all rows", "error");
        return;
      }
      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        showToast(
          `Quantity for "${item.product}" must be greater than 0`,
          "error"
        );
        return;
      }
      const rate = Number(item.rate);
      if (!Number.isFinite(rate) || rate < 0) {
        showToast(
          `Purchase rate for "${item.product}" cannot be negative`,
          "error"
        );
        return;
      }
      const disc = Number(item.discount || 0);
      if (disc < 0) {
        showToast(
          `Discount for "${item.product}" cannot be negative`,
          "error"
        );
        return;
      }
      if (disc > qty * rate) {
        showToast(
          `Discount for "${item.product}" cannot exceed total item price`,
          "error"
        );
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
      showToast("Please add at least one product", "error");
      return;
    }

    if (paymentStatus === "Partially Paid") {
      const paid = Number(amountPaidInput);
      if (!Number.isFinite(paid) || paid <= 0) {
        showToast(
          "Enter amount paid for Partially Paid status",
          "error"
        );
        return;
      }
      if (paid > totalAmount) {
        showToast(
          "Amount paid cannot exceed total purchase amount",
          "error"
        );
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
      showToast("Purchase saved successfully!", "success");
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
      const inv = (
        purchase.supplierInvoiceNo ||
        purchase.invoiceNo ||
        purchase._id ||
        ""
      ).toLowerCase();
      const supp = (
        purchase.supplierName ||
        purchase.supplier ||
        ""
      ).toLowerCase();
      const po = (purchase.purchaseOrderNo || "").toLowerCase();
      
      const searchMatch = inv.includes(q) || supp.includes(q) || po.includes(q);
      
      let dateMatch = true;
      if (filterMonth) {
        const pDate = purchase.purchaseDate || purchase.date || "";
        dateMatch = pDate.startsWith(filterMonth);
      }
      
      return searchMatch && dateMatch;
    });
  }, [purchaseList, searchHistory, filterMonth]);

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Page Header & Simple Tabs ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("entry")}
            className={`pb-2.5 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-[9px] ${
              activeTab === "entry"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            New Purchase
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-[9px] flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>Purchase History</span>
            <span className="text-xs px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {purchaseList.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "entry" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left Column: Details & Items ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Purchase Details Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-4">
                Purchase Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    {supplierList.map((s) => (
                      <option key={s._id || s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier Invoice No */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Invoice No.
                  </label>
                  <input
                    type="text"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Purchase Order No */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Order No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={purchaseOrderNo}
                    onChange={(e) => setPurchaseOrderNo(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Due Date */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Products
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="pb-2 min-w-[160px]">Product *</th>
                      <th className="pb-2 w-16 text-center">Qty *</th>

                      <th className="pb-2 w-24 text-right">Rate *</th>
                      <th className="pb-2 w-20 text-center">GST %</th>
                      <th className="pb-2 w-20 text-right">Discount</th>
                      <th className="pb-2 w-24 text-right">Amount</th>
                      <th className="pb-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        {/* Product */}
                        <td className="py-2.5 pr-2">
                          <select
                            value={item.product}
                            onChange={(e) =>
                              updateItem(i, "product", e.target.value)
                            }
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
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
                                  {pName} {isTaken ? "(Selected)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </td>

                        {/* Qty */}
                        <td className="py-2.5 px-1">
                          <StepperInput
                            min={1}
                            value={item.qty}
                            onChange={(val) => updateItem(i, "qty", val)}
                            inputClassName="w-12 py-1.5 font-mono"
                          />
                        </td>



                        {/* Rate */}
                        <td className="py-2.5 px-1">
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
                            className="w-full text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                          />
                        </td>

                        {/* GST % */}
                        <td className="py-2.5 px-1">
                          <select
                            value={item.gstRate}
                            onChange={(e) =>
                              updateItem(i, "gstRate", Number(e.target.value))
                            }
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 text-center font-mono"
                          >
                            {GST_OPTIONS.map((g) => (
                              <option key={g} value={g}>
                                {g}%
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Discount */}
                        <td className="py-2.5 px-1">
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
                            className="w-full text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-mono"
                          />
                        </td>

                        {/* Amount */}
                        <td className="py-2.5 pl-2 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {fmt(item.amount)}
                        </td>

                        {/* Delete */}
                        <td className="py-2.5 pl-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(i)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
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

              {/* Add Row */}
              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product Row</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column: Payment Summary ── */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-4">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-medium">
                    {fmt(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    + {fmt(totalGst)}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Discount</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                      - {fmt(totalDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {fmt(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Payment Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                {/* Payment Mode */}
                {["Paid", "Partially Paid"].includes(paymentStatus) && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    >
                      {(purchasePaymentMethods.length > 0
                        ? purchasePaymentMethods
                        : ["Cash", "Bank Transfer", "Cheque / DD", "Credit / Debit Card"]
                      ).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Partially Paid Section */}
                {paymentStatus === "Partially Paid" && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-between text-xs font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Remaining:</span>
                      <span className="font-mono text-red-600 dark:text-red-400">
                        {fmt(remainingAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSavePurchase}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Purchase History Tab ── */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* Search bar & Filter */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Search invoice or supplier..."
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter By Month:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth("")}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No purchase records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Invoice / PO No.</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">GST</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Remaining Due</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPurchases.map((purchase) => {
                    const suppName =
                      purchase.supplierName || purchase.supplier || "Supplier";
                    const invNo =
                      purchase.supplierInvoiceNo ||
                      purchase.invoiceNo ||
                      purchase._id ||
                      "-";
                    const poNo = purchase.purchaseOrderNo
                      ? ` (${purchase.purchaseOrderNo})`
                      : "";
                    const dateStr = purchase.purchaseDate
                      ? new Date(purchase.purchaseDate)
                          .toISOString()
                          .slice(0, 10)
                      : purchase.date || "-";
                    const itemCount = Array.isArray(purchase.items)
                      ? purchase.items.length
                      : purchase.items || 0;
                    const remAmt =
                      purchase.remainingAmount !== undefined
                        ? purchase.remainingAmount
                        : 0;

                    return (
                      <tr
                        key={purchase._id || purchase.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          {suppName}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">
                          {invNo}
                          {poNo && (
                            <span className="text-slate-400 ml-1">{poNo}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300 text-right">
                          {fmt(purchase.subtotal || 0)}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 text-right">
                          {fmt(purchase.gstTotal || purchase.gst || 0)}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white font-mono text-right">
                          {fmt(purchase.totalAmount || purchase.total || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                              purchase.paymentStatus === "Paid"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : purchase.paymentStatus === "Partially Paid"
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                            }`}
                          >
                            {purchase.paymentStatus || "Unpaid"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-right">
                          {remAmt > 0 ? (
                            <span className="text-red-600 dark:text-red-400">
                              {fmt(remAmt)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Cleared
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
  {purchase.paymentStatus !== "Paid" ? (
    <button
      type="button"
      onClick={() => handleMarkAsPaid(purchase._id || purchase.id)}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
      title="Mark purchase as paid"
    >
      <Check className="w-3 h-3" />
      Mark as Paid
    </button>
  ) : (
    <span className="text-xs text-slate-400 dark:text-slate-500">
      —
    </span>
  )}
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
