import { useEffect, useState } from "react";
import {
  getExpenses,
  createExpense,
} from "../../api/expenseApi";

import {
  Clock,
  Plus,
  Users,
  Wallet,
} from "lucide-react";

import {
  Badge,
  Btn,
  Card,
  Input,
  Modal,
  Select,
  StatCard,
  Toast,
  statusBadge,
} from "../../components/common/ui";

export default function ExpensesScreen() {
  const [showModal, setShowModal] = useState(false);

  // Empty initially - backend will be connected later
  const [expenseList, setExpenseList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    category: "Rent",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMode: "Bank Transfer",
    reference: "",
    status: "Paid",
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
  const loadExpenses = async () => {
    try {
      setLoading(true);

      const data = await getExpenses();

      setExpenseList(data.expenses || []);
    } catch (error) {
      console.error("LOAD EXPENSES ERROR:", error);

      showToast(
        error.message || "Unable to load expenses",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  loadExpenses();
}, []);

  // Calculate total expenses
  const totalExpenses = expenseList.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0
  );

  // Calculate pending payments
  const pendingExpenses = expenseList.filter(
    (expense) => expense.status === "Pending"
  );

  const pendingAmount = pendingExpenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0
  );

  return (
    <div className="space-y-4">

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <Modal
          title="Add Expense"
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">

            {/* Category */}
            <Select
              label="Category"
              value={form.category}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  category: v,
                }))
              }
              options={[
                "Rent",
                "Utilities",
                "Salaries",
                "Marketing",
                "Logistics",
                "Maintenance",
                "Other",
              ]}
            />

            {/* Description */}
            <Input
              label="Description"
              placeholder="August rent payment"
              value={form.description}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  description: v,
                }))
              }
            />

            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-3">

              <Input
                label="Amount (₹)"
                placeholder="45000"
                value={form.amount}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    amount: v,
                  }))
                }
              />

              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    date: v,
                  }))
                }
              />

            </div>

            {/* Payment Mode */}
            <Select
              label="Payment Mode"
              value={form.paymentMode}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  paymentMode: v,
                }))
              }
              options={[
                "Cash",
                "Bank Transfer",
                "UPI",
                "Credit Card",
                "Cheque",
              ]}
            />

            <Select
               label="Status"
               value={form.status}
               onChange={(v) =>
               setForm((f) => ({
               ...f,
               status: v,
              }))
              }
            options={[
             "Paid",
             "Pending",
            ]}
           />

            {/* Reference */}
            <Input
              label="Reference / Receipt No."
              placeholder="REF-001"
              value={form.reference}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  reference: v,
                }))
              }
            />

            {/* Buttons */}
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
                onClick={async () => {
  const amountNum = Number(form.amount || 0);

  // Validation
  if (!form.description.trim()) {
    showToast("Description is required", "error");
    return;
  }

  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    showToast("Amount must be greater than 0", "error");
    return;
  }

  try {
    const data = await createExpense({
      category: form.category,
      description: form.description.trim(),
      amount: amountNum,
      date: form.date,
      paymentMode: form.paymentMode,
      reference: form.reference.trim(),
      status: form.status,
    });

    // Add the expense returned by MongoDB
    setExpenseList((prev) => [
      data.expense,
      ...prev,
    ]);

    // Close modal
    setShowModal(false);

    // Reset form
    setForm({
      category: "Rent",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      amount: "",
      paymentMode: "Bank Transfer",
      reference: "",
      status: "Paid",
    });

    showToast(
      "Expense saved successfully",
      "success"
    );
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);

    showToast(
      error.message || "Unable to save expense",
      "error"
    );
  }
}}
                className="flex-1 justify-center"
              >
                Save Expense
              </Btn>

            </div>
          </div>
        </Modal>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">

        {/* Total Expenses */}
        <StatCard
          label="Total Expenses (Aug)"
          value={`₹${totalExpenses.toLocaleString(
            "en-IN"
          )}`}
          sub={
            expenseList.length === 0
              ? "No expenses added"
              : `${expenseList.length} expense${
                  expenseList.length > 1 ? "s" : ""
                }`
          }
          trend="up"
          icon={<Wallet className="w-5 h-5" />}
          color="bg-red-50 text-red-500"
        />

        {/* Pending Payments */}
        <StatCard
          label="Pending Payments"
          value={`₹${pendingAmount.toLocaleString(
            "en-IN"
          )}`}
          sub={`${pendingExpenses.length} item${
            pendingExpenses.length !== 1 ? "s" : ""
          } pending`}
          trend="neutral"
          icon={<Clock className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />

      </div>

      {/* Expense History */}
      <Card>

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

          <h3 className="font-semibold text-slate-900">
            Expense History
          </h3>

          <Btn
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Expense
          </Btn>

        </div>

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-slate-100">

              {[
                "Category",
                "Description",
                "Date",
                "Amount",
                "Mode",
                "Status",
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

            {expenseList.length === 0 ? (

              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-10 text-center text-slate-400"
                >
                  No expenses added yet.
                </td>
              </tr>

            ) : (

              expenseList.map((e) => (

                <tr
                  key={e.id}
                  className="hover:bg-slate-50 transition-colors group"
                >

                  <td className="px-5 py-3.5">
                    <Badge
                      label={e.category}
                      variant="purple"
                    />
                  </td>

                  <td className="px-5 py-3.5 text-slate-900">
                    {e.description}
                  </td>

                  <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                    {e.date}
                  </td>

                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    ₹{Number(e.amount).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-slate-600">
                    {e.paymentMode}
                  </td>

                  <td className="px-5 py-3.5">
                    {statusBadge(e.status)}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </Card>

    </div>
  );
}