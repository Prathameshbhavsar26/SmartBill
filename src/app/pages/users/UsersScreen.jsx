import { useState } from "react";
import {
  Edit2,
  Lock,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCircle,
} from "lucide-react";
import { employees as initialEmployees } from "../../data/mockData";
import {
  Btn,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  Toast,
  statusBadge,
} from "../../components/common/ui";

export default function UsersScreen() {
  const [employeeList, setEmployeeList] = useState(initialEmployees);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Cashier");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleSaveEmployee = () => {
    const updatedEmployee = {
      id: editingId ?? Date.now(),
      name,
      email,
      role,
      department,
      phone,
      password,
      status: "Active",
      lastActive: "Just now",
    };

    if (editingId !== null) {
      setEmployeeList(
        employeeList.map((emp) =>
          emp.id === editingId ? updatedEmployee : emp,
        ),
      );
    } else {
      setEmployeeList([...employeeList, updatedEmployee]);
    }

    setEditingId(null);

    setName("");
    setEmail("");
    setRole("Cashier");
    setDepartment("");
    setPhone("");
    setPassword("");

    setShowModal(false);
  };

  const handleEdit = (employee) => {
    setName(employee.name);
    setEmail(employee.email);
    setRole(employee.role);
    setDepartment(employee.department);
    setPhone(employee.phone || "");
    setPassword(employee.password || "");

    setEditingId(employee.id);

    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this employee?")) {
      setEmployeeList(employeeList.filter((emp) => emp.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {showModal && (
        <Modal
          title={editingId ? "Update Employee" : "Add Employee"}
          onClose={() => {
            setEditingId(null);

            setName("");
            setEmail("");
            setRole("Cashier");
            setDepartment("");
            setPhone("");
            setPassword("");

            setShowModal(false);
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="Priya Sharma"
                value={name}
                onChange={setName}
              />
              <Input
                label="Email"
                placeholder="priya@business.in"
                value={email}
                onChange={setEmail}
                icon={<Mail className="w-4 h-4" />}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Role"
                value={role}
                onChange={setRole}
                options={["Owner", "Manager", "Cashier", "Accountant"]}
              />
              <Input
                label="Department"
                placeholder="Sales"
                value={department}
                onChange={setDepartment}
              />
            </div>
            <Input
              label="Phone"
              placeholder="+91"
              value={phone}
              onChange={(value) => {
                // Allow only digits
                const digits = value.replace(/\D/g, "");

                // Limit to 10 digits
                if (digits.length <= 10) {
                  setPhone(digits);
                  setPhoneError("");
                }
              }}
              error={phoneError}
            />
            <Input
              label="Temporary Password"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setPasswordError("");
              }}
              icon={<Lock className="w-4 h-4" />}
              error={passwordError}
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Permissions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "View Dashboard",
                  "Create Invoices",
                  "Manage Products",
                  "View Reports",
                  "Manage Customers",
                  "Access Settings",
                ].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600 rounded"
                      defaultChecked={p !== "Access Settings"}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  setEditingId(null);

                  setName("");
                  setEmail("");
                  setRole("Cashier");
                  setDepartment("");
                  setPhone("");
                  setPassword("");

                  setShowModal(false);
                }}
                className="flex-1 justify-center"
              >
                Cancel
              </Btn>
              <Btn variant="primary" onClick={handleSaveEmployee}>
                {editingId ? "Update Employee" : "Add Employee"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex justify-end">
        <Btn
          variant="primary"
          size="md"
          onClick={() => {
            setEditingId(null);

            setName("");
            setEmail("");
            setRole("Cashier");
            setDepartment("");
            setPhone("");
            setPassword("");

            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Employee
        </Btn>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Employee",
                "Email",
                "role",
                "Department",
                "Last Active",
                "Status",
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
            {employeeList.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">
                        {e.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900">{e.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-500 text-xs">{e.email}</td>
                <td className="px-5 py-4 text-slate-700 font-medium">
                  {e.role}
                </td>
                <td className="px-5 py-4 text-slate-600">{e.department}</td>
                <td className="px-5 py-4 text-slate-500 text-xs">
                  {e.lastActive}
                </td>
                <td className="px-5 py-4">{statusBadge(e.status)}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(e)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    />
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(e.id)}
                      icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
