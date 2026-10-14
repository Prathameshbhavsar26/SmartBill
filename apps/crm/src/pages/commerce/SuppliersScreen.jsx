import { useEffect, useState } from "react";
import {
  Edit2,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  Building2,
} from "lucide-react";
import { fmt, pluralize } from "@shared/utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Toast,
} from "@shared/components/common/ui";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@shared/api/supplierAPI";

const validateSupplierPhone = (value) => {
  const digits = String(value ?? "").trim();
  if (!digits) return "";
  return /^\d{10}$/.test(digits)
    ? ""
    : "Contact number must be exactly 10 digits.";
};

export default function SuppliersScreen() {
  // Suppliers Directory State
  const [search, setSearch] = useState("");
  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    gst: "",
    balance: 0,
    status: "Active",
  });
  const [formPhoneError, setFormPhoneError] = useState("");
  const [editPhoneError, setEditPhoneError] = useState("");
  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    gst: "",
    balanceDue: "0",
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers();
      setSupplierList(data.suppliers || []);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      showToast("Failed to load suppliers list.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered Suppliers
  const filteredSuppliers = supplierList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact && s.contact.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.includes(search)) ||
      (s.city && s.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Suppliers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage registered suppliers, balance payables, and contact details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700">
            Total: {pluralize(supplierList.length, "Supplier")}
          </span>
        </div>
      </div>

      {/* ── Actions & Search ───────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex-1 min-w-[260px] max-w-md">
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Search suppliers by name, contact, phone, city..."
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Btn
              variant="primary"
              size="md"
              onClick={() => setShowModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Supplier
            </Btn>
          </div>
        </div>

        {/* ── Suppliers Table & Mobile Cards ─────────────────────────── */}
        <Card>
          {/* 1. Desktop Table (md and above) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  {[
                    "Supplier / Firm",
                    "Contact Person",
                    "Phone & Email",
                    "City & Address",
                    "GST Number",
                    "Balance Due",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide ${
                        h === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      {loading ? "Loading suppliers..." : "No matching suppliers found."}
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group align-middle"
                    >
                      {/* Firm Name */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {s.name}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          ID: {s._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Contact Person */}
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium text-xs">
                        {s.contact || "—"}
                      </td>

                      {/* Phone & Email */}
                      <td className="px-5 py-4">
                        <p className="text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold">
                          {s.phone}
                        </p>
                        {s.email && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{s.email}</p>
                        )}
                      </td>

                      {/* City & Address */}
                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-[220px]">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{s.city || "—"}</p>
                        <p className="text-[11px] text-slate-400 truncate">{s.address}</p>
                      </td>

                      {/* GST Number */}
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        {s.gst || "—"}
                      </td>

                      {/* Balance Due */}
                      <td className="px-5 py-4">
                        <span
                          className={`font-mono font-bold text-sm ${
                            Number(s.balance) > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600"
                          }`}
                        >
                          {fmt(s.balance || 0)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setViewSupplier(s)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditModal(true);
                              setEditId(s._id);
                              setEditForm({
                                name: s.name,
                                contact: s.contact,
                                phone: s.phone,
                                email: s.email,
                                city: s.city,
                                address: s.address || "",
                                gst: s.gst || "",
                                balance: s.balance,
                                status: s.status,
                              });
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                            title="Edit supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteId(s._id)}
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/50 dark:hover:bg-red-950/50 cursor-pointer"
                            title="Delete supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile Responsive Cards (< md) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {loading ? "Loading suppliers..." : "No matching suppliers found."}
              </div>
            ) : (
              filteredSuppliers.map((s) => (
                <div key={s._id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {s.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.contact ? `Contact: ${s.contact}` : `ID: ${s._id?.slice(-6).toUpperCase()}`}
                        {s.city ? ` • ${s.city}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          Number(s.balance) > 0
                            ? "text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200"
                            : "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200"
                        }`}
                      >
                        Bal: {fmt(s.balance || 0)}
                      </span>
                    </div>
                  </div>

                  {(s.phone || s.email || s.gst) && (
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-mono flex-wrap">
                      {s.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.phone}
                        </span>
                      )}
                      {s.gst && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          GST: {s.gst}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => setViewSupplier(s)}
                      className="flex-1 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer min-h-[36px]"
                      title="View Supplier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(true);
                        setEditId(s._id);
                        setEditForm({
                          name: s.name,
                          contact: s.contact,
                          phone: s.phone,
                          email: s.email,
                          city: s.city,
                          address: s.address || "",
                          gst: s.gst || "",
                          balance: s.balance,
                          status: s.status,
                        });
                      }}
                      className="p-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs flex items-center justify-center hover:bg-slate-50 cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteId(s._id)}
                      className="p-1.5 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs flex items-center justify-center hover:bg-rose-50 cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredSuppliers.length} of {pluralize(supplierList.length, "supplier")}
            </p>
          </div>
        </Card>
      </div>

      {/* ── View Supplier Details Modal ────────────────────────────── */}
      {viewSupplier && (
        <Modal title="Supplier Profile Details" onClose={() => setViewSupplier(null)}>
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Firm Name
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {viewSupplier.name}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Contact Person</p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{viewSupplier.contact || "—"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Phone Number</p>
                <p className="mt-1 text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{viewSupplier.phone || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 break-all">{viewSupplier.email || "—"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">GST Number</p>
                <p className="mt-1 text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{viewSupplier.gst || "—"}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Outstanding Balance Due</p>
              <p className="mt-1 text-lg font-mono font-extrabold text-red-600 dark:text-red-400">
                {fmt(viewSupplier.balance || 0)}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Supplier Modal ────────────────────────────────────── */}
      {showEditModal && editId !== null && (
        <Modal
          title="Edit Supplier"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
          }}
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Firm Name"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                value={editForm.contact}
                onChange={(v) => setEditForm((f) => ({ ...f, contact: v }))}
              />
              <div>
                <Input
                  label="Phone"
                  icon={<Phone className="w-4 h-4" />}
                  value={editForm.phone}
                  onChange={(v) => {
                    const digitsOnly = String(v ?? "").replace(/\D/g, "").slice(0, 10);
                    setEditForm((f) => ({ ...f, phone: digitsOnly }));
                    setEditPhoneError(validateSupplierPhone(digitsOnly));
                  }}
                  error={editPhoneError}
                />
              </div>
            </div>
            <Input
              label="Email"
              icon={<Mail className="w-4 h-4" />}
              value={editForm.email}
              onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City"
                value={editForm.city}
                onChange={(v) => setEditForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="GST Number"
                value={editForm.gst}
                onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Address
              </label>
              <textarea
                rows={3}
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, address: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditId(null);
                }}
                className="w-full sm:flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={async () => {
                  const nextPhoneError = validateSupplierPhone(editForm.phone);
                  setEditPhoneError(nextPhoneError);
                  if (nextPhoneError) return;

                  try {
                    await updateSupplier(editId, editForm);
                    await loadSuppliers();
                    setShowEditModal(false);
                    setEditId(null);
                    showToast("Supplier updated successfully!");
                  } catch (err) {
                    console.error(err);
                    showToast("Failed to update supplier.", "error");
                  }
                }}
                className="w-full sm:flex-1 justify-center"
              >
                Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Supplier Modal ─────────────────────────────────────── */}
      {showModal && (
        <Modal title="Add New Supplier" onClose={() => setShowModal(false)}>
          <div className="space-y-4 text-xs">
            <Input
              label="Firm Name *"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
              <div>
                <Input
                  label="Phone *"
                  icon={<Phone className="w-4 h-4" />}
                  value={form.phone}
                  onChange={(v) => {
                    const digitsOnly = String(v ?? "").replace(/\D/g, "").slice(0, 10);
                    setForm((f) => ({ ...f, phone: digitsOnly }));
                    setFormPhoneError(validateSupplierPhone(digitsOnly));
                  }}
                  error={formPhoneError}
                />
              </div>
            </div>
            <Input
              label="Email"
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City"
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="GST Number"
                value={form.gst}
                onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Address
              </label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => setShowModal(false)}
                className="w-full sm:flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={async () => {
                  const nextPhoneError = validateSupplierPhone(form.phone);
                  setFormPhoneError(nextPhoneError);
                  if (nextPhoneError) return;

                  try {
                    await createSupplier(form);
                    await loadSuppliers();
                    setShowModal(false);
                    setForm({
                      name: "",
                      contact: "",
                      phone: "",
                      email: "",
                      city: "",
                      address: "",
                      gst: "",
                      balanceDue: "0",
                    });
                    setFormPhoneError("");
                    showToast("Supplier added successfully!");
                  } catch (err) {
                    console.error(err);
                    showToast("Failed to create supplier.", "error");
                  }
                }}
                className="w-full sm:flex-1 justify-center"
              >
                Save Supplier
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Dialog for Suppliers ───────────────── */}
      {deleteId !== null && (
        <ConfirmDialog
          message="This will permanently delete the supplier from your directory."
          onConfirm={async () => {
            try {
              await deleteSupplier(deleteId);
              await loadSuppliers();
              setDeleteId(null);
              showToast("Supplier deleted successfully!");
            } catch (err) {
              console.error(err);
              showToast("Failed to delete supplier.", "error");
            }
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
