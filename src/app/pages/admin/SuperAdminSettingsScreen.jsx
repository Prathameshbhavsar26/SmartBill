import { useEffect, useState } from "react";
import {
  Settings,
  Package,
  Mail,
  MessageSquare,
  Plus,
  Lock,
  Loader2,
  X,
} from "lucide-react";

import { Btn, Badge, Card, Toast } from "../../components/common/ui";
import adminAPI from "../../api/adminAPI";

import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../../api/subscriptionPlanApi";

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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailSaving, setEmailSaving] = useState(false);

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

  // Subscription Plans states
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planError, setPlanError] = useState("");

  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");

  const [editingPlan, setEditingPlan] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState(null);

  // Support Settings states
  const [supportEmail, setSupportEmail] = useState("support@smartbill.com");
  const [supportPhone, setSupportPhone] = useState("+91-1800-123-4567");
  const [ticketSystem, setTicketSystem] = useState(true);
  const [liveChat, setLiveChat] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState(true);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load System Settings
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
          if (Array.isArray(res.systemSettings.emailTemplates) && res.systemSettings.emailTemplates.length > 0) {
            setEmailTemplates(res.systemSettings.emailTemplates);
          }
        }
      } catch (err) {
        console.error("Failed to load system settings from MongoDB:", err);
      } finally {
        setSystemLoading(false);
      }
    };

    loadSystemSettings();
  }, []);

  // Load subscription plans when Plans tab opens
  useEffect(() => {
    if (activeTab === "plans") {
      loadSubscriptionPlans();
    }
  }, [activeTab]);

  // Save System Settings
  const handleSaveSystemSettings = async (overrides = {}) => {
    try {
      setSystemSaving(true);

      const payload = {
        maintenanceMode:
          overrides.maintenanceMode !== undefined
            ? overrides.maintenanceMode
            : maintenanceMode,

        autoBackup:
          overrides.autoBackup !== undefined
            ? overrides.autoBackup
            : autoBackup,

        debugMode:
          overrides.debugMode !== undefined
            ? overrides.debugMode
            : debugMode,

        backupFrequency:
          overrides.backupFrequency !== undefined
            ? overrides.backupFrequency
            : backupFrequency,

        maxLoginAttempts:
          overrides.maxLoginAttempts !== undefined
            ? overrides.maxLoginAttempts
            : parseInt(maxLoginAttempts, 10) || 5,
      };

      const res = await adminAPI.updateSystemSettings(payload);

      if (res?.systemSettings) {
        setMaintenanceMode(
          Boolean(res.systemSettings.maintenanceMode)
        );
        setAutoBackup(Boolean(res.systemSettings.autoBackup));
        setDebugMode(Boolean(res.systemSettings.debugMode));
        setBackupFrequency(
          res.systemSettings.backupFrequency || "daily"
        );
        setMaxLoginAttempts(
          String(res.systemSettings.maxLoginAttempts ?? 5)
        );
      }

      showToast(
        "✓ System settings saved to MongoDB successfully!",
        "success"
      );
    } catch (err) {
      console.error("Failed to save system settings:", err);

      showToast(
        err.message ||
          "Failed to save system settings to MongoDB.",
        "error"
      );
    } finally {
      setSystemSaving(false);
    }
  };

  const handleSaveEmailSettings = async (templatesToSave = emailTemplates) => {
    try {
      setEmailSaving(true);
      const res = await adminAPI.updateSystemSettings({ emailTemplates: templatesToSave });
      if (res?.systemSettings?.emailTemplates) {
        setEmailTemplates(res.systemSettings.emailTemplates);
      }
      showToast("✓ Email templates saved to MongoDB successfully!", "success");
    } catch (err) {
      console.error("Failed to save email templates:", err);
      showToast(err.message || "Failed to save email templates to MongoDB.", "error");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleToggleTemplateStatus = async (templateId) => {
    const updatedTemplates = emailTemplates.map((template) => {
      if (template.id === templateId) {
        const newStatus = template.status === "active" ? "inactive" : "active";
        return { ...template, status: newStatus };
      }
      return template;
    });

    setEmailTemplates(updatedTemplates);

    try {
      const res = await adminAPI.updateSystemSettings({ emailTemplates: updatedTemplates });
      if (res?.systemSettings?.emailTemplates) {
        setEmailTemplates(res.systemSettings.emailTemplates);
      }
      const updatedItem = updatedTemplates.find((t) => t.id === templateId);
      showToast(
        `✓ Email template "${updatedItem?.name}" status updated to ${updatedItem?.status}!`,
        "success"
      );
    } catch (err) {
      console.error("Failed to update template status:", err);
      showToast("Failed to update template status in MongoDB.", "error");
    }
  };

  const handleSaveModalTemplate = async (editedTemplate) => {
    const updatedTemplates = emailTemplates.map((t) =>
      t.id === editedTemplate.id ? editedTemplate : t
    );
    setEmailTemplates(updatedTemplates);
    setSelectedTemplate(null);
    await handleSaveEmailSettings(updatedTemplates);
  };

  // Subscription Plans Functions
  const loadSubscriptionPlans = async () => {
    try {
      setLoadingPlans(true);
      setPlanError("");

      const response = await getSubscriptionPlans();

      setPlans(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load subscription plans:",
        error
      );

      setPlanError(
        error.response?.data?.message ||
          "Failed to load subscription plans."
      );
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleAddPlan = async () => {
    if (!newPlanName.trim() || !newPlanPrice) {
      alert("Please enter plan name and price.");
      return;
    }

    try {
      setSavingPlan(true);

      const payload = {
        key: newPlanName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-"),

        name: newPlanName.trim(),

        price: Number(newPlanPrice),

        billingCycle: "monthly",

        maxBusinesses: 1,
        maxUsers: 10,
        maxInvoicesPerMonth: 500,

        features: {
          basicReports: true,
          emailSupport: true,
          advancedReports: false,
          gstFiling: false,
          prioritySupport: false,
          barcodeScanner: false,
          apiAccess: false,
          customIntegrations: false,
          dedicatedManager: false,
        },

        status: "active",
      };

      await createSubscriptionPlan(payload);

      setNewPlanName("");
      setNewPlanPrice("");

      await loadSubscriptionPlans();

      alert("✓ Subscription plan added successfully!");
    } catch (error) {
      console.error(
        "Failed to create subscription plan:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create subscription plan."
      );
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription plan?"
    );

    if (!confirmed) return;

    try {
      setDeletingPlanId(id);

      await deleteSubscriptionPlan(id);

      await loadSubscriptionPlans();

      alert("✓ Subscription plan deleted successfully!");
    } catch (error) {
      console.error(
        "Failed to delete subscription plan:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete subscription plan."
      );
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleEditPlan = async (plan) => {
    const name = window.prompt(
      "Enter plan name:",
      plan.name
    );

    if (name === null) return;

    const price = window.prompt(
      "Enter monthly price:",
      plan.price
    );

    if (price === null) return;

    if (!name.trim() || !price || Number(price) < 0) {
      alert("Please enter valid plan details.");
      return;
    }

    try {
      setSavingPlan(true);
      setEditingPlan(plan._id);

      await updateSubscriptionPlan(plan._id, {
        name: name.trim(),
        price: Number(price),
      });

      await loadSubscriptionPlans();

      alert("✓ Subscription plan updated successfully!");
    } catch (error) {
      console.error(
        "Failed to update subscription plan:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update subscription plan."
      );
    } finally {
      setSavingPlan(false);
      setEditingPlan(null);
    }
  };

  // Save Support Settings
  const handleSaveSupportSettings = () => {
    localStorage.setItem(
      "superAdminSupportSettings",
      JSON.stringify({
        supportEmail,
        supportPhone,
        ticketSystem,
        liveChat,
        knowledgeBase,
      })
    );

    alert("✓ Support settings saved successfully!");
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          {
            key: "system",
            label: "System Settings",
            icon: Settings,
          },
          {
            key: "plans",
            label: "Subscription Plans",
            icon: Package,
          },
          {
            key: "email",
            label: "Email Templates",
            icon: Mail,
          },
          {
            key: "support",
            label: "Support Settings",
            icon: MessageSquare,
          },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SYSTEM SETTINGS */}
      {activeTab === "system" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">
              System Settings
            </h3>

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

              <p className="text-sm font-medium">
                Loading System Settings from MongoDB...
              </p>
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

                    handleSaveSystemSettings({
                      backupFrequency: val,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">
                    Manual / On-Demand Only
                  </option>
                  <option value="disabled">
                    Disabled / Never
                  </option>
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
                  onChange={(e) =>
                    setMaxLoginAttempts(e.target.value)
                  }
                  onBlur={() => {
                    const parsed =
                      parseInt(maxLoginAttempts, 10) || 5;

                    handleSaveSystemSettings({
                      maxLoginAttempts: parsed,
                    });
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

                    handleSaveSystemSettings({
                      maintenanceMode: nextVal,
                    });
                  }}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${
                    maintenanceMode
                      ? "bg-blue-600"
                      : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      maintenanceMode ? "right-1" : "left-1"
                    }`}
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

                    handleSaveSystemSettings({
                      autoBackup: nextVal,
                    });
                  }}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${
                    autoBackup
                      ? "bg-blue-600"
                      : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      autoBackup ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Debug Mode */}
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Debug Mode
                  </p>

                  <p className="text-xs text-slate-500">
                    Enable detailed error logging
                  </p>
                </div>

                <button
                  onClick={() => {
                    const nextVal = !debugMode;

                    setDebugMode(nextVal);

                    handleSaveSystemSettings({
                      debugMode: nextVal,
                    });
                  }}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${
                    debugMode
                      ? "bg-blue-600"
                      : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      debugMode ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <Btn
                variant="primary"
                onClick={() => handleSaveSystemSettings()}
                disabled={systemSaving}
                icon={
                  systemSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )
                }
              >
                {systemSaving
                  ? "Saving..."
                  : "Save System Settings"}
              </Btn>
            </div>
          )}
        </Card>
      )}

      {/* SUBSCRIPTION PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Manage Subscription Plans
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Create, update and manage SmartBill subscription plans.
                </p>
              </div>

              {loadingPlans && (
                <span className="text-sm text-slate-500">
                  Loading...
                </span>
              )}
            </div>

            {planError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {planError}
              </div>
            )}

            {loadingPlans ? (
              <div className="py-10 text-center text-slate-500">
                Loading subscription plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                No subscription plans found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">
                        {plan.name}
                      </h4>

                      <Badge
                        label={plan.status}
                        variant={
                          plan.status === "active"
                            ? "green"
                            : "gray"
                        }
                      />
                    </div>

                    <p className="text-2xl font-bold text-blue-600 mt-3">
                      ₹{Number(plan.price).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-slate-500">
                      per {plan.billingCycle || "month"}
                    </p>

                    <div className="mt-4 space-y-1">
                      <p className="text-xs text-slate-600">
                        Businesses:{" "}
                        {plan.maxBusinesses === Infinity ||
                        plan.maxBusinesses === "Infinity"
                          ? "Unlimited"
                          : plan.maxBusinesses}
                      </p>

                      <p className="text-xs text-slate-600">
                        Users:{" "}
                        {plan.maxUsers === Infinity ||
                        plan.maxUsers === "Infinity"
                          ? "Unlimited"
                          : plan.maxUsers}
                      </p>

                      <p className="text-xs text-slate-600">
                        Invoices/month:{" "}
                        {plan.maxInvoicesPerMonth === Infinity ||
                        plan.maxInvoicesPerMonth === "Infinity"
                          ? "Unlimited"
                          : plan.maxInvoicesPerMonth}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-700 mb-2">
                        Features
                      </p>

                      <div className="space-y-1">
                        {plan.features &&
                          Object.entries(plan.features)
                            .filter(([, enabled]) => enabled)
                            .map(([feature]) => (
                              <p
                                key={feature}
                                className="text-xs text-slate-500"
                              >
                                ✓{" "}
                                {feature
                                  .replace(
                                    /([A-Z])/g,
                                    " $1"
                                  )
                                  .replace(/^./, (str) =>
                                    str.toUpperCase()
                                  )}
                              </p>
                            ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        disabled={savingPlan}
                      >
                        {editingPlan === plan._id
                          ? "Updating..."
                          : "Edit"}
                      </Btn>

                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeletePlan(plan._id)
                        }
                        disabled={
                          deletingPlanId === plan._id
                        }
                      >
                        {deletingPlanId === plan._id
                          ? "Deleting..."
                          : "Delete"}
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-medium text-slate-900 mb-3">
                Add New Plan
              </h4>

              <div className="space-y-3">
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) =>
                    setNewPlanName(e.target.value)
                  }
                  placeholder="Plan Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <input
                  type="number"
                  value={newPlanPrice}
                  onChange={(e) =>
                    setNewPlanPrice(e.target.value)
                  }
                  placeholder="Price (e.g. 999)"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <Btn
                  variant="primary"
                  onClick={handleAddPlan}
                  disabled={savingPlan}
                  icon={<Plus className="w-4 h-4" />}
                >
                  {savingPlan
                    ? "Adding Plan..."
                    : "Add Plan"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* EMAIL TEMPLATES */}
      {activeTab === "email" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Email Templates</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage automated system emails, subjects, body content, and active status.
              </p>
            </div>
            <Btn
              variant="primary"
              onClick={() => handleSaveEmailSettings()}
              icon={emailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              disabled={emailSaving}
            >
              {emailSaving ? "Saving..." : "Save Email Templates"}
            </Btn>
          </div>

          <div className="space-y-4">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{template.name}</p>
                    <Badge
                      label={template.status === "active" ? "Active" : "Inactive"}
                      variant={template.status === "active" ? "green" : "gray"}
                    />
                  </div>
                  <p className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md inline-block">
                    <span className="font-semibold text-slate-400">Subject:</span> {template.subject}
                  </p>
                  {template.body && (
                    <p className="text-xs text-slate-500 line-clamp-1 italic">
                      "{template.body.replace(/\n/g, " ")}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-between md:justify-end">
                  {/* Functional Toggle Switch */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-600">
                      {template.status === "active" ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleTemplateStatus(template.id)}
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        template.status === "active" ? "bg-blue-600" : "bg-slate-300"
                      }`}
                      title={`Click to ${template.status === "active" ? "disable" : "enable"} ${template.name}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                          template.status === "active" ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate({ ...template })}
                  >
                    Edit Template
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* EDIT TEMPLATE MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Edit Email Template
              </h4>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModalTemplate(selectedTemplate);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={selectedTemplate.name}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Body Content
                </label>
                <textarea
                  rows={5}
                  value={selectedTemplate.body || ""}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, body: e.target.value })
                  }
                  placeholder="Enter template body text..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-slate-800"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;user_name&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;invoice_no&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;amount&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;reset_link&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;expiry_date&#125;</code>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-800">Template Status</p>
                  <p className="text-xs text-slate-500">Enable or disable this notification email</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">
                    {selectedTemplate.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        status: selectedTemplate.status === "active" ? "inactive" : "active",
                      })
                    }
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      selectedTemplate.status === "active" ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        selectedTemplate.status === "active" ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Btn
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Cancel
                </Btn>
                <Btn type="submit" variant="primary" icon={<Mail className="w-4 h-4" />}>
                  Save Template
                </Btn>
              </div>
            </form>
          </div>
        </div>
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
                onChange={(e) =>
                  setSupportEmail(e.target.value)
                }
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
                onChange={(e) =>
                  setSupportPhone(e.target.value)
                }
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
                onClick={() =>
                  setTicketSystem(!ticketSystem)
                }
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${
                  ticketSystem
                    ? "bg-blue-600"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${
                    ticketSystem ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Live Chat
                </p>

                <p className="text-xs text-slate-500">
                  Enable live chat support
                </p>
              </div>

              <button
                onClick={() => setLiveChat(!liveChat)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${
                  liveChat
                    ? "bg-blue-600"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${
                    liveChat ? "right-1" : "left-1"
                  }`}
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
                onClick={() =>
                  setKnowledgeBase(!knowledgeBase)
                }
                className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${
                  knowledgeBase
                    ? "bg-blue-600"
                    : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${
                    knowledgeBase ? "right-1" : "left-1"
                  }`}
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