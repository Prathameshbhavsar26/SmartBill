import React, { useState, useEffect } from 'react';
import { Input, Btn, Select } from "../../components/common/ui";
import { Check, Loader2 } from "lucide-react";
import InvoicePreview from "../../components/common/InvoicePreview";
import { getInvoiceSettings, updateInvoiceSettings } from "../../api/invoiceSettingsAPI";
import { getProfile } from "../../api/authAPI";

export default function InvoiceSettingsTab() {
  const [settings, setSettings] = useState({
    invoicePrefix: "INV",
    startingNumber: 1,
    invoiceTitle: "Tax Invoice",
    showCustomerName: true,
    showBillingAddress: true,
    showCustomerGSTIN: true,
    showHSN: true,
    showDescription: true,
    showDiscount: true,
    showTax: true,
    showBankDetails: false,
    showUPIQR: false,
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
    invoiceFooter: "Thank you for your business!",
    termsAndConditions: "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged on overdue payments.",
    showSignature: false,
    signatureUrl: "",
    template: "Classic",
    primaryColor: "#2563eb",
    paperSize: "A4",
    financialYearWise: true,
    autoNumbering: true
  });
  
  const [businessInfo, setBusinessInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getProfile();
        if (profileRes?.user) setBusinessInfo(profileRes.user);
        
        const settingsRes = await getInvoiceSettings();
        if (settingsRes?.settings) {
          setSettings(prev => ({...prev, ...settingsRes.settings}));
        }
      } catch (err) {
        console.warn("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateInvoiceSettings(settings);
      alert("✓ Invoice settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Signature size must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleChange("signatureUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  const ToggleSwitch = ({ label, desc, field }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => handleToggle(field)}
        className={`w-10 h-6 rounded-full relative transition-colors ${settings[field] ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[field] ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Toggle */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Invoice Customization</h2>
          <p className="text-sm text-slate-500">Configure how your invoice looks when printed or shared.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Live Preview</span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`w-12 h-6 rounded-full relative transition-colors ${showPreview ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showPreview ? "right-1" : "left-1"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-250px)]">
        {/* Left Column: Settings */}
        <div className={`overflow-y-auto pr-4 space-y-6 pb-20 transition-all ${showPreview ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
          
          {/* General Settings */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">General Invoice Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invoice Title" value={settings.invoiceTitle} onChange={(v) => handleChange("invoiceTitle", v)} />
            <Input label="Invoice Prefix" value={settings.invoicePrefix} onChange={(v) => handleChange("invoicePrefix", v)} />
            <Input label="Starting Number" type="number" value={settings.startingNumber} onChange={(v) => handleChange("startingNumber", Number(v))} />
            <Select label="Print Paper Size" value={settings.paperSize} onChange={(v) => handleChange("paperSize", v)} options={["A4", "A5", "Thermal 80mm", "Thermal 58mm"]} />
          </div>
          <div className="mt-4">
            <ToggleSwitch label="Financial Year Numbering" desc="Include /YY-YY/ in invoice numbers" field="financialYearWise" />
          </div>
        </div>

        {/* Column Display Options */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Column Display Options</h3>
          <div className="space-y-1">
            <ToggleSwitch label="Show HSN Code" desc="Render HSN column" field="showHSN" />
            <ToggleSwitch label="Show Item Description" desc="Show a description row below product" field="showDescription" />
            <ToggleSwitch label="Show Discount" desc="Render discount column" field="showDiscount" />
            <ToggleSwitch label="Show Tax Amount" desc="Render individual tax column" field="showTax" />
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Customer Information Display</h3>
          <div className="space-y-1">
            <ToggleSwitch label="Show Customer Name" desc="" field="showCustomerName" />
            <ToggleSwitch label="Show Billing Address" desc="" field="showBillingAddress" />
            <ToggleSwitch label="Show Customer GSTIN" desc="" field="showCustomerGSTIN" />
          </div>
        </div>

        {/* Bank & UPI Details */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Payment & Bank Details</h3>
          <ToggleSwitch label="Include Firm Bank Details" desc="Print bank details at invoice bottom" field="showBankDetails" />
          
          {settings.showBankDetails && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 rounded-xl border">
              <Input label="Bank Name" value={settings.bankName} onChange={(v) => handleChange("bankName", v)} />
              <Input label="Account Holder" value={settings.accountHolder} onChange={(v) => handleChange("accountHolder", v)} />
              <Input label="Account Number" value={settings.accountNumber} onChange={(v) => handleChange("accountNumber", v)} />
              <Input label="IFSC Code" value={settings.ifsc} onChange={(v) => handleChange("ifsc", v)} />
            </div>
          )}

          <div className="mt-4">
             <ToggleSwitch label="Include UPI QR & ID" desc="Show UPI details for quick payment" field="showUPIQR" />
             {settings.showUPIQR && (
               <div className="mt-4 p-4 bg-slate-50 rounded-xl border">
                 <Input label="UPI ID" value={settings.upiId} onChange={(v) => handleChange("upiId", v)} />
               </div>
             )}
          </div>
        </div>

        {/* Footer, Notes & Terms */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Footer & Terms</h3>
          <div className="space-y-4">
            <Input label="Invoice Footer Message" value={settings.invoiceFooter} onChange={(v) => handleChange("invoiceFooter", v)} />
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Terms & Conditions</label>
              <textarea 
                className="w-full border rounded-lg p-2 text-sm" 
                rows="3"
                value={settings.termsAndConditions}
                onChange={(e) => handleChange("termsAndConditions", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Authorized Signature</h3>
          <ToggleSwitch label="Show Signature Image" desc="Print signature at the bottom right" field="showSignature" />
          
          {settings.showSignature && (
            <div className="mt-4">
              <input type="file" accept="image/*" onChange={handleSignatureUpload} className="text-sm" />
              {settings.signatureUrl && (
                <img src={settings.signatureUrl} alt="Signature" className="h-16 mt-2 object-contain border p-1 rounded bg-slate-50" />
              )}
            </div>
          )}
        </div>

        {/* Appearance / Theme */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Appearance</h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {["Classic", "Modern", "Minimal"].map((t) => (
              <button
                key={t}
                onClick={() => handleChange("template", t)}
                className={`border-2 rounded-xl p-3 text-center transition-all ${
                  settings.template === t
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="h-8 bg-slate-100 rounded mb-2" />
                <p className="text-xs font-medium text-slate-700">{t}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <label className="text-sm font-medium text-slate-700">Primary Color:</label>
             <input type="color" value={settings.primaryColor} onChange={(e) => handleChange("primaryColor", e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex gap-3">
          <Btn variant="primary" className="flex-1" onClick={handleSave} disabled={saving} icon={saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}>
            {saving ? "Saving..." : "Save Invoice Settings"}
          </Btn>
        </div>
      </div>

      {/* Right Column: Live Preview */}
      {showPreview && (
        <div className="w-1/2 sticky top-0 h-full overflow-y-auto">
          <InvoicePreview settings={settings} businessInfo={businessInfo} />
        </div>
      )}
      </div>
    </div>
  );
}
