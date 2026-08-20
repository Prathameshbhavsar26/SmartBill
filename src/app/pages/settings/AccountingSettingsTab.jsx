import React, { useState, useEffect } from "react";
import { Landmark, Check, Loader2, Sparkles } from "lucide-react";
import { Select, Btn } from "../../components/common/ui";

const CleanToggle = ({ title, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-4 group cursor-pointer" onClick={onChange}>
    <div className="pr-8">
      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
        {title}
      </p>
      {description && (
        <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <div
      className={`w-10 h-5.5 rounded-full relative flex-shrink-0 transition-colors mt-0.5 ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${
          checked ? "right-0.5" : "left-0.5"
        }`}
      />
    </div>
  </div>
);

const Section = ({ title, description, children, isLast }) => (
  <div className={`flex flex-col md:flex-row gap-8 py-8 ${!isLast ? "border-b border-slate-100" : ""}`}>
    <div className="md:w-1/3 flex-shrink-0">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
    </div>
    <div className="md:w-2/3 flex-1 bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60">
      {children}
    </div>
  </div>
);

export default function AccountingSettingsTab() {
  const [settings, setSettings] = useState({
    fiscalYearStart: "April",
    baseCurrency: "INR (₹)",
    autoCreateCustomerLedger: true,
    autoCreateSupplierLedger: true,
    strictNegativeCash: true,
    enableCostCenters: false,
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("smartbill_accountingSettings");
      if (stored) {
        setSettings({ ...settings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.warn("Failed to load settings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setShowSuccess(false);
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
    setShowSuccess(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("smartbill_accountingSettings", JSON.stringify(settings));
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Accounting Settings</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage your financial rules and automation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {showSuccess && (
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
              <Check className="w-4 h-4" /> Saved Successfully
            </span>
          )}
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[130px] justify-center bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
            icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
        </div>
      </div>

      {/* Settings Sections - Split Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-8 py-2">
        
        <Section 
          title="General Settings" 
          description="Set your base currency and financial year start month for reporting purposes."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Financial Year Starts From"
              value={settings.fiscalYearStart}
              onChange={(v) => handleChange("fiscalYearStart", v)}
              options={["January", "April", "July", "October"]}
            />
            <Select
              label="Base Currency"
              value={settings.baseCurrency}
              onChange={(v) => handleChange("baseCurrency", v)}
              options={["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)"]}
            />
          </div>
        </Section>

        <Section 
          title="Ledger Automation" 
          description="Automatically create accounts in your ledger when adding new contacts to reduce manual work."
        >
          <div className="divide-y divide-slate-100/80">
            <CleanToggle
              title="Auto-Create Customer Accounts"
              description="Create an Accounts Receivable ledger instantly when a new customer is added."
              checked={settings.autoCreateCustomerLedger}
              onChange={() => handleToggle("autoCreateCustomerLedger")}
            />
            <CleanToggle
              title="Auto-Create Supplier Accounts"
              description="Create an Accounts Payable ledger instantly when a new supplier is added."
              checked={settings.autoCreateSupplierLedger}
              onChange={() => handleToggle("autoCreateSupplierLedger")}
            />
          </div>
        </Section>

        <Section 
          title="Rules & Tracking" 
          description="Enforce accounting rules and enable advanced tracking features like cost centers."
          isLast={true}
        >
          <div className="divide-y divide-slate-100/80">
            <CleanToggle
              title="Strict Negative Cash Rule"
              description="Prevent any transaction that would cause your cash or bank balance to go below zero."
              checked={settings.strictNegativeCash}
              onChange={() => handleToggle("strictNegativeCash")}
            />
            <CleanToggle
              title="Enable Cost Centers"
              description="Track revenue and expenses across multiple departments or branches."
              checked={settings.enableCostCenters}
              onChange={() => handleToggle("enableCostCenters")}
            />
          </div>
        </Section>

      </div>
    </div>
  );
}
