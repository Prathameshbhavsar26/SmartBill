import { useState, useEffect } from "react";
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
import axios from "axios";
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
  };

  // Make products editable so "Save Product" updates the table below.
  const [productList, setProductList] = useState([]);

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

  const fetchProducts = async () => {
  try {
    const token = localStorage.getItem("smartbill_token");

    const res = await axios.get(
      "http://localhost:5000/api/products",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProductList(res.data.products);
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchProducts();
}, []);

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
              const token = localStorage.getItem("smartbill_token");

await axios.delete(
  `http://localhost:5000/api/products/${deleteId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
              await fetchProducts();
              showToast("Product deleted successfully", "success");
            } catch (error) {
              console.error(error);
              showToast("Failed to delete product", "error");
            } finally {
              setDeleteId(null);
              setShowEditModal(false);
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

            <Select
              label="Unit"
              value={editForm.unit}
              onChange={(v) => setEditForm((f) => ({ ...f, unit: v }))}
              options={["Piece", "Kg", "Litre", "Box", "Dozen", "Metre"]}
            />

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
                onClick={async () => {
                  try {
                    await axios.put(
                      `http://localhost:5000/api/products/${editId}`,
                      {
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
                      },
                    );
                    await fetchProducts();
                    showToast("Product updated successfully", "success");
                  } catch (error) {
                    console.error(error);
                    showToast("Failed to update product", "error");
                  } finally {
                    setShowEditModal(false);
                    setEditId(null);
                    setShowEditCategoryInput(false);
                  }
                }}
                className="flex-1 justify-center"
              >
                Save Changes
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
            <Select
              label="Unit"
              value={form.unit}
              onChange={(v) => setForm((f) => ({ ...f, unit: v }))}
              options={["Piece", "Kg", "Litre", "Box", "Dozen", "Metre"]}
            />
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setShowCategoryInput(false);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={async () => {
                  const token = localStorage.getItem("smartbill_token");
  try {
    await axios.post(
  "http://localhost:5000/api/products",
  {
    name: form.name,
    sku: form.sku,
    category: form.category,
    supplier: form.supplier,
    cost: Number(form.cost),
    price: Number(form.price),
    gst: Number(form.gst),
    stock: Number(form.stock),
    minStock: Number(form.minStock),
    unit: form.unit,
    status: "Active",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    // Reload products from MongoDB
    await fetchProducts();

    setShowModal(false);
    setShowCategoryInput(false);

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

    showToast("Product added successfully", "success");
  } catch (error) {
    console.error(error);
    showToast("Failed to add product", "error");
  }
}}
                className="flex-1 justify-center"
              >
                Save Product
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
        <Btn variant="outline" size="md" icon={<Upload className="w-4 h-4" />}>
          Import
        </Btn>
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
                    key={p._id || p.id}
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
                            setEditId(p._id || p.id);
                            setEditForm({
                              name: p.name,
                              sku: p.sku,
                              category: p.category,
                              supplier: p.supplier,
                              cost: String(p.cost ?? 0),
                              price: String(p.price ?? 0),
                              gst: "",
                              stock: String(p.stock ?? 0),
                              minStock: String(p.minStock ?? 0),
                              unit: "Piece",
                            });
                          }}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(p._id || p.id);
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
