import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Download,
  Edit2,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { suppliers } from "../../data/mockData";
import { fmt } from "../../utils/format";
import {
  Badge,
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
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productAPI";

export default function ProductsScreen() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [catFilter, setCatFilter] = useState("All");

  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    supplier: "",
    cost: "0",
    price: "0",
    gst: "",
    stock: "0",
    minStock: "10",
    unit: "Piece",
  });
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [units, setUnits] = useState([
    "Piece",
    "Kg",
    "Litre",
    "Box",
    "Dozen",
    "Metre",
  ]);

  const [newUnit, setNewUnit] = useState("");
  const [showUnitInput, setShowUnitInput] = useState(false);
  const [showEditUnitInput, setShowEditUnitInput] = useState(false);
  // Products are loaded from the backend API.
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getProducts();
      setProductList(data.products || []);
    } catch (err) {
      setLoadError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // --- ADDED FOR DYNAMIC CATEGORIES IN PROJECT 1 ---
  const [categories, setCategories] = useState([
    "Electronics",
    "Clothing",
    "Groceries",
    "Hardware",
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [showEditCategoryInput, setShowEditCategoryInput] = useState(false);



  // -------------------------------------------------

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    supplier: suppliers[0]?.name ?? "",
    cost: "0",
    price: "0",
    gst: "",
    stock: "0",
    minStock: "10",
    unit: "Piece",
  });

  const filtered = productList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.includes(search);
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
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

      {deleteId !== null && (
        <ConfirmDialog
          message="This will permanently delete the product."
          onConfirm={async () => {
            try {
              await deleteProduct(deleteId);
              setProductList((prev) => prev.filter((p) => p.id !== deleteId));
              setDeleteId(null);
              setShowEditModal(false);
              showToast("Product deleted successfully", "success");
            } catch (err) {
              setDeleteId(null);
              showToast(err.message || "Failed to delete product.", "error");
            }
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && editId !== null && (
        <Modal
          title="Edit Product"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
            setShowEditCategoryInput(false);
          }}
        >
          <div className="space-y-4">
            <Input
              label="Product Name"
              placeholder="Samsung Galaxy Buds Pro"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="SKU / Barcode"
                placeholder="EL-SGB-001"
                value={editForm.sku}
                onChange={(v) => setEditForm((f) => ({ ...f, sku: v }))}
              />
              <Select
                label="Category"
                value={editForm.category}
                onChange={(v) => {
                  if (v === "+ Add Category") {
                    setShowEditCategoryInput(true);
                  } else {
                    setEditForm((f) => ({ ...f, category: v }));
                    setShowEditCategoryInput(false);
                  }
                }}
                options={[...categories, "+ Add Category"]}
              />
            </div>

            {/* Conditionally rendered Add Category field in Edit Modal */}
            {showEditCategoryInput && (
              <div className="space-y-2 border border-blue-100 p-3 rounded-lg bg-slate-50/50">
                <Input
                  label="New Category"
                  value={newCategory}
                  onChange={setNewCategory}
                  placeholder="Enter category name"
                />
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (newCategory.trim()) {
                      setCategories([...categories, newCategory]);
                      setEditForm((f) => ({ ...f, category: newCategory }));
                      setNewCategory("");
                      setShowEditCategoryInput(false);
                    }
                  }}
                >
                  Save Category
                </Btn>
              </div>
            )}

            <Select
              label="Supplier"
              value={editForm.supplier}
              onChange={(v) => setEditForm((f) => ({ ...f, supplier: v }))}
              options={suppliers.map((s) => s.name)}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Cost Price (₹)"
                placeholder="4200"
                value={editForm.cost}
                onChange={(v) => setEditForm((f) => ({ ...f, cost: v }))}
              />
              <Input
                label="Selling Price (₹)"
                placeholder="6999"
                value={editForm.price}
                onChange={(v) => setEditForm((f) => ({ ...f, price: v }))}
              />
              <Input
                label="GST %"
                placeholder="18"
                value={editForm.gst}
                onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Opening Stock"
                placeholder="0"
                value={editForm.stock}
                onChange={(v) => setEditForm((f) => ({ ...f, stock: v }))}
              />
              <Input
                label="Min. Stock Level"
                placeholder="10"
                value={editForm.minStock}
                onChange={(v) => setEditForm((f) => ({ ...f, minStock: v }))}
              />
            </div>


            <div className="space-y-2">
              <Select
                label="Unit"
                value={editForm.unit}
                onChange={(v) => {
                  if (v === "+ New Unit") {
                    setShowEditUnitInput(true);
                    return;
                  }

                  setEditForm((f) => ({
                    ...f,
                    unit: v,
                  }));

                  setShowEditUnitInput(false);
                }}
                options={[...units, "+ New Unit"]}
              />

              {showEditUnitInput && (
                <div className="space-y-2 border border-blue-100 p-3 rounded-lg bg-slate-50/50">
                  <Input
                    label="New Unit"
                    value={newUnit}
                    onChange={setNewUnit}
                    placeholder="Enter unit name"
                  />

                  <Btn
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const unit = newUnit.trim();

                      if (!unit) return;

                      setUnits((prev) =>
                        prev.includes(unit) ? prev : [...prev, unit]
                      );

                      setEditForm((f) => ({
                        ...f,
                        unit: unit,
                      }));

                      setNewUnit("");
                      setShowEditUnitInput(false);
                    }}
                  >
                    Save Unit
                  </Btn>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditId(null);
                  setShowEditCategoryInput(false);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await updateProduct(editId, {
                      name: editForm.name,
                      sku: editForm.sku,
                      category: editForm.category,
                      supplier: editForm.supplier,
                      cost: Number(editForm.cost || 0),
                      price: Number(editForm.price || 0),
                      gst: Number(editForm.gst || 0),
                      stock: Number(editForm.stock || 0),
                      minStock: Number(editForm.minStock || 0),
                      unit: editForm.unit,
                    });
                    await loadProducts();
                    showToast("Product updated successfully", "success");
                    setShowEditModal(false);
                    setEditId(null);
                    setShowEditCategoryInput(false);
                    setShowEditUnitInput(false);
                  } catch (err) {
                    showToast(
                      err.message || "Failed to update product.",
                      "error"
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
                className="flex-1 justify-center"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showModal && (
        <Modal
          title="Add New Product"
          onClose={() => {
            setShowModal(false);
            setShowCategoryInput(false);
            setShowUnitInput(false);
            setNewUnit("");
          }}
        >
          <div className="space-y-4">
            <Input
              label="Product Name"
              placeholder="Samsung Galaxy Buds Pro"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="SKU / Barcode"
                placeholder="EL-SGB-001"
                value={form.sku}
                onChange={(v) => setForm((f) => ({ ...f, sku: v }))}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(v) => {
                  if (v === "+ Add Category") {
                    setShowCategoryInput(true);
                  } else {
                    setForm((f) => ({ ...f, category: v }));
                    setShowCategoryInput(false);
                  }
                }}
                options={[...categories, "+ Add Category"]}
              />
            </div>

            {/* Conditionally rendered Add Category field in Add Modal */}
            {showCategoryInput && (
              <div className="space-y-2 border border-blue-100 p-3 rounded-lg bg-slate-50/50">
                <Input
                  label="New Category"
                  value={newCategory}
                  onChange={setNewCategory}
                  placeholder="Enter category name"
                />
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (newCategory.trim()) {
                      setCategories([...categories, newCategory]);
                      setForm((f) => ({ ...f, category: newCategory }));
                      setNewCategory("");
                      setShowCategoryInput(false);
                    }
                  }}
                >
                  Save Category
                </Btn>
              </div>
            )}

            <Select
              label="Supplier"
              value={form.supplier}
              onChange={(v) => setForm((f) => ({ ...f, supplier: v }))}
              options={suppliers.map((s) => s.name)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Cost Price (₹)"
                placeholder="4200"
                value={form.cost}
                onChange={(v) => setForm((f) => ({ ...f, cost: v }))}
              />
              <Input
                label="Selling Price (₹)"
                placeholder="6999"
                value={form.price}
                onChange={(v) => setForm((f) => ({ ...f, price: v }))}
              />
              <Input
                label="GST %"
                placeholder="18"
                value={form.gst}
                onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Opening Stock"
                placeholder="0"
                value={form.stock}
                onChange={(v) => setForm((f) => ({ ...f, stock: v }))}
              />
              <Input
                label="Min. Stock Level"
                placeholder="10"
                value={form.minStock}
                onChange={(v) => setForm((f) => ({ ...f, minStock: v }))}
              />
            </div>

            <div className="space-y-2">
              <Select
                label="Unit"
                value={form.unit}
                onChange={(v) => {
                  if (v === "+ New Unit") {
                    setShowUnitInput(true);
                    return;
                  }
                  setForm((f) => ({ ...f, unit: v }));
                  setShowUnitInput(false);
                }}
                options={[...units, "+ New Unit"]}
              />

              {showUnitInput && (
                <div className="space-y-2 border border-blue-100 p-3 rounded-lg bg-slate-50/50">
                  <Input
                    label="New Unit"
                    value={newUnit}
                    onChange={setNewUnit}
                    placeholder="Enter unit name"
                  />
                  <Btn
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const unit = newUnit.trim();
                      if (!unit) return;
                      setUnits((prev) =>
                        prev.includes(unit) ? prev : [...prev, unit]
                      );
                      setForm((f) => ({ ...f, unit: unit }));
                      setNewUnit("");
                      setShowUnitInput(false);
                    }}
                  >
                    Save Unit
                  </Btn>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setShowCategoryInput(false);
                  setShowUnitInput(false);
                  setNewUnit("");
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await createProduct({
                      name: form.name,
                      sku: form.sku,
                      category: form.category,
                      supplier: form.supplier,
                      cost: Number(form.cost || 0),
                      price: Number(form.price || 0),
                      gst: Number(form.gst || 0),
                      stock: Number(form.stock || 0),
                      minStock: Number(form.minStock || 0),
                      unit: form.unit,
                      status: "Active",
                    });
                    await loadProducts();
                    setShowModal(false);
                    setShowCategoryInput(false);
                    setShowUnitInput(false);
                    setNewUnit("");
                    setForm({
                      name: "",
                      sku: "",
                      category: "Electronics",
                      supplier: suppliers[0]?.name ?? "",
                      cost: "0",
                      price: "0",
                      gst: "",
                      stock: "0",
                      minStock: "10",
                      unit: "Piece",
                    });
                    showToast("Product created successfully", "success");
                  } catch (err) {
                    showToast(
                      err.message || "Failed to create product.",
                      "error",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
                className="flex-1 justify-center"
              >
                {saving ? "Saving..." : "Save Product"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* FILTER AND HEADER CONTROLS */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search by name, SKU..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${catFilter === c ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <Btn
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Btn>
      </div>

      {/* TABLE SECTION */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Supplier",
                  "Cost",
                  "Price",
                  "Stock",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const lowStock = p.stock <= p.minStock;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 max-w-[200px] truncate">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      {p.sku}
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={p.category} variant="blue" />
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs truncate max-w-[140px]">
                      {p.supplier}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{fmt(p.cost)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {fmt(p.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-mono font-semibold text-sm ${p.stock === 0 ? "text-blue-600" : lowStock ? "text-amber-600" : "text-slate-900"}`}
                      >
                        {p.stock}
                      </span>
                      {lowStock && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            setEditId(p.id);
                            const u = p.unit || "Piece";
                            setEditForm({
                              name: p.name,
                              sku: p.sku,
                              category: p.category,
                              supplier: p.supplier,
                              cost: String(p.cost ?? 0),
                              price: String(p.price ?? 0),
                              gst: String(p.gst ?? ""),
                              stock: String(p.stock ?? 0),
                              minStock: String(p.minStock ?? 0),
                              unit: u,
                            });
                            if (p.unit && !units.includes(p.unit)) {
                              setUnits((prev) => [...prev, p.unit]);
                            }
                          }}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(p.id);
                          }}
                          icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {productList.length} products
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 text-xs rounded-lg ${p === 1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
