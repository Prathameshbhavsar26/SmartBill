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

import { fmt, fmtK } from "../../utils/format";
import {
  Btn,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  Toast,
} from "../../components/common/ui";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../api/customerAPI";

export default function CustomersScreen() {
  // =========================
  // STATE
  // =========================

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerList, setCustomerList] = useState([]);
  const [businessType, setBusinessType] = useState("Retail");

  const initialFormState = {
    name: "",
    contact: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    gst: "",
    openingBalance: "0",
  };

  const [form, setForm] = useState(initialFormState);
  const [editForm, setEditForm] = useState(initialFormState);

  // Determine if owner is Wholesale
  const isWholesale = String(businessType ?? "").toLowerCase() === "wholesale";

  // =========================
  // TOAST
  // =========================

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load business type from stored user.
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
  }, []);

  // =========================
  // LOAD CUSTOMERS
  // =========================

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetchCustomers();

        const customers = Array.isArray(response)
          ? response
          : response?.customers || [];

        setCustomerList(customers);
      } catch (error) {
        console.error("LOAD CUSTOMERS ERROR:", error);
        showToast(
          error?.message || "Unable to load customers.",
          "error"
        );
        setCustomerList([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // =========================
  // FILTER CUSTOMERS
  // =========================

  const filtered = customerList.filter((customer) => {
    const name = String(customer?.name || "").toLowerCase();
    const city = String(customer?.city || "").toLowerCase();
    const phone = String(customer?.phone || "").toLowerCase();
    const email = String(customer?.email || "").toLowerCase();
    const searchText = search.toLowerCase();

    return (
      name.includes(searchText) ||
      city.includes(searchText) ||
      phone.includes(searchText) ||
      email.includes(searchText)
    );
  });

  // =========================
  // SUMMARY CALCULATIONS
  // =========================

  const totalReceivable = customerList.reduce(
    (sum, customer) =>
      sum + Math.max(0, Number(customer?.balance || 0)),
    0
  );

  const totalPayable = customerList.reduce(
    (sum, customer) =>
      sum + Math.max(0, -Number(customer?.balance || 0)),
    0
  );

  // =========================
  // CREATE CUSTOMER
  // =========================

  const handleCreate = async () => {
    if (!form.name?.trim()) {
      showToast(isWholesale ? "Business name is required" : "Customer name is required", "error");
      return;
    }

    try {
      const response = await createCustomer({
        name: form.name,
        contact: isWholesale ? form.contact : "",
        phone: form.phone,
        email: form.email,
        city: form.city,
        address: form.address,
        gst: isWholesale ? form.gst : "",
        openingBalance: isWholesale ? Number(form.openingBalance || 0) : 0,
      });

      const createdCustomer = response?.customer || response;

      setCustomerList((prev) => [createdCustomer, ...prev]);
      setShowModal(false);
      setForm(initialFormState);
      showToast("Customer added successfully", "success");
    } catch (error) {
      console.error("CREATE CUSTOMER ERROR:", error);
      showToast(error?.message || "Failed to add customer", "error");
    }
  };

  // =========================
  // UPDATE CUSTOMER
  // =========================

  const handleUpdate = async () => {
    if (!editForm.name?.trim()) {
      showToast(isWholesale ? "Business name is required" : "Customer name is required", "error");
      return;
    }

    try {
      const response = await updateCustomer(editId, {
        name: editForm.name,
        contact: isWholesale ? editForm.contact : "",
        phone: editForm.phone,
        email: editForm.email,
        city: editForm.city,
        address: editForm.address,
        gst: isWholesale ? editForm.gst : "",
      });

      const updatedCustomer = response?.customer || response;

      setCustomerList((prev) =>
        prev.map((customer) =>
          String(customer._id || customer.id) === String(editId)
            ? updatedCustomer
            : customer
        )
      );

      setShowEditModal(false);
      setEditId(null);
      setEditForm(initialFormState);
      showToast("Customer updated successfully", "success");
    } catch (error) {
      console.error("UPDATE CUSTOMER ERROR:", error);
      showToast(error?.message || "Failed to update customer", "error");
    }
  };

  // =========================
  // DELETE CUSTOMER
  // =========================

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCustomer(deleteId);
      setCustomerList((prev) =>
        prev.filter(
          (customer) =>
            String(customer._id || customer.id) !== String(deleteId)
        )
      );
      setDeleteId(null);
      showToast("Customer deleted successfully", "success");
    } catch (error) {
      console.error("DELETE CUSTOMER ERROR:", error);
      setDeleteId(null);
      showToast(error?.message || "Failed to delete customer", "error");
    }
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const handleEdit = (customer) => {
    setEditId(customer._id || customer.id);
    setEditForm({
      name: customer.name || "",
      contact: customer.contact || "",
      phone: customer.phone || "",
      email: customer.email || "",
      city: customer.city || "",
      address: customer.address || "",
      gst: customer.gst || "",
      openingBalance: String(customer.balance ?? 0),
    });
    setShowEditModal(true);
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setForm(initialFormState);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditId(null);
  };

  // =========================
  // UI RENDER
  // =========================

  return (
    <div className="space-y-5">
      {/* =========================
          CUSTOMER DETAILS MODAL
      ========================= */}
      {viewCustomer && (
        <Modal title="Customer Details" onClose={() => setViewCustomer(null)}>
          <div className="space-y-5">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {viewCustomer.name}
              </p>
              {isWholesale && viewCustomer.contact && (
                <p className="text-sm text-slate-500">
                  Contact: {viewCustomer.contact}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Phone</p>
                <p className="text-sm text-slate-900">
                  {viewCustomer.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm text-slate-900">
                  {viewCustomer.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">City</p>
                <p className="text-sm text-slate-900">
                  {viewCustomer.city || "—"}
                </p>
              </div>

              {viewCustomer.address && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Address</p>
                  <p className="text-sm text-slate-900">
                    {viewCustomer.address}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-1">Balance</p>
                <p className="text-sm font-semibold text-slate-900">
                  {fmt(Math.abs(Number(viewCustomer.balance || 0)))}
                  {Number(viewCustomer.balance) > 0
                    ? " (To Receive)"
                    : Number(viewCustomer.balance) < 0
                    ? " (To Pay)"
                    : " (Balanced)"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Invoices</p>
                <p className="text-sm text-slate-900">
                  {viewCustomer.invoices ?? 0}
                </p>
              </div>

              {isWholesale && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">GST Number</p>
                  <p className="text-sm text-slate-900">
                    {viewCustomer.gst || "—"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Btn variant="outline" onClick={() => setViewCustomer(null)}>
                Close
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================
          EDIT CUSTOMER MODAL
      ========================= */}
      {showEditModal && editId !== null && (
        <Modal title="Edit Customer" onClose={closeEditModal}>
          <div className="space-y-4">
            {isWholesale ? (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Business Name"
                  placeholder="Raj Enterprises"
                  value={editForm.name}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, name: value }))
                  }
                />
                <Input
                  label="Contact Person"
                  placeholder="Rajesh Kumar"
                  value={editForm.contact}
                  onChange={(value) =>
                    setEditForm((f) => ({ ...f, contact: value }))
                  }
                />
              </div>
            ) : (
              <Input
                label="Customer Name"
                placeholder="Rahul Sharma"
                value={editForm.name}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, name: value }))
                }
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={editForm.phone}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, phone: value }))
                }
              />
              <Input
                label="Email"
                placeholder="rahul@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={editForm.email}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, email: value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Mumbai"
                icon={<MapPin className="w-4 h-4" />}
                value={editForm.city}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, city: value }))
                }
              />
              <Input
                label="Address"
                placeholder="123 Main Street, Area"
                value={editForm.address}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, address: value }))
                }
              />
            </div>

            {isWholesale && (
              <Input
                label="GST Number"
                placeholder="27AAPCS0510Q1Z6"
                value={editForm.gst}
                onChange={(value) =>
                  setEditForm((f) => ({ ...f, gst: value }))
                }
              />
            )}

            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={closeEditModal}
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

      {/* =========================
          ADD CUSTOMER MODAL
      ========================= */}
      {showModal && (
        <Modal title="Add New Customer" onClose={closeCreateModal}>
          <div className="space-y-4">
            {isWholesale ? (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Business Name"
                  placeholder="Raj Enterprises"
                  value={form.name}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, name: value }))
                  }
                />
                <Input
                  label="Contact Person"
                  placeholder="Rajesh Kumar"
                  value={form.contact}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, contact: value }))
                  }
                />
              </div>
            ) : (
              <Input
                label="Customer Name"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={(value) =>
                  setForm((f) => ({ ...f, name: value }))
                }
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(value) =>
                  setForm((f) => ({ ...f, phone: value }))
                }
              />
              <Input
                label="Email"
                placeholder="rahul@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(value) =>
                  setForm((f) => ({ ...f, email: value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="Mumbai"
                icon={<MapPin className="w-4 h-4" />}
                value={form.city}
                onChange={(value) =>
                  setForm((f) => ({ ...f, city: value }))
                }
              />
              <Input
                label="Address"
                placeholder="123 Main Street, Area"
                value={form.address}
                onChange={(value) =>
                  setForm((f) => ({ ...f, address: value }))
                }
              />
            </div>

            {isWholesale && (
              <>
                <Input
                  label="GST Number"
                  placeholder="27AAPCS0510Q1Z6"
                  value={form.gst}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, gst: value }))
                  }
                />
                <Input
                  label="Opening Balance (₹)"
                  placeholder="0"
                  value={form.openingBalance}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, openingBalance: value }))
                  }
                />
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={closeCreateModal}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={handleCreate}
                className="flex-1 justify-center"
              >
                Save Customer
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================
          DELETE CONFIRMATION
      ========================= */}
      {deleteId && (
        <ConfirmDialog
          message="This will permanently delete this customer. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* =========================
          SEARCH + BUTTONS
      ========================= */}
      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search customers by name, city, phone, email..."
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

      {/* =========================
          SUMMARY CARDS
      ========================= */}
      <div className="grid grid-cols-3 gap-4">
        {[
          [fmtK(customerList.length), "Total Customers"],
          [fmtK(totalReceivable), "Total Receivable"],
          [fmtK(totalPayable), "Total Payable"],
        ].map(([value, label]) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* =========================
          CUSTOMER TABLE
      ========================= */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  isWholesale ? "Business" : "Customer Name",
                  isWholesale ? "Contact" : "Email",
                  "Phone",
                  "City",
                  "Balance",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <p className="text-sm text-slate-500">
                      Loading customers...
                    </p>
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
                filtered.map((customer) => {
                  const customerId = customer._id || customer.id;
                  const balance = Number(customer.balance || 0);

                  return (
                    <tr
                      key={customerId}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* NAME */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {customer.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {customer.invoices ?? 0} invoices
                        </p>
                      </td>

                      {/* CONTACT / EMAIL */}
                      <td className="px-5 py-4 text-slate-600">
                        {isWholesale
                          ? customer.contact || "—"
                          : customer.email || "—"}
                      </td>

                      {/* PHONE */}
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {customer.phone || "—"}
                      </td>

                      {/* CITY */}
                      <td className="px-5 py-4 text-slate-600">
                        {customer.city || "—"}
                      </td>

                      {/* BALANCE */}
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold font-mono text-sm ${
                            balance > 0
                              ? "text-emerald-600"
                              : balance < 0
                              ? "text-red-500"
                              : "text-slate-500"
                          }`}
                        >
                          {balance > 0 ? "+" : ""}
                          {fmt(Math.abs(balance))}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {balance > 0
                            ? "To Receive"
                            : balance < 0
                            ? "To Pay"
                            : "Balanced"}
                        </p>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Btn
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewCustomer(customer);
                            }}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          />
                          <Btn
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEdit(customer);
                            }}
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                          />
                          <Btn
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteId(customerId);
                            }}
                            icon={
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {customerList.length} customers
          </p>
        </div>
      </Card>

      {/* =========================
          TOAST
      ========================= */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
