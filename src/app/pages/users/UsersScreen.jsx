import { useState, useEffect } from "react";
import {
  Edit2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCircle,
} from "lucide-react";
import {
  Btn,
  Card,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  Toast,
  statusBadge,
  EmptyState,
} from "../../components/common/ui";

import {
  MODULE_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from "../../utils/permissions";

const getUserEmployeeStorageKey = () => {
  try {
    const raw = localStorage.getItem("smartbill_user");
    if (raw) {
      const user = JSON.parse(raw);
      const userKey = user?._id || user?.id || user?.email;
      if (userKey) {
        return `smartbill_employees_${userKey}`;
      }
    }
  } catch (e) {
    console.warn("Could not read user key:", e);
  }
  return "smartbill_employees_default";
};

export default function UsersScreen() {
  const [employeeList, setEmployeeList] = useState(() => {
    try {
      const key = getUserEmployeeStorageKey();
      let saved = localStorage.getItem(key);
      if (!saved && key !== "smartbill_employees_default") {
        const oldSaved = localStorage.getItem("smartbill_employees");
        if (oldSaved) {
          localStorage.setItem(key, oldSaved);
          saved = oldSaved;
        }
      }
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const key = getUserEmployeeStorageKey();
      localStorage.setItem(key, JSON.stringify(employeeList));
    } catch (err) {
      console.error("Error saving employees to localStorage:", err);
    }
  }, [employeeList]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Cashier");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    ...ROLE_DEFAULT_PERMISSIONS.Cashier,
  });
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Cashier");
    setDepartment("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
    setPermissions({ ...ROLE_DEFAULT_PERMISSIONS.Cashier });
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    const defaults =
      ROLE_DEFAULT_PERMISSIONS[selectedRole] ||
      ROLE_DEFAULT_PERMISSIONS.Cashier;
    setPermissions({ ...defaults });
  };

  const togglePermission = (modKey) => {
    setPermissions((prev) => ({
      ...prev,
      [modKey]: !prev[modKey],
    }));
  };

  const handleSaveEmployee = () => {
    let valid = true;
    setEmailError("");
    setPhoneError("");

    // Validate Email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      const exists = employeeList.some(
        (emp) =>
          emp.email.toLowerCase() === trimmedEmail.toLowerCase() &&
          emp.id !== editingId
      );
      if (exists) {
        setEmailError("An employee with this email already exists.");
        valid = false;
      }
    }

    // Validate Phone
    const digits = phone.replace(/\D/g, "");
    if (!digits) {
      setPhoneError("Phone number is required.");
      valid = false;
    } else if (digits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      valid = false;
    }

    if (!valid) return;

    const updatedEmployee = {
      id: editingId ?? Date.now(),
      name,
      email: trimmedEmail,
      role,
      department,
      phone: digits,
      password,
      permissions: { ...permissions },
      status: "Active",
      lastActive: "Just now",
    };

    if (editingId !== null) {
      setEmployeeList(
        employeeList.map((emp) =>
          emp.id === editingId ? updatedEmployee : emp
        )
      );
    } else {
      setEmployeeList([...employeeList, updatedEmployee]);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (employee) => {
    resetForm();
    setName(employee.name || "");
    setEmail(employee.email || "");
    setRole(employee.role || "Cashier");
    setDepartment(employee.department || "");
    setPhone(employee.phone || "");
    setPassword(employee.password || "");

    if (employee.permissions && typeof employee.permissions === "object") {
      setPermissions({
        ...ROLE_DEFAULT_PERMISSIONS.Cashier,
        ...employee.permissions,
      });
    } else {
      const defaults =
        ROLE_DEFAULT_PERMISSIONS[employee.role] ||
        ROLE_DEFAULT_PERMISSIONS.Cashier;
      setPermissions({ ...defaults });
    }

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
            resetForm();
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
                onChange={(val) => {
                  setEmail(val);
                  if (emailError) setEmailError("");
                }}
                icon={<Mail className="w-4 h-4" />}
                error={emailError}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Role"
                value={role}
                onChange={handleRoleChange}
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
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(value) => {
                const digits = value.replace(/\D/g, "");
                if (digits.length <= 10) {
                  setPhone(digits);
                  if (phoneError) setPhoneError("");
                }
              }}
              icon={<Phone className="w-4 h-4" />}
              error={phoneError}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Temporary Password
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  title={showPassword ? "Lock Password" : "Unlock Password"}
                >
                  {showPassword ? (
                    <Unlock className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Enter temporary password"
                  className={`w-full border border-slate-200 rounded-lg bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all py-2.5 pl-9 pr-10 ${
                    passwordError
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 mt-0.5">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Module Permissions
                </p>
                <span className="text-[10px] text-slate-400">
                  Select allowed modules
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {MODULE_PERMISSIONS.map((mod) => (
                  <label
                    key={mod.key}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[mod.key])}
                      onChange={() => togglePermission(mod.key)}
                      className="accent-blue-600 rounded w-3.5 h-3.5 cursor-pointer"
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn
                variant="outline"
                onClick={() => {
                  resetForm();
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
            resetForm();
            setShowModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Employee
        </Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Employee",
                  "Email",
                  "Role",
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
                            ? e.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "?"}
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
        </div>
      </Card>
    </div>
  );
}
