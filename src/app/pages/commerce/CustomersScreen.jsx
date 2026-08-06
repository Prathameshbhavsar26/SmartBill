import { useEffect, useState } from "react";
import {
  Download,
  Edit2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
<<<<<<< HEAD
import { fmt } from "../../utils/format";
=======
import { fmt, fmtK } from "../../utils/format";
>>>>>>> 767a4931 (Add customer and order management)
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  Toast,
} from "../../components/common/ui";
<<<<<<< HEAD
import { createCustomer, fetchCustomers } from "../../api/customerAPI";
=======
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../api/customerAPI";
>>>>>>> 767a4931 (Add customer and order management)

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
<<<<<<< HEAD
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [businessType, setBusinessType] = useState("Retail");

  const showGstField = String(businessType ?? "").toLowerCase() === "wholesale";
=======
  const [loading, setLoading] = useState(true);
  const [customerList, setCustomerList] = useState([]);
>>>>>>> 767a4931 (Add customer and order management)

  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    gst: "",
    openingBalance: "0",
  });

<<<<<<< HEAD
  useEffect(() => {
    const rawUser = localStorage.getItem("smartbill_user");
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        if (user?.businessType) {
          setBusinessType(String(user.businessType).trim());
        }
      } catch (err) {
        console.warn("Unable to parse stored user:", err);
      }
    }

    setLoading(true);
    fetchCustomers()
      .then((customers) => setCustomerList(customers))
      .catch((error) => {
        showToast(error.message || "Unable to load customers.", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customerList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()),
  );

=======
>>>>>>> 767a4931 (Add customer and order management)
  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load customers from the backend.
  useEffect(() => {
    fetchCustomers()
      .then((res) => setCustomerList(res.customers || []))
      .catch((err) => {
        showToast(err?.message || "Failed to load customers", "error");
        setCustomerList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = customerList.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalReceivable = customerList.reduce(
    (s, c) => s + Math.max(0, c.balance || 0),
    0,
  );
  const totalPayable = customerList.reduce(
    (s, c) => s + Math.max(0, -(c.balance || 0)),
    0,
  );

  const handleCreate = () => {
    if (!form.name?.trim()) {
      showToast("Customer name is required", "error");
      return;
    }
    createCustomer({
      name: form.name,
      contact: form.contact,
      phone: form.phone,
      email: form.email,
      city: form.city,
      gst: form.gst,
      openingBalance: Number(form.openingBalance || 0),
    })
      .then((res) => {
        setCustomerList((prev) => [res.customer, ...prev]);
        setShowModal(false);
        setForm({
          name: "",
          contact: "",
          phone: "",
          email: "",
          city: "",
          gst: "",
          openingBalance: "0",
        });
        showToast("Customer added successfully", "success");
      })
      .catch((err) =>
        showToast(err?.message || "Failed to add customer", "error"),
      );
  };

  const handleUpdate = () => {
    updateCustomer(editId, {
      name: editForm.name,
      contact: editForm.contact,
      phone: editForm.phone,
      email: editForm.email,
      city: editForm.city,
      gst: editForm.gst,
    })
      .then((res) => {
        setCustomerList((prev) =>
          prev.map((c) => (c._id === editId ? res.customer : c)),
        );
        setShowEditModal(false);
        setEditId(null);
        showToast("Customer updated successfully", "success");
      })
      .catch((err) =>
        showToast(err?.message || "Failed to update customer", "error"),
      );
  };

  const handleDelete = () => {
    deleteCustomer(deleteId)
      .then(() => {
        setCustomerList((prev) =>
          prev.filter((c) => c._id !== deleteId),
        );
        setDeleteId(null);
        showToast("Customer deleted successfully", "success");
      })
      .catch((err) => {
        setDeleteId(null);
        showToast(err?.message || "Failed to delete customer", "error");
      });
  };

  return (
    <div className="space-y-4">
      {viewCustomer && (
        <Modal title="Customer Details" onClose={() => setViewCustomer(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {viewCustomer.name}
                </p>
                <p className="text-xs text-slate-500">
                  {viewCustomer.contact || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-700 font-mono">
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

            {showGstField && (
              <Input
                label="GST Number"
                placeholder="27AAPCS0510Q1Z6"
                value={editForm.gst}
                onChange={(v) => setEditForm((f) => ({ ...f, gst: v }))}
              />
            )}

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
                onClick={handleUpdate}
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
                placeholder="Raj Enterprises"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Input
                label="Contact Person"
                placeholder="Rajesh Kumar"
                value={form.contact}
                onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <Input
                label="Email"
                placeholder="rajesh@raj.in"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
            </div>
            <Input
              label="City"
              placeholder="Mumbai"
              icon={<MapPin className="w-4 h-4" />}
              value={form.city}
              onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            />
<<<<<<< HEAD
            {showGstField && (
              <Input
                label="GST Number"
                placeholder=""
                value={form.gst}
                onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
              />
            )}
=======
            <Input
              label="GST Number"
              placeholder="27AAPCS0510Q1Z6"
              value={form.gst}
              onChange={(v) => setForm((f) => ({ ...f, gst: v }))}
            />
            <Input
              label="Opening Balance (₹)"
              placeholder="0"
              value={form.openingBalance}
              onChange={(v) => setForm((f) => ({ ...f, openingBalance: v }))}
            />
>>>>>>> 767a4931 (Add customer and order management)
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
<<<<<<< HEAD
                onClick={async () => {
                  try {
                    const createdCustomer = await createCustomer(form);
                    setCustomerList((prev) => [createdCustomer, ...prev]);
                    setShowModal(false);
                    showToast("Customer added successfully", "success");
                    setForm({
                      name: "",
                      contact: "",
                      phone: "",
                      email: "",
                      city: "",
                      gst: "",
                    });
                  } catch (error) {
                    showToast(error.message || "Unable to add customer.", "error");
                  }
                }}
=======
                onClick={handleCreate}
>>>>>>> 767a4931 (Add customer and order management)
                className="flex-1 justify-center"
              >
                Save Customer
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          message="This will permanently delete this customer. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
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
          [fmtK(customerList.length), "Total Customers"],
          [fmtK(totalReceivable), "Total Receivable"],
          [fmtK(totalPayable), "Total Payable"],
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <p className="text-sm text-slate-500">Loading customers...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
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
                    key={c._id}
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
                            setEditId(c._id);
                            setEditForm({
                              name: c.name,
                              contact: c.contact,
                              phone: c.phone,
                              email: c.email,
                              city: c.city,
                              gst: c.gst || "",
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
                            setDeleteId(c._id);
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
        </div>
      </Card>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
