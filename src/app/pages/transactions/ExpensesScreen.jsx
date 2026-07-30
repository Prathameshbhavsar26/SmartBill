import { useState } from "react";
import {
  Clock,
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { expenses as initialExpenses } from "../../data/mockData";
import { fmt } from "../../utils/format";
import {
  Badge,
  Btn,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  StatCard,
  Toast,
  statusBadge,
} from "../../components/common/ui";

export default function ExpensesScreen() {
  const [showModal, setShowModal] = useState(false);

  // Local editable list so added expenses appear in the table below.
  const [expenseList, setExpenseList] = useState(initialExpenses);

  const [form, setForm] = useState({
    category: "Rent",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMode: "Bank Transfer",
    reference: "",
  });

  const [toast, setToast] = useState(null);

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

      {showModal && (
        <Modal title="Add Expense" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v }))}
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
            <Input
              label="Description"
              placeholder="August rent payment"
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (₹)"
                placeholder="45000"
                value={form.amount}
                onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
              />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(v) => setForm((f) => ({ ...f, date: v }))}
              />
            </div>
            <Select
              label="Payment Mode"
              value={form.paymentMode}
              onChange={(v) => setForm((f) => ({ ...f, paymentMode: v }))}
              options={[
                "Cash",
                "Bank Transfer",
                "UPI",
                "Credit Card",
                "Cheque",
              ]}
            />
            <Input
              label="Reference / Receipt No."
              placeholder="REF-001"
              value={form.reference}
              onChange={(v) => setForm((f) => ({ ...f, reference: v }))}
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
                  const amountNum = Number(form.amount || 0);
                  if (!form.description.trim()) {
                    showToast("Description is required", "error");
                    return;
                  }
                  if (!Number.isFinite(amountNum) || amountNum <= 0) {
                    showToast("Amount must be greater than 0", "error");
                    return;
                  }

                  const newId =
                    expenseList.length > 0
                      ? Math.max(...expenseList.map((x) => x.id)) + 1
                      : 1;

                  const newExpense = {
                    id: newId,
                    category: form.category,
                    description: form.description,
                    date: form.date,
                    amount: amountNum,
                    paymentMode: form.paymentMode,
                    reference: form.reference || "",
                    status: "Paid",
                  };

                  setExpenseList((prev) => [newExpense, ...prev]);
                  setShowModal(false);
                  setForm({
                    category: "Rent",
                    description: "",
                    date: new Date().toISOString().slice(0, 10),
                    amount: "",
                    paymentMode: "Bank Transfer",
                    reference: "",
                  });
                  showToast("Expense saved successfully", "success");
                }}
                className="flex-1 justify-center"
              >
                Save Expense
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Expenses (Aug)"
          value={`₹${Number(expenseList.reduce((s, e) => s + (Number(e.amount) || 0), 0)).toLocaleString("en-IN")}`}
          sub=""
          trend="up"
          icon={<Wallet className="w-5 h-5" />}
          color="bg-red-50 text-red-500"
        />
        <StatCard
          label="Largest Expense"
          value="Salaries"
          sub="₹1,25,000 (60.7%)"
          trend="neutral"
          icon={<Users className="w-5 h-5" />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Pending Payments"
          value="₹12,400"
          sub="1 item pending"
          trend="neutral"
          icon={<Clock className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Expense History</h3>
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
            {expenseList.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <Badge label={e.category} variant="purple" />
                </td>
                <td className="px-5 py-3.5 text-slate-900">{e.description}</td>
                <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                  {e.date}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {fmt(e.amount)}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{e.paymentMode}</td>
                <td className="px-5 py-3.5">{statusBadge(e.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
