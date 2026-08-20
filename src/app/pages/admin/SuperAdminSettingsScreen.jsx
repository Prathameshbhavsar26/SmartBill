import { useState, useEffect } from "react";
import {
  Settings,
  Package,
  Mail,
  Shield,
  BarChart2,
  MessageSquare,
  Plus,
  Lock,
  Loader2,
} from "lucide-react";
import { Btn, Badge, Card, Toast } from "../../components/common/ui";
import adminAPI from "../../api/adminAPI";

export default function SuperAdminSettingsScreen() {
  const [activeTab, setActiveTab] = useState("system");

  // System Settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

  const [systemLoading, setSystemLoading] = useState(true);
  const [systemSaving, setSystemSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadSystemSettings = async () => {
      try {
        setSystemLoading(true);
        const res = await adminAPI.getSystemSettings();
        if (res?.systemSettings) {
          setMaintenanceMode(Boolean(res.systemSettings.maintenanceMode));
          setAutoBackup(Boolean(res.systemSettings.autoBackup));
          setDebugMode(Boolean(res.systemSettings.debugMode));
          setBackupFrequency(res.systemSettings.backupFrequency || "daily");
          setMaxLoginAttempts(String(res.systemSettings.maxLoginAttempts ?? 5));
        }
      } catch (err) {
        console.error("Failed to load system settings from MongoDB:", err);
      } finally {
        setSystemLoading(false);
      }
    };

    loadSystemSettings();
  }, []);


  // Email Template states
  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to SmartBill",
      status: "active",
    },
    {
      id: 2,
      name: "Invoice Email",
      subject: "Your Invoice - {invoice_no}",
      status: "active",
    },
    {
      id: 3,
      name: "Password Reset",
      subject: "Reset Your Password",
      status: "active",
    },
    {
      id: 4,
      name: "Subscription Reminder",
      subject: "Your subscription expires soon",
      status: "active",
    },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Subscription Plans states
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Starter",
      price: "₹499/month",
      users: 5,
      features: "Basic accounting, GST ready",
      status: "active",
    },
    {
      id: 2,
      name: "Professional",
      price: "₹999/month",
      users: 15,
      features: "Advanced reports, multi-user",
      status: "active",
    },
    {
      id: 3,
      name: "Enterprise",
      price: "Custom",
      users: "Unlimited",
      features: "API access, custom domain",
      status: "active",
    },
  ]);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");

  // User Management states
  const [adminUsers, setAdminUsers] = useState([
    {
      id: 1,
      name: "System Admin",
      email: "admin@smartbill.com",
      role: "super-admin",
      status: "active",
      lastLogin: "2 hours ago",
    },
    {
      id: 2,
      name: "Support Lead",
      email: "support@smartbill.com",
      role: "admin",
      status: "active",
      lastLogin: "1 day ago",
    },
  ]);

  // Audit Log states
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: "User Login",
      user: "admin@smartbill.com",
      timestamp: "2024-01-15 10:30 AM",
      status: "success",
    },
    {
      id: 2,
      action: "Settings Updated",
      user: "admin@smartbill.com",
      timestamp: "2024-01-15 10:25 AM",
      status: "success",
    },
    {
      id: 3,
      action: "Backup Completed",
      user: "System",
      timestamp: "2024-01-15 09:00 AM",
      status: "success",
    },
    {
      id: 4,
      action: "User Deleted",
      user: "admin@smartbill.com",
      timestamp: "2024-01-14 04:15 PM",
      status: "warning",
    },
  ]);

  // Support Settings states
  const [supportEmail, setSupportEmail] = useState("support@smartbill.com");
  const [supportPhone, setSupportPhone] = useState("+91-1800-123-4567");
  const [ticketSystem, setTicketSystem] = useState(true);
  const [liveChat, setLiveChat] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState(true);

  // Save handlers
  const handleSaveSystemSettings = async (overrides = {}) => {
    try {
      setSystemSaving(true);
      const payload = {
        maintenanceMode: overrides.maintenanceMode !== undefined ? overrides.maintenanceMode : maintenanceMode,
        autoBackup: overrides.autoBackup !== undefined ? overrides.autoBackup : autoBackup,
        debugMode: overrides.debugMode !== undefined ? overrides.debugMode : debugMode,
        backupFrequency: overrides.backupFrequency !== undefined ? overrides.backupFrequency : backupFrequency,
        maxLoginAttempts: overrides.maxLoginAttempts !== undefined ? overrides.maxLoginAttempts : parseInt(maxLoginAttempts, 10) || 5,
      };

      const res = await adminAPI.updateSystemSettings(payload);

      if (res?.systemSettings) {
        setMaintenanceMode(Boolean(res.systemSettings.maintenanceMode));
        setAutoBackup(Boolean(res.systemSettings.autoBackup));
        setDebugMode(Boolean(res.systemSettings.debugMode));
        setBackupFrequency(res.systemSettings.backupFrequency || "daily");
        setMaxLoginAttempts(String(res.systemSettings.maxLoginAttempts ?? 5));
      }

      showToast("✓ System settings saved to MongoDB successfully!", "success");
    } catch (err) {
      console.error("Failed to save system settings:", err);
      showToast(err.message || "Failed to save system settings to MongoDB.", "error");
    } finally {
      setSystemSaving(false);
    }
  };

  const handleSaveEmailSettings = () => {
    localStorage.setItem(
      "superAdminEmailSettings",
      JSON.stringify({ emailTemplates }),
    );
    alert("✓ Email templates updated successfully!");
  };

  const handleSaveApiSettings = () => {
    localStorage.setItem(
      "superAdminApiSettings",
      JSON.stringify({
        rateLimit,
        webhooksEnabled,
        ipWhitelist,
      }),
    );
    alert("✓ API settings saved successfully!");
  };

  const handleAddPlan = () => {
    if (newPlanName && newPlanPrice) {
      const newPlan = {
        id: plans.length + 1,
        name: newPlanName,
        price: newPlanPrice,
        users: "10",
        features: "Standard features",
        status: "active",
      };
      setPlans([...plans, newPlan]);
      setNewPlanName("");
      setNewPlanPrice("");
      alert("✓ New plan added successfully!");
    }
  };

  const handleDeletePlan = (id) => {
    setPlans(plans.filter((p) => p.id !== id));
    alert("✓ Plan deleted successfully!");
  };

  const handleSavePaymentSettings = () => {
    localStorage.setItem(
      "superAdminPaymentSettings",
      JSON.stringify({
        paymentGateway,
        razorpayKey,
        stripeKey,
        enablePaypal,
        enableStripe,
      }),
    );
    alert("✓ Payment gateway settings saved!");
  };

  const handleSaveSupportSettings = () => {
    localStorage.setItem(
      "superAdminSupportSettings",
      JSON.stringify({
        supportEmail,
        supportPhone,
        ticketSystem,
        liveChat,
        knowledgeBase,
      }),
    );
    alert("✓ Support settings saved successfully!");
  };

  const handleRemoveAdmin = (id) => {
    setAdminUsers(adminUsers.filter((u) => u.id !== id));
    alert("✓ Admin user removed successfully!");
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "system", label: "System Settings", icon: Settings },
          { key: "plans", label: "Subscription Plans", icon: Package },
          { key: "email", label: "Email Templates", icon: Mail },
          { key: "users", label: "Admin Users", icon: Shield },
          { key: "logs", label: "Audit Logs", icon: BarChart2 },
          { key: "support", label: "Support Settings", icon: MessageSquare },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeTab === key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: SYSTEM SETTINGS */}
      {activeTab === "system" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">System Settings</h3>
            {systemSaving && (
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing to MongoDB...</span>
              </div>
            )}
          </div>

          {systemLoading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium">Loading System Settings from MongoDB...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Backup Frequency */}
              <div className="py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Backup Frequency
                </p>
                <select
                  value={backupFrequency}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBackupFrequency(val);
                    handleSaveSystemSettings({ backupFrequency: val });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual / On-Demand Only</option>
                  <option value="disabled">Disabled / Never</option>
                </select>
              </div>

              {/* Max Login Attempts */}
              <div className="py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Max Login Attempts
                </p>
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)}
                  onBlur={() => {
                    const parsed = parseInt(maxLoginAttempts, 10) || 5;
                    handleSaveSystemSettings({ maxLoginAttempts: parsed });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="5"
                />
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-slate-500">
                    Temporarily disable user access for maintenance
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !maintenanceMode;
                    setMaintenanceMode(nextVal);
                    handleSaveSystemSettings({ maintenanceMode: nextVal });
                  }}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${maintenanceMode ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${maintenanceMode ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              {/* Auto Backup */}
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Auto Backup
                  </p>
                  <p className="text-xs text-slate-500">
                    Automatically backup database
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !autoBackup;
                    setAutoBackup(nextVal);
                    handleSaveSystemSettings({ autoBackup: nextVal });
                  }}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${autoBackup ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${autoBackup ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              {/* Debug Mode */}
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">Debug Mode</p>
                  <p className="text-xs text-slate-500">
                    Enable detailed error logging
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !debugMode;
                    setDebugMode(nextVal);
                    handleSaveSystemSettings({ debugMode: nextVal });
                  }}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${debugMode ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${debugMode ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <Btn
                variant="primary"
                onClick={() => handleSaveSystemSettings()}
                disabled={systemSaving}
                icon={systemSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              >
                {systemSaving ? "Saving..." : "Save System Settings"}
              </Btn>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-5">
              Manage Subscription Plans
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {plan.price}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Users: {plan.users}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">{plan.features}</p>
                  <div className="flex gap-2 mt-3">
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      Delete
                    </Btn>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-medium text-slate-900 mb-3">Add New Plan</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Plan Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(e.target.value)}
                  placeholder="Price (e.g., ₹499/month)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Btn
                  variant="primary"
                  onClick={handleAddPlan}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Plan
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: EMAIL TEMPLATES */}
      {activeTab === "email" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Email Templates</h3>
          <div className="space-y-3">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-slate-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{template.name}</p>
                  <p className="text-xs text-slate-500">{template.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    label={template.status}
                    variant={template.status === "active" ? "green" : "gray"}
                  />
                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Edit
                  </Btn>
                </div>
              </div>
            ))}
          </div>
          <Btn
            variant="primary"
            onClick={handleSaveEmailSettings}
            icon={<Mail className="w-4 h-4" />}
            className="mt-5"
          >
            Save Email Templates
          </Btn>
        </Card>
      )}

      {/* TAB 6: ADMIN USERS */}
      {activeTab === "users" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Admin Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "Name",
                    "Email",
                    "Role",
                    "Status",
                    "Last Login",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={
                          user.role === "super-admin" ? "Super Admin" : "Admin"
                        }
                        variant="blue"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={user.status} variant="green" />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {user.lastLogin}
                    </td>
                    <td className="px-4 py-3">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAdmin(user.id)}
                      >
                        Remove
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === "logs" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Audit Logs</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {log.action}
                  </p>
                  <p className="text-xs text-slate-500">
                    by {log.user} • {log.timestamp}
                  </p>
                </div>
                <Badge
                  label={log.status}
                  variant={log.status === "success" ? "green" : "yellow"}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 8: SUPPORT SETTINGS */}
      {activeTab === "support" && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-5">
            Support Settings
          </h3>
          <div className="space-y-4">
            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Support Email
              </p>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Support Phone
              </p>
              <input
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Support Ticket System
                </p>
                <p className="text-xs text-slate-500">
                  Enable ticket system for users
                </p>
              </div>
              <button
                onClick={() => setTicketSystem(!ticketSystem)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${ticketSystem ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${ticketSystem ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Live Chat</p>
                <p className="text-xs text-slate-500">
                  Enable live chat support
                </p>
              </div>
              <button
                onClick={() => setLiveChat(!liveChat)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${liveChat ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${liveChat ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Knowledge Base
                </p>
                <p className="text-xs text-slate-500">
                  Enable public knowledge base
                </p>
              </div>
              <button
                onClick={() => setKnowledgeBase(!knowledgeBase)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${knowledgeBase ? "bg-blue-600" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${knowledgeBase ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveSupportSettings}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Save Support Settings
            </Btn>
          </div>
        </Card>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
