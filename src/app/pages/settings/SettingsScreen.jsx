import { useState, useEffect } from "react";
import { useCustomization } from "../../hooks/useCustomization";
import {
  Building2,
  Percent,
  FileText,
  Receipt,
  Users,
  Package2,
  Landmark,
  Settings,
  AlertCircle,
  Shield,
  CreditCard,
  Lock,
  Mail,
  Phone,
  MapPin,
  Upload,
  Check,
} from "lucide-react";
import { Input, Btn, Select } from "../../components/common/ui";
import {
  fetchBusinessSettings,
  saveBusinessSettings,
} from "../../api/businessSettingsAPI";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("business");

  // =========================================================
  // BUSINESS PROFILE
  // =========================================================
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    businessType: "Retail",
    financialYear: "April",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  useEffect(() => {
  const loadBusinessSettings = async () => {
    try {
      const response = await fetchBusinessSettings();

      if (response?.businessSettings) {
        setBusinessInfo(response.businessSettings);
      }
    } catch (error) {
      console.error(
        "Failed to load business settings:",
        error.response?.data?.message || error.message,
      );
    }
  };

  loadBusinessSettings();
}, []);

  const handleBusinessChange = (field, value) => {
    setBusinessInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveBusiness = async () => {
  try {
    const response = await saveBusinessSettings(businessInfo);

    if (response?.businessSettings) {
      setBusinessInfo(response.businessSettings);
    }

    alert("Business Information Saved Successfully!");
  } catch (error) {
    console.error(
      "Failed to save business information:",
      error.response?.data?.message || error.message,
    );

    alert(
      error.response?.data?.message ||
        "Failed to save business information.",
    );
  }
};

  // =========================================================
  // GST & TAX
  // =========================================================
  const [gstSettings, setGstSettings] = useState({
    gstin: "",
    pan: "",
    registrationType: "Regular",
    defaultRate: "18",
    enableIgst: true,
    enableCess: false,
    enableRcm: false,
    isComposition: false,
  });

  const handleGstChange = (field, value) => {
    setGstSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveGstSettings = () => {
    localStorage.setItem("gstSettings", JSON.stringify(gstSettings));
    alert("✓ GST settings saved successfully!");
  };

  // =========================================================
  // TRANSACTION SETTINGS
  // =========================================================
  const [transactionSettings, setTransactionSettings] = useState({
    salePrice: "Retail Price",
    discountType: "Percentage",
    passcodeRequired: false,
    enableCashDiscount: true,
    linkOrders: true,
  });

  const handleTransactionChange = (field, value) => {
    setTransactionSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveTransactionSettings = () => {
    localStorage.setItem(
      "transactionSettings",
      JSON.stringify(transactionSettings),
    );
    alert("✓ Transaction settings saved successfully!");
  };

  // =========================================================
  // INVOICE SETTINGS
  // =========================================================
  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: "INV-",
    startingNumber: "1001",
    invoiceFooter: "Thank you for your business!",
    paperSize: "Regular A4",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    template: "Modern",
    showHsn: true,
    showDesc: true,
    showBank: false,
  });

  const handleInvoiceChange = (field, value) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveInvoiceSettings = () => {
    localStorage.setItem(
      "invoiceSettings",
      JSON.stringify(invoiceSettings),
    );
    alert("✓ Invoice settings saved successfully!");
  };

  // =========================================================
  // PARTY MANAGEMENT
  // =========================================================
  const [partySettings, setPartySettings] = useState({
    enableGrouping: true,
    trackBalance: false,
    shippingAddress: true,
  });

  const handlePartyChange = (field) => {
    setPartySettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSavePartySettings = () => {
    localStorage.setItem("partySettings", JSON.stringify(partySettings));
    alert("✓ Party settings saved successfully!");
  };

  // =========================================================
  // ITEM & INVENTORY
  // =========================================================
  const [inventorySettings, setInventorySettings] = useState({
    stockValueFormula: "FIFO Method",
    lowStockAlert: "10 Units Remaining",
    enableSerial: false,
    enableMultiUnit: true,
    enableBarcode: true,
  });

  const handleInventoryChange = (field, value) => {
    setInventorySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInventoryToggle = (field) => {
    setInventorySettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveItemSettings = () => {
    localStorage.setItem(
      "itemSettings",
      JSON.stringify(inventorySettings),
    );
    alert("✓ Item settings saved successfully!");
  };

  // =========================================================
  // ACCOUNTING
  // =========================================================
  const [accountingSettings, setAccountingSettings] = useState({
    enableTrialBalance: true,
    autoBankImport: false,
    profitCenter: false,
  });

  const handleAccountingToggle = (field) => {
    setAccountingSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveAccountingSettings = () => {
    localStorage.setItem(
      "accountingSettings",
      JSON.stringify(accountingSettings),
    );
    alert("✓ Accounting settings saved successfully!");
  };

  // =========================================================
  // CUSTOMIZATION
  // =========================================================
  const {
    tempSettings,
    updateTempSettings,
    saveSettings,
    cancelChanges,
    resetToDefault,
    saving,
    error: customError,
    successMessage: customSuccess,
    t,
  } = useCustomization();

  // =========================================================
  // LOW STOCK ALERT
  // =========================================================
  const [lowStockSettings, setLowStockSettings] = useState({
    threshold: "10",
    emailAlerts: false,
    inAppAlerts: true,
    smsAlerts: false,
  });

  const handleLowStockChange = (field, value) => {
    setLowStockSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveLowStockSettings = () => {
    localStorage.setItem(
      "lowStockSettings",
      JSON.stringify(lowStockSettings),
    );
    alert("✓ Low stock alert settings saved successfully!");
  };

  // =========================================================
  // USERS & PERMISSIONS
  // =========================================================
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "HR Manager",
      department: "HR",
      permissions: {
        sales: true,
        purchase: true,
        inventory: true,
        accounting: true,
        settings: false,
      },
    },
    {
      id: 2,
      name: "Sales Staff",
      department: "Sales",
      permissions: {
        sales: true,
        purchase: false,
        inventory: true,
        accounting: false,
        settings: false,
      },
    },
  ]);

  const handlePermissionToggle = (empId, module) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId
          ? {
              ...emp,
              permissions: {
                ...emp.permissions,
                [module]: !emp.permissions[module],
              },
            }
          : emp,
      ),
    );
  };

  const handleSavePermissions = () => {
    localStorage.setItem(
      "employeePermissions",
      JSON.stringify(employees),
    );
    alert("✓ Users permissions saved successfully!");
  };

  // =========================================================
  // PAYMENT METHODS
  // =========================================================
  const [paymentMethods, setPaymentMethods] = useState({
    sales: ["Cash", "Card", "UPI"],
    purchase: ["Cash", "Cheque", "Bank Transfer"],
    expenses: ["Cash", "Card"],
  });

  const availablePaymentMethods = [
    "Cash",
    "Card",
    "UPI",
    "Cheque",
    "Bank Transfer",
    "Online",
    "Wallet",
  ];

  const handlePaymentMethodToggle = (type, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [type]: prev[type].includes(method)
        ? prev[type].filter((m) => m !== method)
        : [...prev[type], method],
    }));
  };

  const handleSavePaymentMethods = () => {
    localStorage.setItem(
      "paymentMethods",
      JSON.stringify(paymentMethods),
    );
    alert("✓ Payment methods saved successfully!");
  };

  // =========================================================
  // SECURITY
  // =========================================================
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,12}$/;

    return passwordRegex.test(password);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPasswordErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleUpdatePassword = () => {
    const errors = {};

    if (!validatePassword(passwordData.newPassword)) {
      errors.newPassword =
        "Password must be 8-12 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character.";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    alert("Password Updated Successfully!");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordErrors({
      newPassword: "",
      confirmPassword: "",
    });
  };

  // =========================================================
  // TABS
  // =========================================================
  const tabs = [
    { key: "business", label: "Business Profile", icon: Building2 },
    { key: "gst", label: "GST & Tax", icon: Percent },
    { key: "transaction", label: "Transaction Settings", icon: FileText },
    { key: "invoice", label: "Invoice Settings", icon: Receipt },
    { key: "party", label: "Party Management", icon: Users },
    { key: "item", label: "Item & Inventory", icon: Package2 },
    { key: "accounting", label: "Accounting & Books", icon: Landmark },
    { key: "customization", label: "Customization", icon: Settings },
    {
      key: "stockalert",
      label: "Low Stock Alert Numbers",
      icon: AlertCircle,
    },
    { key: "permissions", label: "Users Permissions", icon: Shield },
    { key: "payment", label: "Payment Methods", icon: CreditCard },
    { key: "users", label: "Security & Access", icon: Lock },
  ];

  return (
    <div className="flex gap-6">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <div className="w-56 p-3 h-fit flex-shrink-0 bg-white border rounded-xl shadow-sm">
        <nav className="space-y-0.5">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* =====================================================
          RIGHT SIDE WORKSPACE
      ===================================================== */}
      <div className="flex-1 space-y-5">
        {/* ===================================================
            BUSINESS PROFILE
        =================================================== */}
        {activeTab === "business" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Business Information
            </h3>

            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 flex-shrink-0">
                <div className="text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">
                    Upload Logo
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  value={businessInfo.businessName}
                  onChange={(value) =>
                    handleBusinessChange("businessName", value)
                  }
                />

                <Input
                  label="Owner Name"
                  value={businessInfo.ownerName}
                  onChange={(value) =>
                    handleBusinessChange("ownerName", value)
                  }
                />

                <Input
                  label="Phone"
                  value={businessInfo.phone}
                  onChange={(value) =>
                    handleBusinessChange("phone", value)
                  }
                  icon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Email"
                  value={businessInfo.email}
                  onChange={(value) =>
                    handleBusinessChange("email", value)
                  }
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Business Type"
                value={businessInfo.businessType}
                onChange={(value) =>
                  handleBusinessChange("businessType", value)
                }
                options={[
                  "Retail",
                  "Wholesale",
                  "Manufacturing",
                  "Services",
                ]}
              />

              <Select
                label="Financial Year Start"
                value={businessInfo.financialYear}
                onChange={(value) =>
                  handleBusinessChange("financialYear", value)
                }
                options={["April", "January"]}
              />

              <div className="col-span-2">
                <Input
                  label="Address"
                  value={businessInfo.address}
                  icon={<MapPin className="w-4 h-4" />}
                  onChange={(value) =>
                    handleBusinessChange("address", value)
                  }
                />
              </div>

              <Input
                label="City"
                value={businessInfo.city}
                onChange={(value) =>
                  handleBusinessChange("city", value)
                }
              />

              <Input
                label="State"
                value={businessInfo.state}
                onChange={(value) =>
                  handleBusinessChange("state", value)
                }
              />

              <Input
                label="Pincode"
                value={businessInfo.pincode}
                onChange={(value) =>
                  handleBusinessChange("pincode", value)
                }
              />

              <Input
                label="Country"
                value={businessInfo.country}
                onChange={(value) =>
                  handleBusinessChange("country", value)
                }
              />
            </div>

            <Btn
              variant="primary"
              icon={<Check className="w-4 h-4" />}
              onClick={handleSaveBusiness}
            >
              Save Changes
            </Btn>
          </div>
        )}

        {/* ===================================================
            GST & TAX
        =================================================== */}
        {activeTab === "gst" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              GST & Tax Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GSTIN"
                value={gstSettings.gstin}
                onChange={(value) =>
                  handleGstChange("gstin", value)
                }
              />

              <Select
                label="GST Registration Type"
                value={gstSettings.registrationType}
                onChange={(value) =>
                  handleGstChange("registrationType", value)
                }
                options={[
                  "Regular",
                  "Composition",
                  "Unregistered",
                ]}
              />

              <Input
                label="PAN Number"
                value={gstSettings.pan}
                onChange={(value) =>
                  handleGstChange("pan", value)
                }
              />

              <Select
                label="Default GST Rate %"
                value={gstSettings.defaultRate}
                onChange={(value) =>
                  handleGstChange("defaultRate", value)
                }
                options={["0", "5", "12", "18", "28"]}
              />
            </div>

            <div className="mt-4 space-y-3">
              <ToggleRow
                title="Enable IGST"
                description="Apply IGST for inter-state transactions"
                checked={gstSettings.enableIgst}
                onChange={() =>
                  handleGstChange(
                    "enableIgst",
                    !gstSettings.enableIgst,
                  )
                }
              />

              <ToggleRow
                title="Enable Cess"
                description="Apply additional cess on specific products"
                checked={gstSettings.enableCess}
                onChange={() =>
                  handleGstChange(
                    "enableCess",
                    !gstSettings.enableCess,
                  )
                }
              />

              <ToggleRow
                title="Reverse Charge Mechanism (RCM)"
                description="Enable reverse charge options in purchase invoices"
                checked={gstSettings.enableRcm}
                onChange={() =>
                  handleGstChange(
                    "enableRcm",
                    !gstSettings.enableRcm,
                  )
                }
              />
            </div>

            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveGstSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save GST Settings
            </Btn>
          </div>
        )}

        {/* ===================================================
            TRANSACTION
        =================================================== */}
        {activeTab === "transaction" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Transaction Settings
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Default Sale Price"
                value={transactionSettings.salePrice}
                onChange={(value) =>
                  handleTransactionChange("salePrice", value)
                }
                options={[
                  "Retail Price",
                  "Wholesale Price",
                  "Minimum Sale Price",
                ]}
              />

              <Select
                label="Discount Type"
                value={transactionSettings.discountType}
                onChange={(value) =>
                  handleTransactionChange("discountType", value)
                }
                options={[
                  "Percentage",
                  "Flat Amount",
                  "None",
                ]}
              />
            </div>

            <div className="space-y-3">
              <ToggleRow
                title="Passcode for Sales Return"
                description="Ask verification lock passcode on every credit note entry"
                checked={transactionSettings.passcodeRequired}
                onChange={() =>
                  handleTransactionChange(
                    "passcodeRequired",
                    !transactionSettings.passcodeRequired,
                  )
                }
              />

              <ToggleRow
                title="Enable Cash Discount Field"
                description="Show custom cash discount row inside ledger transactions"
                checked={transactionSettings.enableCashDiscount}
                onChange={() =>
                  handleTransactionChange(
                    "enableCashDiscount",
                    !transactionSettings.enableCashDiscount,
                  )
                }
              />

              <ToggleRow
                title="Link Orders to Invoices"
                description="Auto-convert approved purchase orders into open bills"
                checked={transactionSettings.linkOrders}
                onChange={() =>
                  handleTransactionChange(
                    "linkOrders",
                    !transactionSettings.linkOrders,
                  )
                }
              />
            </div>

            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveTransactionSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Transaction Rules
            </Btn>
          </div>
        )}

        {/* ===================================================
            INVOICE
        =================================================== */}
        {activeTab === "invoice" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Invoice Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Invoice Prefix"
                value={invoiceSettings.invoicePrefix}
                onChange={(value) =>
                  handleInvoiceChange("invoicePrefix", value)
                }
              />

              <Input
                label="Starting Number"
                value={invoiceSettings.startingNumber}
                onChange={(value) =>
                  handleInvoiceChange("startingNumber", value)
                }
              />

              <Input
                label="Invoice Footer"
                value={invoiceSettings.invoiceFooter}
                onChange={(value) =>
                  handleInvoiceChange("invoiceFooter", value)
                }
              />

              <Select
                label="Invoice Print Paper Size"
                value={invoiceSettings.paperSize}
                onChange={(value) =>
                  handleInvoiceChange("paperSize", value)
                }
                options={[
                  "Regular A4",
                  "Compact A5",
                  "3-Inch Thermal Roll",
                ]}
              />
            </div>

            <div className="mt-5 border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Column Display Options
              </p>

              <ToggleRow
                title="Show HSN Code Column"
                description="Render HSN block inside invoice grids"
                checked={invoiceSettings.showHsn}
                onChange={() =>
                  handleInvoiceChange(
                    "showHsn",
                    !invoiceSettings.showHsn,
                  )
                }
              />

              <ToggleRow
                title="Print Item Specific Description"
                description="Show a separate description line below product"
                checked={invoiceSettings.showDesc}
                onChange={() =>
                  handleInvoiceChange(
                    "showDesc",
                    !invoiceSettings.showDesc,
                  )
                }
              />

              <ToggleRow
                title="Include Firm Bank Details"
                description="Automatically print bank details at invoice bottom"
                checked={invoiceSettings.showBank}
                onChange={() =>
                  handleInvoiceChange(
                    "showBank",
                    !invoiceSettings.showBank,
                  )
                }
              />
            </div>

            {invoiceSettings.showBank && (
              <div className="grid grid-cols-3 gap-4 mt-3 p-4 bg-slate-50 rounded-xl border">
                <Input
                  label="Bank Name"
                  value={invoiceSettings.bankName}
                  onChange={(value) =>
                    handleInvoiceChange("bankName", value)
                  }
                />

                <Input
                  label="Account Number"
                  value={invoiceSettings.accountNumber}
                  onChange={(value) =>
                    handleInvoiceChange(
                      "accountNumber",
                      value,
                    )
                  }
                />

                <Input
                  label="IFSC Code"
                  value={invoiceSettings.ifscCode}
                  onChange={(value) =>
                    handleInvoiceChange("ifscCode", value)
                  }
                />
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Invoice Template
              </p>

              <div className="grid grid-cols-3 gap-3">
                {["Classic", "Modern", "Minimal"].map((template) => (
                  <button
                    key={template}
                    onClick={() =>
                      handleInvoiceChange("template", template)
                    }
                    className={`border-2 rounded-xl p-3 text-center transition-all ${
                      invoiceSettings.template === template
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-16 bg-slate-100 rounded-lg mb-2" />
                    <p className="text-xs font-medium text-slate-700">
                      {template}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveInvoiceSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Invoice Settings
            </Btn>
          </div>
        )}

        {/* ===================================================
            PARTY
        =================================================== */}
        {activeTab === "party" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Party Settings
            </h3>

            <div className="space-y-3">
              <ToggleRow
                title="Enable Party Grouping"
                description="Categorize retailers, wholesalers and suppliers into structural pools"
                checked={partySettings.enableGrouping}
                onChange={() =>
                  handlePartyChange("enableGrouping")
                }
              />

              <ToggleRow
                title="Track Party-wise Balance Limits"
                description="Restrict raw bill allocation if safety credit thresholds cross limit"
                checked={partySettings.trackBalance}
                onChange={() =>
                  handlePartyChange("trackBalance")
                }
              />

              <ToggleRow
                title="Shipping Address Verification"
                description="Keep separate shipping and billing text blocks for every party ledger"
                checked={partySettings.shippingAddress}
                onChange={() =>
                  handlePartyChange("shippingAddress")
                }
              />
            </div>

            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSavePartySettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Party Profiles
            </Btn>
          </div>
        )}

        {/* ===================================================
            INVENTORY
        =================================================== */}
        {activeTab === "item" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Item & Inventory Settings
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Stock Value Formula"
                value={inventorySettings.stockValueFormula}
                onChange={(value) =>
                  handleInventoryChange(
                    "stockValueFormula",
                    value,
                  )
                }
                options={[
                  "FIFO Method",
                  "Average Base Price Code",
                ]}
              />

              <Input
                label="Low Stock Warning Counter Alert"
                value={inventorySettings.lowStockAlert}
                onChange={(value) =>
                  handleInventoryChange(
                    "lowStockAlert",
                    value,
                  )
                }
              />
            </div>

            <div className="space-y-3">
              <ToggleRow
                title="Enable Serial Tracking / Batch Numbers"
                description="Store dynamic batch indices and expiry timestamps inside database records"
                checked={inventorySettings.enableSerial}
                onChange={() =>
                  handleInventoryToggle("enableSerial")
                }
              />

              <ToggleRow
                title="Multi-unit Measurement Scale"
                description="Allow dynamic calculation mappings like Box to individual pieces conversion"
                checked={inventorySettings.enableMultiUnit}
                onChange={() =>
                  handleInventoryToggle("enableMultiUnit")
                }
              />

              <ToggleRow
                title="Barcode Scanner Integration Hook"
                description="Map standard text field inputs directly via optical barcode readings"
                checked={inventorySettings.enableBarcode}
                onChange={() =>
                  handleInventoryToggle("enableBarcode")
                }
              />
            </div>

            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveItemSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Inventory Parameters
            </Btn>
          </div>
        )}

        {/* ===================================================
            ACCOUNTING
        =================================================== */}
        {activeTab === "accounting" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Accounting & Book-keeping
            </h3>

            <div className="space-y-3">
              <ToggleRow
                title="Enable Trial Balance Reporting"
                description="Real-time sync sheet layout balancing credits and debits together"
                checked={accountingSettings.enableTrialBalance}
                onChange={() =>
                  handleAccountingToggle(
                    "enableTrialBalance",
                  )
                }
              />

              <ToggleRow
                title="Auto Bank Statement Imports"
                description="Enable automated mapping hooks for institutional bank settlement feeds"
                checked={accountingSettings.autoBankImport}
                onChange={() =>
                  handleAccountingToggle("autoBankImport")
                }
              />

              <ToggleRow
                title="Profit Center Allocation tracking"
                description="Perform split accounting across multi-location business setups"
                checked={accountingSettings.profitCenter}
                onChange={() =>
                  handleAccountingToggle("profitCenter")
                }
              />
            </div>

            <Btn
              variant="primary"
              className="mt-5"
              onClick={handleSaveAccountingSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Accounting Rules
            </Btn>
          </div>
        )}

        {/* ===================================================
            CUSTOMIZATION
        =================================================== */}
        {activeTab === "customization" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {t("settings.customization_title")}
              </h3>

              <button
                type="button"
                onClick={resetToDefault}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t("settings.reset_defaults")}
              </button>
            </div>

            {customSuccess && (
              <div className="p-3.5 text-sm rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                {customSuccess}
              </div>
            )}

            {customError && (
              <div className="p-3.5 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {customError}
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t("settings.visual_appearance")}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomizationSelect
                  label={t("settings.theme_mode")}
                  value={tempSettings.theme || "light"}
                  onChange={(value) =>
                    updateTempSettings({ theme: value })
                  }
                  options={[
                    ["light", t("settings.light_mode")],
                    ["dark", t("settings.dark_mode")],
                    ["system", t("settings.system_default")],
                  ]}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.accent_color")}
                  </label>

                  <div className="flex gap-2.5 items-center">
                    <input
                      type="color"
                      value={
                        tempSettings.accentColor || "#3b82f6"
                      }
                      onChange={(e) =>
                        updateTempSettings({
                          accentColor: e.target.value,
                        })
                      }
                      className="w-10 h-10 rounded border cursor-pointer p-0.5 bg-white"
                    />

                    <input
                      type="text"
                      value={
                        tempSettings.accentColor || "#3b82f6"
                      }
                      onChange={(e) =>
                        updateTempSettings({
                          accentColor: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>

                <CustomizationSelect
                  label={t("settings.sidebar_style")}
                  value={
                    tempSettings.sidebarStyle || "expanded"
                  }
                  onChange={(value) =>
                    updateTempSettings({
                      sidebarStyle: value,
                    })
                  }
                  options={[
                    [
                      "expanded",
                      t("settings.expanded"),
                    ],
                    [
                      "compact",
                      t("settings.compact"),
                    ],
                    [
                      "auto",
                      t("settings.auto_responsive"),
                    ],
                  ]}
                />

                <CustomizationSelect
                  label={t("settings.font_size")}
                  value={tempSettings.fontSize || "medium"}
                  onChange={(value) =>
                    updateTempSettings({
                      fontSize: value,
                    })
                  }
                  options={[
                    ["small", t("settings.small")],
                    ["medium", t("settings.medium")],
                    ["large", t("settings.large")],
                    ["xlarge", t("settings.xlarge")],
                  ]}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t("settings.localization_regional")}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomizationSelect
                  label={t("settings.language_selection")}
                  value={tempSettings.language || "English"}
                  onChange={(value) =>
                    updateTempSettings({
                      language: value,
                    })
                  }
                  options={[
                    ["English", "English"],
                    ["Hindi", "Hindi (हिंदी)"],
                    ["Marathi", "Marathi (मराठी)"],
                  ]}
                />

                <CustomizationSelect
                  label={t("settings.date_format")}
                  value={
                    tempSettings.dateFormat ||
                    "DD-MM-YYYY"
                  }
                  onChange={(value) =>
                    updateTempSettings({
                      dateFormat: value,
                    })
                  }
                  options={[
                    ["DD-MM-YYYY", "DD-MM-YYYY"],
                    ["DD/MM/YYYY", "DD/MM/YYYY"],
                    ["MM-DD-YYYY", "MM-DD-YYYY"],
                    ["YYYY-MM-DD", "YYYY-MM-DD"],
                  ]}
                />

                <CustomizationSelect
                  label={t("settings.time_format")}
                  value={
                    tempSettings.timeFormat || "24-hour"
                  }
                  onChange={(value) =>
                    updateTempSettings({
                      timeFormat: value,
                    })
                  }
                  options={[
                    ["12-hour", "12-Hour (02:30 PM)"],
                    ["24-hour", "24-Hour (14:30)"],
                  ]}
                />

                <CustomizationSelect
                  label={t("settings.number_style")}
                  value={
                    tempSettings.numberFormat || "Indian"
                  }
                  onChange={(value) =>
                    updateTempSettings({
                      numberFormat: value,
                    })
                  }
                  options={[
                    [
                      "Indian",
                      t("settings.indian_style"),
                    ],
                    [
                      "International",
                      t("settings.international_style"),
                    ],
                  ]}
                />

                <div className="md:col-span-2">
                  <CustomizationSelect
                    label={t("settings.currency_symbol")}
                    value={tempSettings.currency || "INR"}
                    onChange={(value) =>
                      updateTempSettings({
                        currency: value,
                      })
                    }
                    options={[
                      ["INR", "INR (₹ - Indian Rupee)"],
                      ["USD", "USD ($ - US Dollar)"],
                      ["EUR", "EUR (€ - Euro)"],
                      ["GBP", "GBP (£ - British Pound)"],
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                style={{
                  backgroundColor:
                    "var(--primary, #2563eb)",
                  color: "#ffffff",
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium shadow transition-all hover:opacity-90 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>
                  {saving
                    ? t("common.saving")
                    : t("settings.save_customization")}
                </span>
              </button>

              <button
                type="button"
                onClick={cancelChanges}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t("settings.cancel_changes")}
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            LOW STOCK ALERT
        =================================================== */}
        {activeTab === "stockalert" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Low Stock Alert Numbers
              </h3>

              <p className="text-sm text-slate-600 mb-6">
                Set the minimum stock level threshold. When inventory drops
                to or below this number, you'll receive low stock
                notifications.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Default Low Stock Alert Threshold
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={lowStockSettings.threshold}
                  onChange={(e) =>
                    handleLowStockChange(
                      "threshold",
                      e.target.value,
                    )
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Enter minimum stock units"
                />

                <span className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600">
                  Units
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                When stock equals or falls below this number, alert will
                trigger.
              </p>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Alert Notification Options
              </h4>

              <div className="space-y-3">
                <ToggleRow
                  title="Email Notifications"
                  description="Receive low stock alerts through email"
                  checked={lowStockSettings.emailAlerts}
                  onChange={() =>
                    handleLowStockChange(
                      "emailAlerts",
                      !lowStockSettings.emailAlerts,
                    )
                  }
                />

                <ToggleRow
                  title="In-App Notifications"
                  description="See notifications in the dashboard"
                  checked={lowStockSettings.inAppAlerts}
                  onChange={() =>
                    handleLowStockChange(
                      "inAppAlerts",
                      !lowStockSettings.inAppAlerts,
                    )
                  }
                />

                <ToggleRow
                  title="SMS Alerts"
                  description="Receive SMS alerts on your phone"
                  checked={lowStockSettings.smsAlerts}
                  onChange={() =>
                    handleLowStockChange(
                      "smsAlerts",
                      !lowStockSettings.smsAlerts,
                    )
                  }
                />
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSaveLowStockSettings}
              icon={<Check className="w-4 h-4" />}
            >
              Save Low Stock Settings
            </Btn>
          </div>
        )}

        {/* ===================================================
            USERS PERMISSIONS
        =================================================== */}
        {activeTab === "permissions" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Users Permissions Management
              </h3>

              <p className="text-sm text-slate-600 mb-6">
                Manage staff and employee access to different modules.
                Control which features each employee can access.
              </p>
            </div>

            <div className="space-y-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {emp.name}
                      </h4>

                      <p className="text-xs text-slate-500">
                        {emp.department} Department
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(emp.permissions).map((module) => (
                      <label
                        key={module}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={emp.permissions[module]}
                          onChange={() =>
                            handlePermissionToggle(
                              emp.id,
                              module,
                            )
                          }
                          className="w-4 h-4 rounded cursor-pointer"
                        />

                        <span className="text-xs font-medium text-slate-700 capitalize">
                          {module}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Available Modules
              </h4>

              <div className="grid grid-cols-5 gap-3">
                {[
                  "Sales",
                  "Purchase",
                  "Inventory",
                  "Accounting",
                  "Settings",
                ].map((module) => (
                  <div
                    key={module}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center"
                  >
                    <p className="text-xs font-medium text-slate-700">
                      {module}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSavePermissions}
              icon={<Check className="w-4 h-4" />}
            >
              Save Permissions
            </Btn>
          </div>
        )}

        {/* ===================================================
            PAYMENT METHODS
        =================================================== */}
        {activeTab === "payment" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Payment Methods Configuration
              </h3>

              <p className="text-sm text-slate-600 mb-6">
                Select which payment methods are available for each
                transaction type (Sales, Purchase, Expenses).
              </p>
            </div>

            <PaymentMethodGroup
              title="Sales Transactions"
              type="sales"
              methods={availablePaymentMethods}
              selected={paymentMethods.sales}
              onToggle={handlePaymentMethodToggle}
            />

            <PaymentMethodGroup
              title="Purchase Transactions"
              type="purchase"
              methods={availablePaymentMethods}
              selected={paymentMethods.purchase}
              onToggle={handlePaymentMethodToggle}
            />

            <PaymentMethodGroup
              title="Expenses (e.g., Light Bill, Internet, etc.)"
              type="expenses"
              methods={availablePaymentMethods}
              selected={paymentMethods.expenses}
              onToggle={handlePaymentMethodToggle}
            />

            <Btn
              variant="primary"
              onClick={handleSavePaymentMethods}
              icon={<Check className="w-4 h-4" />}
            >
              Save Payment Methods
            </Btn>
          </div>
        )}

        {/* ===================================================
            SECURITY
        =================================================== */}
        {activeTab === "users" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Security Settings
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={passwordData.currentPassword}
                  onChange={(value) =>
                    handlePasswordChange(
                      "currentPassword",
                      value,
                    )
                  }
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={passwordData.newPassword}
                  onChange={(value) =>
                    handlePasswordChange(
                      "newPassword",
                      value,
                    )
                  }
                  error={passwordErrors.newPassword}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(value) =>
                    handlePasswordChange(
                      "confirmPassword",
                      value,
                    )
                  }
                  error={passwordErrors.confirmPassword}
                />
              </div>

              <div className="space-y-3 pt-2">
                <ToggleRow
                  title="Two-Factor Authentication"
                  description="Require OTP on login"
                  checked={twoFactorAuth}
                  onChange={() =>
                    setTwoFactorAuth(!twoFactorAuth)
                  }
                />

                <ToggleRow
                  title="Session Timeout"
                  description="Auto-logout after 30 minutes of inactivity"
                  checked={sessionTimeout}
                  onChange={() =>
                    setSessionTimeout(!sessionTimeout)
                  }
                />
              </div>

              <Btn
                variant="primary"
                onClick={handleUpdatePassword}
                icon={<Lock className="w-4 h-4" />}
              >
                Update Password
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// REUSABLE TOGGLE
// =============================================================
function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100">
      <div>
        <p className="text-sm font-medium text-slate-900">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
            checked ? "right-1" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

// =============================================================
// CUSTOMIZATION SELECT
// =============================================================
function CustomizationSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

// =============================================================
// PAYMENT METHOD GROUP
// =============================================================
function PaymentMethodGroup({
  title,
  type,
  methods,
  selected,
  onToggle,
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <h4 className="font-semibold text-slate-900 mb-3">
        {title}
      </h4>

      <div className="grid grid-cols-3 gap-3">
        {methods.map((method) => (
          <label
            key={method}
            className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(method)}
              onChange={() => onToggle(type, method)}
              className="w-4 h-4 rounded cursor-pointer"
            />

            <span className="text-sm font-medium text-slate-700">
              {method}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}