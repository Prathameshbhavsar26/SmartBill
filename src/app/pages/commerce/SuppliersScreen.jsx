import { useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { suppliers as initialSuppliers } from "../../data/mockData";
import { fmt } from "../../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  FixedPhoneInput,
  Input,
  Modal,
  Toast,
  statusBadge,
} from "../../components/common/ui";

export default function SuppliersScreen() {
  const [search, setSearch] = useState("");
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
    gst: "",
    balance: 0,
    status: "Active",
  });
  const [toast, setToast] = useState(null);

  // Local editable list (so added suppliers appear below in the table)
  const [supplierList, setSupplierList] = useState(initialSuppliers);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
    balanceDue: "0",
  });

  const filtered = supplierList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
          message="This will permanently delete the supplier."
          onConfirm={() => {
            setSupplierList((prev) => prev.filter((s) => s.id !== deleteId));
            setDeleteId(null);
            setShowEditModal(false);
            showToast("Supplier deleted successfully", "success");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {viewSupplier && (
        <Modal title="Supplier Details" onClose={() => setViewSupplier(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company Name
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {viewSupplier.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact Person
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.contact || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.phone || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.email || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  City
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewSupplier.city || "—"}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Balance Due
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {fmt(viewSupplier.balance || 0)}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && editId !== null && (
        <Modal
          title="Edit Supplier"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
          }}
        >
          <div className="space-y-4">
            <Input
              label="Company Name"
              placeholder="TechVision Pvt Ltd"
              value={editForm.name}
              onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                placeholder="Arun Verma"
                value={editForm.contact}
                onChange={(v) => setEditForm((f) => ({ ...f, contact: v }))}
              />
              <Input
                label="Phone"
                placeholder="+91"
                icon={<Phone className="w-4 h-4" />}
                value={editForm.phone}
                onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
              />
            </div>
            <Input
              label="Email"
              placeholder="arun@techvision.in"
              icon={<Mail className="w-4 h-4" />}
              value={editForm.email}
              onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Bangalore"
                value={editForm.city}
                onChange={(v) => setEditForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="GST Number"
                placeholder="29ABCDE1234F1Z5"
                value={editForm.gst}
                onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditId(null);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  setSupplierList((prev) =>
                    prev.map((s) =>
                      s.id === editId
                        ? {
                            ...s,
                            name: editForm.name || s.name,
                            contact: editForm.contact || "",
                            phone: editForm.phone || "",
                            email: editForm.email || "",
                            city: editForm.city || "",
                            balance: Number.isFinite(Number(s.balance))
                              ? Number(s.balance)
                              : 0,
                            status: editForm.status || s.status,
                          }
                        : s,
                    ),
                  );
                  setShowEditModal(false);
                  setEditId(null);
                  showToast("Supplier updated successfully", "success");
                }}
                className="flex-1 justify-center"
              >
                Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title="Add New Supplier" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Input
              label="Company Name"
              placeholder=""
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                placeholder=""
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
              <Input
                label="Phone"
                placeholder="+91 "
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
            </div>
            <Input
              label="Email"
              placeholder=""
              icon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder=""
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />
              <Input
                label="GST Number"
                placeholder=""
                value={form.gst}
                onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
              />
            </div>
            <Input
              label="Balance Due (₹)"
              placeholder=""
              value={form.balanceDue}
              onChange={(v) => setForm((f) => ({ ...f, balanceDue: v }))}
            />
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  const newId =
                    supplierList.length > 0
                      ? Math.max(...supplierList.map((x) => x.id)) + 1
                      : 1;

                  const newSupplier = {
                    id: newId,
                    name: form.name || "New Supplier",
                    contact: form.contact || "",
                    phone: form.phone || "",
                    email: form.email || "",
                    city: form.city || "",
                    balance: 0,
                    status: "Active",
                  };

                  setSupplierList((prev) => [...prev, newSupplier]);
                  setShowModal(false);
                  showToast("Supplier added successfully", "success");

                  setForm({
                    name: "",
                    contact: "",
                    phone: "",
                    email: "",
                    city: "",
                    gst: "",
                  });
                }}
                className="flex-1 justify-center"
              >
                Save Supplier
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search suppliers..."
          icon={<Search className="w-4 h-4" />}
        />
        <Btn
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Supplier
        </Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Supplier",
                  "Contact",
                  "Phone",
                  "City",
                  "Balance Due",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.contact}</td>
                  <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                    {s.phone}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.city}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {fmt(s.balance)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewSupplier(s);
                        }}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      />
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditModal(true);
                          setEditId(s.id);
                          setEditForm({
                            name: s.name,
                            contact: s.contact,
                            phone: s.phone,
                            email: s.email,
                            city: s.city,
                            gst: "",
                            balance: s.balance,
                            status: s.status,
                          });
                        }}
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                      />
                      <Btn
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(s.id);
                        }}
                        icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

