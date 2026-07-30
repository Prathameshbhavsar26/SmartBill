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
import { customers as initialCustomers } from "../../data/mockData";
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

export default function CustomersScreen() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
    openingBalance: "0",
  });

  const [toast, setToast] = useState(null);

  // Local editable list (so added customers appear below in the table)
  const [customerList, setCustomerList] = useState(initialCustomers);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
  });

  const filtered = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()),
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
          message="This will permanently delete the customer and all their data."
          onConfirm={() => {
            setCustomerList((prev) => prev.filter((c) => c.id !== deleteId));
            setDeleteId(null);
            showToast("Customer deleted successfully", "success");
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {viewCustomer && (
        <Modal title="Customer Details" onClose={() => setViewCustomer(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Business Name
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {viewCustomer.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact Person
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.contact || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.phone || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.email || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  City
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.city || "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Balance
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {fmt(Math.abs(viewCustomer.balance || 0))}
                  {viewCustomer.balance > 0
                    ? " (To Receive)"
                    : viewCustomer.balance < 0
                      ? " (To Pay)"
                      : " (Balanced)"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoices
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {viewCustomer.invoices ?? 0}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && editId !== null && (
        <Modal
          title="Edit Customer"
          onClose={() => {
            setShowEditModal(false);
            setEditId(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Business Name"
                placeholder="Raj Enterprises"
                value={editForm.name}
                onChange={(v) => setEditForm((f) => ({ ...f, name: v }))}
              />
              <Input
                label="Contact Person"
                placeholder="Rajesh Kumar"
                value={editForm.contact}
                onChange={(v) => setEditForm((f) => ({ ...f, contact: v }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={editForm.phone}
                onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
              />
              <Input
                label="Email"
                placeholder="rajesh@raj.in"
                icon={<Mail className="w-4 h-4" />}
                value={editForm.email}
                onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
              />
            </div>

            <Input
              label="City"
              placeholder="Mumbai"
              icon={<MapPin className="w-4 h-4" />}
              value={editForm.city}
              onChange={(v) => setEditForm((f) => ({ ...f, city: v }))}
            />

            <Input
              label="GST Number"
              placeholder="27AAPCS0510Q1Z6"
              value={editForm.gst}
              onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
            />

            <Input
              label="Opening Balance (₹)"
              placeholder="0"
              value={editForm.openingBalance}
              onChange={(v) =>
                setEditForm((f) => ({ ...f, openingBalance: v }))
              }
            />

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
                  const opening = Number(editForm.openingBalance || 0);
                  setCustomerList((prev) =>
                    prev.map((c) =>
                      c.id === editId
                        ? {
                            ...c,
                            name: editForm.name || c.name,
                            contact: editForm.contact || "",
                            phone: editForm.phone || "",
                            email: editForm.email || "",
                            city: editForm.city || "",
                            balance: Number.isFinite(opening) ? opening : 0,
                          }
                        : c,
                    ),
                  );
                  setShowEditModal(false);
                  setEditId(null);
                  showToast("Customer updated successfully", "success");
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
        <Modal title="Add New Customer" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Business Name"
                placeholder=""
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Input
                label="Contact Person"
                placeholder=""
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder=""
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <Input
                label="Email"
                placeholder=""
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
            </div>
            <Input
              label="City"
              placeholder=""
              icon={<MapPin className="w-4 h-4" />}
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <Input
              label="GST Number"
              placeholder=""
              value={form.gst}
              onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
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
                    customerList.length > 0
                      ? Math.max(...customerList.map((x) => x.id)) + 1
                      : 1;

                  const newCustomer = {
                    id: newId,
                    name: form.name || "New Customer",
                    contact: form.contact || "",
                    phone: form.phone || "",
                    email: form.email || "",
                    city: form.city || "",
                    balance: 0,
                    status: "Active",
                    invoices: 0,
                  };

                  setCustomerList((prev) => [...prev, newCustomer]);
                  setShowModal(false);
                  showToast("Customer added successfully", "success");

                  setForm({
                    name: "",
                    contact: "",
                    phone: "",
                    email: "",
                    city: "",
                    gst: "",
                    openingBalance: "0",
                  });
                }}
                className="flex-1 justify-center"
              >
                Save Customer
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search customers..."
          icon={<Search className="w-4 h-4" />}
        />
        <Btn
          variant="outline"
          size="md"
          icon={<Download className="w-4 h-4" />}
        >
          Export
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Customer
        </Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["342", "Total Customers"],
          ["₹1.8L", "Total Receivable"],
          ["₹10.5K", "Total Payable"],
        ].map(([v, l]) => (
          <Card key={l} className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{v}</p>
            <p className="text-xs text-slate-500 mt-0.5">{l}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Business",
                  "Contact",
                  "Phone",
                  "City",
                  "Balance",
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      icon={<Users className="w-6 h-6" />}
                      title="No customers found"
                      sub="Try adjusting your search query"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">
                        {c.invoices} invoices
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.contact}</td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                      {c.phone}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.city}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold font-mono text-sm ${c.balance > 0 ? "text-emerald-600" : c.balance < 0 ? "text-red-500" : "text-slate-500"}`}
                      >
                        {c.balance > 0 ? "+" : ""}
                        {fmt(Math.abs(c.balance))}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {c.balance >= 0 ? "To Receive" : "To Pay"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewCustomer(c);
                          }}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditModal(true);
                            setEditId(c.id);
                            setEditForm({
                              name: c.name,
                              contact: c.contact,
                              phone: c.phone,
                              email: c.email,
                              city: c.city,
                              gst: "",
                              openingBalance: String(c.balance ?? 0),
                            });
                          }}
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                        />
                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(c.id);
                          }}
                          icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {customerList.length} customers
          </p>

          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8].map((p, i) => (
              <button
                key={i}
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
