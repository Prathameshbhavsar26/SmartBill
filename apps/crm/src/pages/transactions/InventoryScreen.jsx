import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  ChevronDown,
  DollarSign,
  Download,
  FileSpreadsheet,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  SlidersHorizontal,
  Upload,
  XCircle,
  History,
  CheckCircle2,
} from "lucide-react";
import { fmt, pluralize } from "@shared/utils/format";
import {
  Badge,
  Btn,
  Card,
  StatCard,
  Toast,
  Modal,
  Input,
  Select,
  statusBadge,
  StatCardSkeleton,
  TableSkeleton,
  ErrorState,
} from "@shared/components/common/ui";
import { getProducts, adjustProductStock } from "@shared/api/productAPI";
import { exportToCsv, exportToExcel } from "@shared/utils/csvHelper";

export default function InventoryScreen({ onNav }) {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Stock Adjustment Modal state
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState("Add"); // "Add", "Reduce", "Set Exact"
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("Physical Audit Discrepancy");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [globalThreshold, setGlobalThreshold] = useState(() => {
    try {
      const stored = localStorage.getItem("smartbill_inventorySettings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lowStockAlert) return Number(parsed.lowStockAlert);
      }
    } catch (_) {}
    return 10;
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      try {
        const stored = localStorage.getItem("smartbill_inventorySettings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.lowStockAlert !== undefined) {
            setGlobalThreshold(Number(parsed.lowStockAlert) || 10);
          }
        }
      } catch (_) {}

      const res = await getProducts();
      setProductList(res.products || []);
    } catch (err) {
      setError(err?.message || "Failed to fetch inventory products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    const handleUpdate = (e) => {
      if (e?.detail?.lowStockAlert !== undefined) {
        setGlobalThreshold(Number(e.detail.lowStockAlert) || 10);
      }
      loadProducts();
    };

    window.addEventListener("inventorySettingsUpdated", handleUpdate);
    window.addEventListener("stockUpdated", handleUpdate);
    window.addEventListener("productUpdated", handleUpdate);
    window.addEventListener("orderCreated", handleUpdate);
    window.addEventListener("purchaseCreated", handleUpdate);

    return () => {
      window.removeEventListener("inventorySettingsUpdated", handleUpdate);
      window.removeEventListener("stockUpdated", handleUpdate);
      window.removeEventListener("productUpdated", handleUpdate);
      window.removeEventListener("orderCreated", handleUpdate);
      window.removeEventListener("purchaseCreated", handleUpdate);
    };
  }, [loadProducts]);

  const handleOpenAdjustment = (product) => {
    setSelectedProductForAdjustment(product);
    setAdjustmentType("Add");
    setAdjustmentQuantity("");
    setAdjustmentReason("Physical Audit Discrepancy");
    setAdjustmentNotes("");
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProductForAdjustment) return;

    const qty = Number(adjustmentQuantity);
    if (!Number.isFinite(qty) || (adjustmentType !== "Set Exact" && qty <= 0)) {
      showToast("Please enter a valid adjustment quantity.", "error");
      return;
    }

    setAdjusting(true);
    try {
      const prodId = selectedProductForAdjustment._id || selectedProductForAdjustment.id;
      const res = await adjustProductStock(prodId, {
        adjustmentType,
        quantity: qty,
        reason: adjustmentReason,
        notes: adjustmentNotes,
      });

      showToast(res.message || "Stock adjusted successfully!", "success");
      setSelectedProductForAdjustment(null);
      loadProducts();
    } catch (err) {
      showToast(err?.response?.data?.message || err.message || "Failed to adjust stock.", "error");
    } finally {
      setAdjusting(false);
    }
  };

  const totalProducts = productList.length;
  const totalStockValue = productList.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
    0
  );

  const getEffectiveMinStock = (p) => {
    return p.minStock !== undefined && p.minStock !== null && p.minStock !== ""
      ? Number(p.minStock)
      : globalThreshold;
  };

  const lowStockItems = productList.filter(
    (p) => Number(p.stock || 0) <= getEffectiveMinStock(p) && Number(p.stock || 0) > 0
  );
  const outOfStockItems = productList.filter(
    (p) => Number(p.stock || 0) === 0
  );
  const allAlertItems = productList.filter(
    (p) => Number(p.stock || 0) <= getEffectiveMinStock(p)
  );

  const categoriesCount = new Set(productList.map((p) => p.category)).size;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Products"
            value={String(totalProducts)}
            sub={`Across ${pluralize(categoriesCount || 1, "category", "categories")}`}
            trend="neutral"
            icon={<Package className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          />
          <StatCard
            label="Total Stock Value"
            value={fmt(totalStockValue)}
            sub="Live inventory value"
            trend="up"
            icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          />
          <StatCard
            label="Low Stock Items"
            value={String(lowStockItems.length)}
            sub="Action required"
            trend={lowStockItems.length > 0 ? "down" : "neutral"}
            icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          />
          <StatCard
            label="Out of Stock"
            value={String(outOfStockItems.length)}
            sub="Reorder pending"
            trend={outOfStockItems.length > 0 ? "down" : "neutral"}
            icon={<XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
            color="bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400"
          />
        </div>
      )}

      {/* Low Stock Alerts */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-foreground mb-0.5 text-sm sm:text-base">Low Stock Alerts</h3>
            <p className="text-xs text-muted-foreground">
              Items that need immediate reordering
            </p>
          </div>
          <Btn
            variant="outline"
            size="sm"
            onClick={loadProducts}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            className="w-full sm:w-auto justify-center"
          >
            Refresh
          </Btn>
        </div>

        {loading ? (
          <div className="py-4">
            <TableSkeleton rows={2} columns={4} />
          </div>
        ) : allAlertItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs sm:text-sm bg-muted/20 rounded-xl border border-dashed border-border">
            All items are well stocked! No low stock alerts.
          </div>
        ) : (
          <div className="space-y-3">
            {allAlertItems.map((p) => (
              <div
                key={p._id || p.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border ${
                  p.stock === 0
                    ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20"
                    : "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0 ${
                      p.stock === 0 ? "text-red-500" : "text-amber-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
                  <div className="text-left sm:text-right">
                    <p
                      className={`text-sm font-bold font-mono ${
                        p.stock === 0 ? "text-red-500" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Min: {getEffectiveMinStock(p)}</p>
                  </div>
                  <Btn
                    variant={p.stock === 0 ? "danger" : "outline"}
                    size="sm"
                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (onNav) {
                        localStorage.setItem("reorderProduct", JSON.stringify({ name: p.name, minStock: p.minStock }));
                        onNav("purchase");
                      }
                    }}
                  >
                    Reorder
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Current Stock Section */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Current Stock</h3>
            <p className="text-xs text-muted-foreground">Live quantity, valuation, and stock health</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Export Inventory Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <Btn
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                icon={<Download className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto justify-center"
              >
                Export Stock
                <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
              </Btn>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-card rounded-xl shadow-xl border border-border py-1.5 z-30">
                  <button
                    onClick={() => {
                      const columns = [
                        { key: "name", label: "Product Name" },
                        { key: "sku", label: "SKU / Barcode" },
                        { key: "category", label: "Category" },
                        { key: "stock", label: "Current Stock" },
                        { key: "unit", label: "Unit" },
                        { key: "minStock", label: "Min Stock Level" },
                        { key: "cost", label: "Purchase Cost (₹)" },
                        { key: "price", label: "Selling Price (₹)" },
                        {
                          key: "stockValue",
                          label: "Total Value (₹)",
                          accessor: (r) => (Number(r.price || 0) * Number(r.stock || 0)).toFixed(2),
                        },
                        { key: "status", label: "Status" },
                      ];
                      exportToExcel("SmartBill_Inventory_Stock.xlsx", "Current Stock", columns, productList);
                      showToast(`Exported stock for ${productList.length} items to Excel!`, "success");
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => {
                      const columns = [
                        { key: "name", label: "Product Name" },
                        { key: "sku", label: "SKU / Barcode" },
                        { key: "category", label: "Category" },
                        { key: "stock", label: "Current Stock" },
                        { key: "unit", label: "Unit" },
                        { key: "minStock", label: "Min Stock Level" },
                        { key: "cost", label: "Purchase Cost (₹)" },
                        { key: "price", label: "Selling Price (₹)" },
                        {
                          key: "stockValue",
                          label: "Total Value (₹)",
                          accessor: (r) => (Number(r.price || 0) * Number(r.stock || 0)).toFixed(2),
                        },
                        { key: "status", label: "Status" },
                      ];
                      exportToCsv("SmartBill_Inventory_Stock.csv", columns, productList);
                      showToast(`Exported stock for ${productList.length} items to CSV!`, "success");
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    CSV (.csv)
                  </button>
                </div>
              )}
            </div>

            {onNav && (
              <Btn
                variant="primary"
                size="sm"
                onClick={() => onNav("products")}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="flex-1 sm:flex-initial justify-center"
              >
                Add Product
              </Btn>
            )}
            <Btn
              variant="outline"
              size="sm"
              onClick={loadProducts}
              disabled={loading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
            >
              <span className="hidden sm:inline">Refresh</span>
            </Btn>
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadProducts} />
          </div>
        ) : loading ? (
          <div className="p-4">
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : productList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm space-y-3">
            <p>No products found in your inventory.</p>
            {onNav && (
              <Btn
                variant="primary"
                size="sm"
                onClick={() => onNav("products")}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                + Add First Product
              </Btn>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    {[
                      "Product",
                      "Category",
                      "In Stock",
                      "Min Level",
                      "Value",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-5 py-3 ${
                          h === "Actions" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {productList.map((p) => {
                    const effMin = getEffectiveMinStock(p);
                    return (
                      <tr key={p._id || p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge label={p.category || "General"} variant="blue" />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold font-mono ${
                                p.stock === 0
                                  ? "text-red-500"
                                  : p.stock <= effMin
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-foreground"
                              }`}
                            >
                              {p.stock}
                            </span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, (p.stock / Math.max(1, effMin * 3)) * 100)}%`,
                                  backgroundColor:
                                    p.stock === 0
                                      ? "#EF4444"
                                      : p.stock <= effMin
                                      ? "#F59E0B"
                                      : "#10B981",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground font-mono">
                          {p.minStock !== undefined && p.minStock !== null && p.minStock !== "" ? p.minStock : `${globalThreshold} (global)`}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-foreground font-mono">
                          {fmt((p.price || 0) * (p.stock || 0))}
                        </td>
                        <td className="px-5 py-3.5">
                          {statusBadge(p.stock === 0 ? "Inactive" : p.status || "Active")}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <Btn
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAdjustment(p)}
                            icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                            className="text-xs py-1 px-2.5"
                          >
                            Adjust Stock
                          </Btn>
                          <Btn
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (onNav) {
                                localStorage.setItem(
                                  "reorderProduct",
                                  JSON.stringify({ name: p.name, minStock: p.minStock })
                                );
                                onNav("purchase");
                              }
                            }}
                            icon={<ShoppingCart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                            className="text-xs py-1 px-2.5 text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100"
                          >
                            Inward
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (hidden on desktop) */}
            <div className="md:hidden divide-y divide-border/60">
              {productList.map((p) => {
                const prodId = p._id || p.id;
                const effMin = getEffectiveMinStock(p);
                const isOutOfStock = Number(p.stock || 0) === 0;
                const isLowStock = Number(p.stock || 0) <= effMin && !isOutOfStock;

                return (
                  <div key={prodId || Math.random()} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {p.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-mono text-muted-foreground">{p.sku || "No SKU"}</span>
                          <Badge label={p.category || "General"} variant="blue" />
                          {statusBadge(isOutOfStock ? "Inactive" : p.status || "Active")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-muted-foreground uppercase font-semibold">Stock Value</div>
                        <div className="font-mono font-bold text-sm text-foreground">
                          {fmt((p.price || 0) * (p.stock || 0))}
                        </div>
                      </div>
                    </div>

                    {/* Stock level bar & details */}
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">In Stock:</span>
                        <span
                          className={`font-bold font-mono ${
                            isOutOfStock
                              ? "text-red-500"
                              : isLowStock
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {p.stock || 0} {p.unit || "units"} {isOutOfStock ? "(Out)" : isLowStock ? "(Low)" : ""}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((p.stock || 0) / Math.max(1, effMin * 3)) * 100)}%`,
                            backgroundColor: isOutOfStock
                              ? "#EF4444"
                              : isLowStock
                              ? "#F59E0B"
                              : "#10B981",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Min Threshold: {effMin}</span>
                        <span>Price: {fmt(p.price || 0)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAdjustment(p)}
                        className="flex-1 min-h-[38px] flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        <span>Adjust Stock</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onNav) {
                            localStorage.setItem(
                              "reorderProduct",
                              JSON.stringify({ name: p.name, minStock: p.minStock })
                            );
                            onNav("purchase");
                          }
                        }}
                        className="flex-1 min-h-[38px] flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 text-xs font-medium text-blue-700 dark:text-blue-400 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Inward</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer info */}
        {!loading && productList.length > 0 && (
          <div className="px-4 sm:px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {pluralize(productList.length, "product")}</span>
            <span className="font-mono font-medium text-foreground">
              Total Value: {fmt(totalStockValue)}
            </span>
          </div>
        )}
      </Card>

      {/* Stock Adjustment Modal */}
      {selectedProductForAdjustment && (
        <Modal
          title={`Adjust Stock — ${selectedProductForAdjustment.name}`}
          onClose={() => setSelectedProductForAdjustment(null)}
          size="md"
        >
          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            <div className="bg-muted/40 p-3.5 rounded-xl border border-border flex justify-between items-center text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Current Stock in System</p>
                <p className="text-lg font-bold text-foreground font-mono">
                  {selectedProductForAdjustment.stock} {selectedProductForAdjustment.unit || "units"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">SKU / Code</p>
                <p className="font-mono text-foreground text-xs font-semibold">
                  {selectedProductForAdjustment.sku}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { type: "Add", label: "+ Add Stock", desc: "Found / Surplus" },
                { type: "Reduce", label: "- Reduce Stock", desc: "Damage / Loss" },
                { type: "Set Exact", label: "= Exact Count", desc: "Physical Audit" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.type}
                  onClick={() => setAdjustmentType(m.type)}
                  className={`p-2.5 text-center rounded-xl border transition-all ${
                    adjustmentType === m.type
                      ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold shadow-sm"
                      : "border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <p className="text-xs font-semibold">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {adjustmentType === "Set Exact" ? "New Exact Physical Quantity *" : "Adjustment Quantity *"}
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                required
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder={adjustmentType === "Set Exact" ? "e.g. 50" : "e.g. 5"}
                className="w-full font-mono text-base"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Reason for Adjustment
              </label>
              <Select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full"
              >
                <option value="Physical Audit Discrepancy">Physical Audit Discrepancy</option>
                <option value="Damaged / Broken Goods">Damaged / Broken Goods</option>
                <option value="Expired Batch / Scrap">Expired Batch / Scrap</option>
                <option value="Theft / Lost Items">Theft / Lost Items</option>
                <option value="Internal Consumption / Sample">Internal Consumption / Sample</option>
                <option value="Opening Stock Correction">Opening Stock Correction</option>
                <option value="Other">Other Adjustment</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Remarks / Audit Notes (Optional)
              </label>
              <Input
                type="text"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="e.g. Verified by Store Manager"
                className="w-full text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Btn
                type="button"
                variant="outline"
                onClick={() => setSelectedProductForAdjustment(null)}
                disabled={adjusting}
              >
                Cancel
              </Btn>
              <Btn
                type="submit"
                variant="primary"
                disabled={adjusting || !adjustmentQuantity}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {adjusting ? "Updating..." : "Save Stock Adjustment"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

