import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Banknote,
  QrCode,
  Landmark,
  Receipt,
  Wallet,
  Users,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Smartphone,
  Star,
  RotateCcw,
  ShoppingCart,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, Modal } from "../../../components/common/ui";
import {
  fetchPaymentSettings,
  savePaymentSettings,
} from "../../../api/paymentSettingsAPI";

const DEFAULT_METHODS = [
  {
    id: "cash",
    name: "Cash",
    icon: Banknote,
    description: "Accept physical cash currency with instant receipting",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "upi",
    name: "UPI & QR Code",
    icon: QrCode,
    description: "Instant UPI payments via GPay, PhonePe, Paytm, BHIM & QR",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    icon: CreditCard,
    description: "POS terminal & EDC card swiping for Visa, Mastercard, RuPay",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: Landmark,
    description: "Direct wire transfers via NEFT, RTGS, and IMPS",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "cheque",
    name: "Cheque / DD",
    icon: Receipt,
    description: "Bank cheques and demand drafts with clearance tracking",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "wallet",
    name: "Digital Wallet",
    icon: Wallet,
    description: "Prepaid wallets like Paytm, Amazon Pay, Mobikwik",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "credit",
    name: "Store Credit / Khata",
    icon: Users,
    description: "Credit ledger for regular customers with balance tracking",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
];

const INITIAL_SETTINGS = {
  sales: ["Cash", "UPI & QR Code", "Credit / Debit Card", "Store Credit / Khata"],
  purchase: ["Cash", "Bank Transfer", "Cheque / DD", "Credit / Debit Card"],
  expenses: ["Cash", "UPI & QR Code", "Bank Transfer", "Credit / Debit Card"],
  defaultSalesMethod: "Cash",
  upiSettings: {
    enabled: true,
    upiId: "smartbill@okaxis",
    payeeName: "SmartBill Enterprise Store",
    showDynamicQrOnInvoice: true,
  },
  bankSettings: {
    enabled: true,
    bankName: "HDFC Bank",
    accountHolderName: "SmartBill Enterprise Store Pvt Ltd",
    accountNumber: "50200045892147",
    accountType: "Current",
    ifscCode: "HDFC0001234",
    branchName: "Industrial Area Branch",
    showOnInvoice: true,
  },
  transactionRules: {
    cashRounding: true,
    allowSplitPayment: true,
    requireReferenceNumber: false,
  },
  customMethods: [],
};

// Generates a mock QR SVG image URL
function generateQRPlaceholder(upiId, name) {
  const data = encodeURIComponent(`upi://pay?pa=${upiId}&pn=${name}&cu=INR`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}&margin=6`;
}

export default function PaymentMethodSettings() {
  const [activeChannel, setActiveChannel] = useState("sales"); // 'sales' | 'purchase' | 'expenses'
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("smartbill_payment_settings");
      if (stored) return { ...INITIAL_SETTINGS, ...JSON.parse(stored) };

      const legacy = localStorage.getItem("paymentMethods");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return {
          ...INITIAL_SETTINGS,
          sales: parsed.sales || INITIAL_SETTINGS.sales,
          purchase: parsed.purchase || INITIAL_SETTINGS.purchase,
          expenses: parsed.expenses || INITIAL_SETTINGS.expenses,
        };
      }
    } catch (_) {}
    return INITIAL_SETTINGS;
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customMethodForm, setCustomMethodForm] = useState({
    name: "",
    description: "",
    channels: ["sales"],
  });

  // Load from MongoDB backend on mount
  useEffect(() => {
    let isMounted = true;
    fetchPaymentSettings()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.paymentSettings) {
          const s = {
            ...INITIAL_SETTINGS,
            ...res.paymentSettings,
            upiSettings: {
              ...INITIAL_SETTINGS.upiSettings,
              ...(res.paymentSettings.upiSettings || {}),
            },
            bankSettings: {
              ...INITIAL_SETTINGS.bankSettings,
              ...(res.paymentSettings.bankSettings || {}),
            },
            transactionRules: {
              ...INITIAL_SETTINGS.transactionRules,
              ...(res.paymentSettings.transactionRules || {}),
            },
          };
          setSettings(s);
          localStorage.setItem("smartbill_payment_settings", JSON.stringify(s));
          localStorage.setItem(
            "paymentMethods",
            JSON.stringify({
              sales: s.sales,
              purchase: s.purchase,
              expenses: s.expenses,
            })
          );
        }
      })
      .catch((err) => {
        console.warn("Could not fetch payment settings from server, using cached:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save to MongoDB backend
      const res = await savePaymentSettings(settings);
      const saved = res?.paymentSettings || settings;

      // 2. Cache in localStorage for offline & instant component lookup
      localStorage.setItem("smartbill_payment_settings", JSON.stringify(saved));
      localStorage.setItem(
        "paymentMethods",
        JSON.stringify({
          sales: saved.sales,
          purchase: saved.purchase,
          expenses: saved.expenses,
        })
      );

      // 3. Dispatch global update event
      window.dispatchEvent(new Event("paymentSettingsUpdated"));

      toast.success("Payment method settings saved permanently to database!");
    } catch (err) {
      console.error("Save error:", err);
      // Fallback local persistence
      localStorage.setItem("smartbill_payment_settings", JSON.stringify(settings));
      window.dispatchEvent(new Event("paymentSettingsUpdated"));
      toast.success("Payment settings updated locally.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset payment method settings to system defaults?")) {
      setSettings(INITIAL_SETTINGS);
      try {
        await savePaymentSettings(INITIAL_SETTINGS);
      } catch (_) {}
      localStorage.setItem("smartbill_payment_settings", JSON.stringify(INITIAL_SETTINGS));
      window.dispatchEvent(new Event("paymentSettingsUpdated"));
      toast.info("Reset to default payment configurations.");
    }
  };

  const toggleMethodInChannel = (channel, methodName) => {
    setSettings((prev) => {
      const current = prev[channel] || [];
      const exists = current.includes(methodName);

      if (exists && channel === "sales" && prev.defaultSalesMethod === methodName) {
        toast.warning(`Cannot disable "${methodName}" because it is selected as the default POS method.`);
        return prev;
      }

      const updated = exists
        ? current.filter((m) => m !== methodName)
        : [...current, methodName];

      return {
        ...prev,
        [channel]: updated,
      };
    });
  };

  const handleAddCustomMethod = (e) => {
    e.preventDefault();
    const name = customMethodForm.name.trim();
    if (!name) {
      toast.error("Please enter a payment method name.");
      return;
    }

    const newCustomMethod = {
      id: `custom_${Date.now()}`,
      name,
      description: customMethodForm.description.trim() || "Custom payment mode",
      channels: customMethodForm.channels,
    };

    setSettings((prev) => {
      const customMethods = [...(prev.customMethods || []), newCustomMethod];
      const next = { ...prev, customMethods };

      customMethodForm.channels.forEach((ch) => {
        if (!next[ch].includes(name)) {
          next[ch] = [...next[ch], name];
        }
      });

      return next;
    });

    setShowAddCustomModal(false);
    setCustomMethodForm({ name: "", description: "", channels: ["sales"] });
    toast.success(`Custom method "${name}" added. Click "Save Changes" to apply.`);
  };

  const handleDeleteCustomMethod = (methodId, methodName) => {
    setSettings((prev) => ({
      ...prev,
      customMethods: (prev.customMethods || []).filter((c) => c.id !== methodId),
      sales: prev.sales.filter((m) => m !== methodName),
      purchase: prev.purchase.filter((m) => m !== methodName),
      expenses: prev.expenses.filter((m) => m !== methodName),
      defaultSalesMethod:
        prev.defaultSalesMethod === methodName ? "Cash" : prev.defaultSalesMethod,
    }));
    toast.info(`Removed "${methodName}". Click "Save Changes" to persist.`);
  };

  const allMethods = [
    ...DEFAULT_METHODS,
    ...(settings.customMethods || []).map((cm) => ({
      id: cm.id,
      name: cm.name,
      icon: CreditCard,
      description: cm.description,
      color: "bg-slate-100 text-slate-700 border-slate-200",
      isCustom: true,
    })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
        <span className="text-sm font-medium">Loading payment configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Payment Methods & Gateway Settings
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure accepted payment modes, default POS checkout options, dynamic UPI QR codes, and bank details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Btn
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Btn>

          <Btn
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 mr-1" />
            )}
            {saving ? "Saving Changes..." : "Save Changes"}
          </Btn>
        </div>
      </div>

      {/* ── Section 1: Payment Channels Matrix ── */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Accepted Payment Channels
            </h4>
            <p className="text-xs text-slate-500">
              Select which payment options are active for each transaction type.
            </p>
          </div>

          <Btn
            variant="outline"
            size="sm"
            onClick={() => setShowAddCustomModal(true)}
            className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Custom Method
          </Btn>
        </div>

        {/* Segmented Channel Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 w-fit">
          <button
            type="button"
            onClick={() => setActiveChannel("sales")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeChannel === "sales"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Sales & POS ({settings.sales.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel("purchase")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeChannel === "purchase"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Purchase Orders ({settings.purchase.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel("expenses")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeChannel === "expenses"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Expenses & Bills ({settings.expenses.length})</span>
          </button>
        </div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {allMethods.map((m) => {
            const Icon = m.icon || CreditCard;
            const isEnabled = (settings[activeChannel] || []).includes(m.name);
            const isDefault = activeChannel === "sales" && settings.defaultSalesMethod === m.name;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  isEnabled
                    ? "bg-white border-gray-200 shadow-2xs hover:border-gray-300"
                    : "bg-gray-50/70 border-gray-200 opacity-60 hover:opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{m.name}</span>
                        {m.isCustom && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-medium ${
                          isEnabled ? "text-emerald-600 font-semibold" : "text-slate-400"
                        }`}
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleMethodInChannel(activeChannel, m.name)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                {/* Sales Default Tag / Action */}
                {activeChannel === "sales" && isEnabled && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    {isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                        <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                        Default in POS
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSettings((prev) => ({ ...prev, defaultSalesMethod: m.name }));
                          toast.success(`"${m.name}" set as default POS payment method.`);
                        }}
                        className="text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        Set as default
                      </button>
                    )}

                    {m.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomMethod(m.id, m.name)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="Delete custom method"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Section 2: UPI & Dynamic QR Code Configuration ── */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                UPI & Dynamic QR Code Configuration
              </h4>
              <p className="text-xs text-slate-500">
                Display verified UPI QR codes on printed and digital invoices for instant payments.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.upiSettings.enabled}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  upiSettings: { ...prev.upiSettings, enabled: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-blue-600"
            />
            <span className="text-xs font-semibold text-slate-700">Enable UPI QR on Invoices</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start pt-1">
          {/* UPI Form Fields */}
          <div className="lg:col-span-2 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Business UPI ID (VPA) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={settings.upiSettings.upiId}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      upiSettings: { ...prev.upiSettings, upiId: e.target.value.toLowerCase().trim() },
                    }))
                  }
                  placeholder="e.g. yourbusiness@okicici"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Accepts GPay, PhonePe, Paytm, BHIM, Amazon Pay, and all Indian banking UPI apps.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Payee Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.upiSettings.payeeName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    upiSettings: { ...prev.upiSettings, payeeName: e.target.value },
                  }))
                }
                placeholder="e.g. Acme Enterprises Pvt Ltd"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.upiSettings.showDynamicQrOnInvoice}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      upiSettings: { ...prev.upiSettings, showDynamicQrOnInvoice: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Auto-encode exact bill amount into invoice QR codes
                </span>
              </label>
            </div>
          </div>

          {/* Live QR Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Live QR Preview on Bills
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs inline-block mx-auto">
              <img
                src={generateQRPlaceholder(
                  settings.upiSettings.upiId || "smartbill@upi",
                  settings.upiSettings.payeeName || "SmartBill"
                )}
                alt="UPI QR Code"
                className="w-32 h-32 mx-auto"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {settings.upiSettings.payeeName || "Your Business Name"}
              </p>
              <p className="text-[11px] text-blue-600 font-mono truncate">
                {settings.upiSettings.upiId || "upi_id@bank"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Verified UPI VPA
            </span>
          </div>
        </div>
      </Card>

      {/* ── Section 3: Bank Account Details for Invoices ── */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Bank Account Details (Printed on Invoices)
              </h4>
              <p className="text-xs text-slate-500">
                Provide your primary business bank account for wire transfers and B2B remittances.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.bankSettings.showOnInvoice}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, showOnInvoice: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-blue-600"
            />
            <span className="text-xs font-semibold text-slate-700">Print Bank Info on Invoices</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Bank Name</label>
            <input
              type="text"
              value={settings.bankSettings.bankName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, bankName: e.target.value },
                }))
              }
              placeholder="e.g. HDFC Bank, SBI, ICICI"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Account Holder Name</label>
            <input
              type="text"
              value={settings.bankSettings.accountHolderName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, accountHolderName: e.target.value },
                }))
              }
              placeholder="e.g. SmartBill Enterprises"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Account Type</label>
            <select
              value={settings.bankSettings.accountType}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, accountType: e.target.value },
                }))
              }
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 bg-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="Current">Current Account</option>
              <option value="Savings">Savings Account</option>
              <option value="Overdraft">Overdraft (OD) Account</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Account Number</label>
            <input
              type="text"
              value={settings.bankSettings.accountNumber}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, accountNumber: e.target.value.trim() },
                }))
              }
              placeholder="e.g. 50200012345678"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">IFSC Code</label>
            <input
              type="text"
              value={settings.bankSettings.ifscCode}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, ifscCode: e.target.value.toUpperCase().trim() },
                }))
              }
              placeholder="e.g. HDFC0001234"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Branch Name</label>
            <input
              type="text"
              value={settings.bankSettings.branchName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  bankSettings: { ...prev.bankSettings, branchName: e.target.value },
                }))
              }
              placeholder="e.g. MG Road Branch"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* ── Section 4: Transaction & Checkout Rules ── */}
      <Card className="p-5 space-y-3">
        <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-gray-100">
          Transaction & Checkout Rules
        </h4>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-800">Enable Cash Rounding</p>
              <p className="text-[11px] text-slate-500">Automatically rounds cash total to nearest whole rupee during billing</p>
            </div>
            <input
              type="checkbox"
              checked={settings.transactionRules.cashRounding}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  transactionRules: { ...prev.transactionRules, cashRounding: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-800">Allow Split / Multi-Mode Payment</p>
              <p className="text-[11px] text-slate-500">Enable customers to split bill between Cash + UPI or Card simultaneously</p>
            </div>
            <input
              type="checkbox"
              checked={settings.transactionRules.allowSplitPayment}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  transactionRules: { ...prev.transactionRules, allowSplitPayment: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-800">Require Transaction Reference / UTR Number</p>
              <p className="text-[11px] text-slate-500">Prompt cashier to enter reference number for Card and UPI transactions</p>
            </div>
            <input
              type="checkbox"
              checked={settings.transactionRules.requireReferenceNumber}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  transactionRules: { ...prev.transactionRules, requireReferenceNumber: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-blue-600"
            />
          </label>
        </div>
      </Card>

      {/* ── Footer Save Button ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Btn
          variant="outline"
          onClick={handleReset}
          className="text-xs text-slate-600"
        >
          Reset Defaults
        </Btn>
        <Btn
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-semibold px-6"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-1.5" />
          )}
          {saving ? "Saving Changes..." : "Save Payment Settings"}
        </Btn>
      </div>

      {/* ── Custom Payment Method Modal ── */}
      {showAddCustomModal && (
        <Modal title="Add Custom Payment Method" onClose={() => setShowAddCustomModal(false)}>
          <form onSubmit={handleAddCustomMethod} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Method Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customMethodForm.name}
                onChange={(e) => setCustomMethodForm({ ...customMethodForm, name: e.target.value })}
                placeholder="e.g. Sodexo / Meal Card, EMI, Gift Voucher"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Short Description (Optional)
              </label>
              <input
                type="text"
                value={customMethodForm.description}
                onChange={(e) => setCustomMethodForm({ ...customMethodForm, description: e.target.value })}
                placeholder="e.g. Card payment via Sodexo terminal"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md text-slate-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Enable for Transaction Types
              </label>
              <div className="space-y-2">
                {[
                  { key: "sales", label: "Sales & Invoices (POS)" },
                  { key: "purchase", label: "Purchase Orders" },
                  { key: "expenses", label: "Expenses & Utilities" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customMethodForm.channels.includes(item.key)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...customMethodForm.channels, item.key]
                          : customMethodForm.channels.filter((ch) => ch !== item.key);
                        setCustomMethodForm({ ...customMethodForm, channels: next });
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-xs text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <Btn
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCustomModal(false)}
              >
                Cancel
              </Btn>
              <Btn type="submit" variant="primary" size="sm">
                Add Payment Method
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
