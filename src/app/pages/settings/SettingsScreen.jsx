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
  Package,
} from "lucide-react";
import { Input, Btn, Select, Card } from "../../components/common/ui";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("business");
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "Sharma Traders",
    ownerName: "Vikram Sharma",
    phone: "+91 9876543210",
    email: "contact@sharmatraders.in",
    businessType: "Retail",
    financialYear: "April (Standard India)",
    address: "Shop No.14, Sadar Bazaar, Nagpur",
    city: "Nagpur",
    state: "Maharashtra",
    pincode: "440001",
    country: "India",
  });

  // GST & Tax toggle states
  const [enableIgst, setEnableIgst] = useState(true);
  const [enableCess, setEnableCess] = useState(false);
  const [enableRcm, setEnableRcm] = useState(false);

  // Transaction Settings states
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [enableCashDiscount, setEnableCashDiscount] = useState(true);
  const [linkOrders, setLinkOrders] = useState(true);

  // Invoice Settings states
  const [showHsn, setShowHsn] = useState(true);
  const [showDesc, setShowDesc] = useState(true);
  const [showBank, setShowBank] = useState(false);

  // Party Management states
  const [enableGrouping, setEnableGrouping] = useState(true);
  const [trackBalance, setTrackBalance] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(true);

  // Item & Inventory states
  const [enableSerial, setEnableSerial] = useState(false);
  const [enableMultiUnit, setEnableMultiUnit] = useState(true);
  const [enableBarcode, setEnableBarcode] = useState(true);

  // Accounting & Books states
  const [enableTrialBalance, setEnableTrialBalance] = useState(true);
  const [autoBankImport, setAutoBankImport] = useState(false);
  const [profitCenter, setProfitCenter] = useState(false);

  // GST Registration state
  const [isComposition, setIsComposition] = useState(false);

  // Consume Centralized Customization Context
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

  // Low Stock Alert states
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Users Permissions states
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

  // Payment Methods states
  const [paymentMethods, setPaymentMethods] = useState({
    sales: ["Cash", "Card", "UPI"],
    purchase: ["Cash", "Cheque", "Bank Transfer"],
    expenses: ["Cash", "Card"],
  });
  const [availablePaymentMethods] = useState([
    "Cash",
    "Card",
    "UPI",
    "Cheque",
    "Bank Transfer",
    "Online",
    "Wallet",
  ]);

  // Security states
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);


  const handleSaveBusiness = () => {
    console.log(businessInfo);

    localStorage.setItem("businessInfo", JSON.stringify(businessInfo));

    alert("Business Information Saved");
  };

  // Handle GST settings save
  const handleSaveGstSettings = () => {
    localStorage.setItem(
      "gstSettings",
      JSON.stringify({
        isComposition,
        enableIgst,
        enableCess,
        enableRcm,
      }),
    );
    alert("✓ GST settings saved successfully!");
  };

  // Handle transaction settings save
  const handleSaveTransactionSettings = () => {
    localStorage.setItem(
      "transactionSettings",
      JSON.stringify({
        passcodeRequired,
        enableCashDiscount,
        linkOrders,
      }),
    );
    alert("✓ Transaction settings saved successfully!");
  };

  // Handle invoice settings save
  const handleSaveInvoiceSettings = () => {
    localStorage.setItem(
      "invoiceSettings",
      JSON.stringify({
        showHsn,
        showDesc,
        showBank,
      }),
    );
    alert("✓ Invoice settings saved successfully!");
  };

  // Handle party settings save
  const handleSavePartySettings = () => {
    localStorage.setItem(
      "partySettings",
      JSON.stringify({
        enableGrouping,
        trackBalance,
        shippingAddress,
      }),
    );
    alert("✓ Party settings saved successfully!");
  };

  // Handle item settings save
  const handleSaveItemSettings = () => {
    localStorage.setItem(
      "itemSettings",
      JSON.stringify({
        enableSerial,
        enableMultiUnit,
        enableBarcode,
      }),
    );
    alert("✓ Item settings saved successfully!");
  };

  // Handle accounting settings save
  const handleSaveAccountingSettings = () => {
    localStorage.setItem(
      "accountingSettings",
      JSON.stringify({
        enableTrialBalance,
        autoBankImport,
        profitCenter,
      }),
    );
    alert("✓ Accounting settings saved successfully!");
  };

  // Handle low stock save
  const handleSaveLowStockSettings = () => {
    localStorage.setItem(
      "lowStockSettings",
      JSON.stringify({
        threshold: lowStockThreshold,
        emailAlerts,
        inAppAlerts,
        smsAlerts,
      }),
    );
    alert("✓ Low stock alert settings saved successfully!");
  };

  // Handle permission update
  const handlePermissionToggle = (empId, module) => {
    setEmployees(
      employees.map((emp) =>
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

  // Handle permissions save
  const handleSavePermissions = () => {
    localStorage.setItem("employeePermissions", JSON.stringify(employees));
    alert("✓ Users permissions saved successfully!");
  };

  // Handle payment method toggle
  const handlePaymentMethodToggle = (type, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [type]: prev[type].includes(method)
        ? prev[type].filter((m) => m !== method)
        : [...prev[type], method],
    }));
  };

  // Handle payment methods save
  const handleSavePaymentMethods = () => {
    localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    alert("✓ Payment methods saved successfully!");
  };

  // Handle security settings save
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
  // Naw safe tabs configuration
  const tabs = [
    { key: "business", label: "Business Profile", icon: Building2 },
    { key: "gst", label: "GST & Tax", icon: Percent },
    { key: "transaction", label: "Transaction Settings", icon: FileText },
    { key: "invoice", label: "Invoice Settings", icon: Receipt },
    { key: "party", label: "Party Management", icon: Users },
    { key: "item", label: "Item & Inventory", icon: Package2 }, // Fixed here!
    { key: "accounting", label: "Accounting & Books", icon: Landmark },
    { key: "customization", label: "Customization", icon: Settings },
    { key: "stockalert", label: "Low Stock Alert Numbers", icon: AlertCircle },
    { key: "permissions", label: "Users Permissions", icon: Shield },
    { key: "payment", label: "Payment Methods", icon: CreditCard },
    { key: "users", label: "Security & Access", icon: Lock },
  ];
  const handleBusinessChange = (field, value) => {
    setBusinessInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [gstSettings, setGstSettings] = useState({
    gstin: "SFGGYT376432123",
    pan: "23456789DFGHJK",
    registrationType: "Regular",
    defaultRate: "18",
    enableIgst: true,
    enableCess: false,
  });

  const handleGstChange = (field, value) => {
    setGstSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [transactionSettings, setTransactionSettings] = useState({
    salePrice: "Retail Price",
    discountType: "Percentage",
  });

  const handleTransactionChange = (field, value) => {
    setTransactionSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: "INV-",
    startingNumber: "1001",
    invoiceFooter: "Thank you for your business!",
    paperSize: "Regular A4",
    bankName: "State Bank of India",
    accountNumber: "34001294811",
    ifscCode: "SBIN0001042",
    template: "Modern",
  });

  const handleInvoiceChange = (field, value) => {
    setInvoiceSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [inventorySettings, setInventorySettings] = useState({
    stockValueFormula: "FIFO Method",
    lowStockAlert: "10 Units Remaining",
  });

  const handleInventoryChange = (field, value) => {
    setInventorySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,12}$/;

    return passwordRegex.test(password);
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

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

  return (
    <div className="flex gap-6">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-56 p-3 h-fit flex-shrink-0 bg-white border rounded-xl shadow-sm">
        <nav className="space-y-0.5">
          {tabs.map((t) => {
            const IconComponent = t.icon; // Dynamic parsing handle
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* RIGHT SIDE WORKSPACE */}
      <div className="flex-1 space-y-5">
        {/* TAB 1: BUSINESS PROFILE */}
        {activeTab === "business" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Business Information
            </h3>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 flex-shrink-0">
                <div className="text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-400">Upload Logo</p>
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
                  onChange={(value) => handleBusinessChange("ownerName", value)}
                />
                <Input
                  label="Phone"
                  value={businessInfo.phone}
                  onChange={(value) => handleBusinessChange("phone", value)}
                  icon={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Email"
                  value={businessInfo.email}
                  onChange={(value) => handleBusinessChange("email", value)}
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
                options={["Retail", "Wholesale", "Manufacturing", "Services"]}
              />
              <Select
                label="Financial Year Start"
                value={businessInfo.financialYear}
                onChange={(value) =>
                  handleBusinessChange("financialYear", value)
                }
                options={["April (Standard India)", "January"]}
              />
              <div className="col-span-2">
                <Input
                  label="Address"
                  value={businessInfo.address}
                  icon={<MapPin className="w-4 h-4" />}
                  onChange={(value) => handleBusinessChange("address", value)}
                />
              </div>
              <Input
                label="City"
                value={businessInfo.city}
                onChange={(value) => handleBusinessChange("city", value)}
              />
              <Input
                label="State"
                value={businessInfo.state}
                onChange={(value) => handleBusinessChange("state", value)}
              />
              <Input
                label="Pincode"
                value={businessInfo.pincode}
                onChange={(value) => handleBusinessChange("pincode", value)}
              />
              <Select
                label="Country"
                value={businessInfo.country}
                onChange={(value) => handleBusinessChange("country", value)}
                options={["India"]}
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

        {/* TAB 2: GST & TAX SETTINGS */}
        {activeTab === "gst" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              GST & Tax Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GSTIN"
                value={businessInfo.gstin}
                onChange={(value) => handleBusinessChange("gstin", value)}
              />
              <Select
                label="GST Registration Type"
                value={gstSettings.registrationType}
                onChange={(value) => handleGstChange("registrationType", value)}
                options={["Regular", "Composition", "Unregistered"]}
              />
              <Input
                label="PAN Number"
                value={businessInfo.panNumber}
                onChange={(value) => handleBusinessChange("panNumber", value)}
              />
              <Select
                label="Default GST Rate %"
                value={gstSettings.defaultRate}
                onChange={(value) => handleGstChange("defaultRate", value)}
                options={["0", "5", "12", "18", "28"]}
              />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable IGST
                  </p>
                  <p className="text-xs text-slate-500">
                    Apply IGST for inter-state transactions
                  </p>
                </div>
                <button
                  onClick={() => setEnableIgst(!enableIgst)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${enableIgst ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableIgst ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Cess
                  </p>
                  <p className="text-xs text-slate-500">
                    Apply additional cess on specific products
                  </p>
                </div>
                <button
                  onClick={() => setEnableCess(!enableCess)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${enableCess ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableCess ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Reverse Charge Mechanism (RCM)
                  </p>
                  <p className="text-xs text-slate-500">
                    Enable reverse charge options in purchase invoices
                  </p>
                </div>
                <button
                  onClick={() => setEnableRcm(!enableRcm)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 transition-colors ${enableRcm ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enableRcm ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
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

        {/* TAB 3: TRANSACTION SETTINGS */}
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
                options={["Percentage", "Flat Amount", "None"]}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Passcode for Sales Return
                  </p>
                  <p className="text-xs text-slate-500">
                    Ask verification lock passcode on every credit note entry
                  </p>
                </div>
                <button
                  onClick={() => setPasscodeRequired(!passcodeRequired)}
                  className={`w-10 h-6 rounded-full relative ${passcodeRequired ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${passcodeRequired ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Cash Discount Field
                  </p>
                  <p className="text-xs text-slate-500">
                    Show custom cash discount row inside ledger transactions
                  </p>
                </div>
                <button
                  onClick={() => setEnableCashDiscount(!enableCashDiscount)}
                  className={`w-10 h-6 rounded-full relative ${enableCashDiscount ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableCashDiscount ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Link Orders to Invoices
                  </p>
                  <p className="text-xs text-slate-500">
                    Auto-convert approved purchase orders into open bills
                  </p>
                </div>
                <button
                  onClick={() => setLinkOrders(!linkOrders)}
                  className={`w-10 h-6 rounded-full relative ${linkOrders ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${linkOrders ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
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

        {/* TAB 4: INVOICE SETTINGS */}
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
                onChange={(value) => handleInvoiceChange("paperSize", value)}
                options={["Regular A4", "Compact A5", "3-Inch Thermal Roll"]}
              />
            </div>

            <div className="mt-5 border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Column Display Options
              </p>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Show HSN Code Column
                  </p>
                  <p className="text-xs text-slate-500">
                    Render HSN block inside invoice grids
                  </p>
                </div>
                <button
                  onClick={() => setShowHsn(!showHsn)}
                  className={`w-10 h-6 rounded-full relative ${showHsn ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${showHsn ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Print Item Specific Description
                  </p>
                  <p className="text-xs text-slate-500">
                    Show a separate descriptions line row below product
                  </p>
                </div>
                <button
                  onClick={() => setShowDesc(!showDesc)}
                  className={`w-10 h-6 rounded-full relative ${showDesc ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${showDesc ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Include Firm Bank Details
                  </p>
                  <p className="text-xs text-slate-500">
                    Automatically print bank details at invoice bottom
                  </p>
                </div>
                <button
                  onClick={() => setShowBank(!showBank)}
                  className={`w-10 h-6 rounded-full relative ${showBank ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${showBank ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>

            {showBank && (
              <div className="grid grid-cols-3 gap-4 mt-3 p-4 bg-slate-50 rounded-xl border">
                <Input
                  label="Bank Name"
                  value={invoiceSettings.bankName}
                  onChange={(value) => handleInvoiceChange("bankName", value)}
                />
                <Input
                  label="Account Number"
                  value={invoiceSettings.accountNumber}
                  onChange={(value) =>
                    handleInvoiceChange("accountNumber", value)
                  }
                />
                <Input
                  label="IFSC Code"
                  value={invoiceSettings.ifscCode}
                  onChange={(value) => handleInvoiceChange("ifscCode", value)}
                />
              </div>
            )}

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Invoice Template
              </p>
              <div className="grid grid-cols-3 gap-3">
                {["Classic", "Modern", "Minimal"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleInvoiceChange("template", t)}
                    className={`border-2 rounded-xl p-3 text-center transition-all ${
                      invoiceSettings.template === t
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-16 bg-slate-100 rounded-lg mb-2" />
                    <p className="text-xs font-medium text-slate-700">{t}</p>
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

        {/* TAB 5: PARTY MANAGEMENT */}
        {activeTab === "party" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Party Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Party Grouping
                  </p>
                  <p className="text-xs text-slate-500">
                    Categorize retailers, wholesalers and suppliers into
                    structural pools
                  </p>
                </div>
                <button
                  onClick={() => setEnableGrouping(!enableGrouping)}
                  className={`w-10 h-6 rounded-full relative ${enableGrouping ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableGrouping ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Track Party-wise Balance Limits
                  </p>
                  <p className="text-xs text-slate-500">
                    Restrict raw bill allocation if safety credit thresholds
                    cross limit
                  </p>
                </div>
                <button
                  onClick={() => setTrackBalance(!trackBalance)}
                  className={`w-10 h-6 rounded-full relative ${trackBalance ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${trackBalance ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Shipping Address Verification
                  </p>
                  <p className="text-xs text-slate-500">
                    Keep separate shipping and billing text blocks for every
                    party ledger
                  </p>
                </div>
                <button
                  onClick={() => setShippingAddress(!shippingAddress)}
                  className={`w-10 h-6 rounded-full relative ${shippingAddress ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${shippingAddress ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
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

        {/* TAB 6: ITEM & INVENTORY */}
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
                  handleInventoryChange("stockValueFormula", value)
                }
                options={["FIFO Method", "Average Base Price Code"]}
              />
              <Input
                label="Low Stock Warning Counter Alert"
                value={inventorySettings.lowStockAlert}
                onChange={(value) =>
                  handleInventoryChange("lowStockAlert", value)
                }
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Serial Tracking / Batch Numbers
                  </p>
                  <p className="text-xs text-slate-500">
                    Store dynamic batch indices and expiry timestamps inside
                    database records
                  </p>
                </div>
                <button
                  onClick={() => setEnableSerial(!enableSerial)}
                  className={`w-10 h-6 rounded-full relative ${enableSerial ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableSerial ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Multi-unit Measurement Scale
                  </p>
                  <p className="text-xs text-slate-500">
                    Allow dynamic calculation mappings like Box to individual
                    pieces conversion
                  </p>
                </div>
                <button
                  onClick={() => setEnableMultiUnit(!enableMultiUnit)}
                  className={`w-10 h-6 rounded-full relative ${enableMultiUnit ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableMultiUnit ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Barcode Scanner Integration Hook
                  </p>
                  <p className="text-xs text-slate-500">
                    Map standard text fields inputs direct via optical barcode
                    readings
                  </p>
                </div>
                <button
                  onClick={() => setEnableBarcode(!enableBarcode)}
                  className={`w-10 h-6 rounded-full relative ${enableBarcode ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableBarcode ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
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

        {/* TAB 7: ACCOUNTING & BOOKS */}
        {activeTab === "accounting" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-5">
              Accounting & Book-keeping
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Enable Trial Balance Reporting
                  </p>
                  <p className="text-xs text-slate-500">
                    Real-time sync sheet layout balancing credits and debits
                    together
                  </p>
                </div>
                <button
                  onClick={() => setEnableTrialBalance(!enableTrialBalance)}
                  className={`w-10 h-6 rounded-full relative ${enableTrialBalance ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${enableTrialBalance ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Auto Bank Statement Imports
                  </p>
                  <p className="text-xs text-slate-500">
                    Enable automated mapping hooks for institutional bank
                    settlement feeds
                  </p>
                </div>
                <button
                  onClick={() => setAutoBankImport(!autoBankImport)}
                  className={`w-10 h-6 rounded-full relative ${autoBankImport ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${autoBankImport ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Profit Center Allocation tracking
                  </p>
                  <p className="text-xs text-slate-500">
                    Perform split accounting across multi-location business
                    setups
                  </p>
                </div>
                <button
                  onClick={() => setProfitCenter(!profitCenter)}
                  className={`w-10 h-6 rounded-full relative ${profitCenter ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${profitCenter ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
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

        {/* TAB 8: CUSTOMIZATION */}
        {activeTab === "customization" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {t("settings.customization_title")}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetToDefault}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t("settings.reset_defaults")}
                </button>
              </div>
            </div>

            {/* Notification messages */}
            {customSuccess && (
              <div className="p-3.5 text-sm rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400">
                {customSuccess}
              </div>
            )}
            {customError && (
              <div className="p-3.5 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400">
                {customError}
              </div>
            )}

            {/* Visual & Appearance Settings */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t("settings.visual_appearance")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.theme_mode")}
                  </label>
                  <select
                    value={tempSettings.theme || "light"}
                    onChange={(e) => updateTempSettings({ theme: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">{t("settings.light_mode")}</option>
                    <option value="dark">{t("settings.dark_mode")}</option>
                    <option value="system">{t("settings.system_default")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.accent_color")}
                  </label>
                  <div className="flex gap-2.5 items-center">
                    <input
                      type="color"
                      value={tempSettings.accentColor || "#3b82f6"}
                      onChange={(e) =>
                        updateTempSettings({ accentColor: e.target.value })
                      }
                      className="w-10 h-10 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={tempSettings.accentColor || "#3b82f6"}
                      onChange={(e) =>
                        updateTempSettings({ accentColor: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm font-mono"
                      placeholder="#3b82f6"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-slate-300 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: tempSettings.accentColor || "#3b82f6" }}
                      title="Accent Color Preview"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.sidebar_style")}
                  </label>
                  <select
                    value={tempSettings.sidebarStyle || "expanded"}
                    onChange={(e) => updateTempSettings({ sidebarStyle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expanded">{t("settings.expanded")}</option>
                    <option value="compact">{t("settings.compact")}</option>
                    <option value="auto">{t("settings.auto_responsive")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.font_size")}
                  </label>
                  <select
                    value={tempSettings.fontSize || "medium"}
                    onChange={(e) => updateTempSettings({ fontSize: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">{t("settings.small")}</option>
                    <option value="medium">{t("settings.medium")}</option>
                    <option value="large">{t("settings.large")}</option>
                    <option value="xlarge">{t("settings.xlarge")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Localization & Regional Formats */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t("settings.localization_regional")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.language_selection")}
                  </label>
                  <select
                    value={tempSettings.language || "English"}
                    onChange={(e) => updateTempSettings({ language: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.date_format")}
                  </label>
                  <select
                    value={tempSettings.dateFormat || "DD-MM-YYYY"}
                    onChange={(e) => updateTempSettings({ dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.time_format")}
                  </label>
                  <select
                    value={tempSettings.timeFormat || "24-hour"}
                    onChange={(e) => updateTempSettings({ timeFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="12-hour">12-Hour (02:30 PM)</option>
                    <option value="24-hour">24-Hour (14:30)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.number_style")}
                  </label>
                  <select
                    value={tempSettings.numberFormat || "Indian"}
                    onChange={(e) => updateTempSettings({ numberFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Indian">{t("settings.indian_style")}</option>
                    <option value="International">{t("settings.international_style")}</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("settings.currency_symbol")}
                  </label>
                  <select
                    value={tempSettings.currency || "INR"}
                    onChange={(e) => updateTempSettings({ currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                style={{ backgroundColor: "var(--primary, #2563eb)", color: "#ffffff" }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium shadow transition-all hover:opacity-90 disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-white" />
                <span>{saving ? t("common.saving") : t("settings.save_customization")}</span>
              </button>

              <button
                type="button"
                onClick={cancelChanges}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t("settings.cancel_changes")}
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: LOW STOCK ALERT NUMBERS */}
        {activeTab === "stockalert" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Low Stock Alert Numbers
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Set the minimum stock level threshold. When inventory drops to
                or below this number, you'll receive low stock notifications.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Default Low Stock Alert Threshold
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Enter minimum stock units"
                    />
                    <span className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600">
                      Units
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    When stock equals or falls below this number, alert will
                    trigger
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">
                Alert Notification Options
              </h4>
              <div className="space-y-3">
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      In-App Notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      See notifications in the dashboard
                    </p>
                  </div>
                  <button
                    onClick={() => setInAppAlerts(!inAppAlerts)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ${inAppAlerts ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${inAppAlerts ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      SMS Alerts
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive SMS alerts on your phone
                    </p>
                  </div>
                  <button
                    onClick={() => setSmsAlerts(!smsAlerts)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ${smsAlerts ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${smsAlerts ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
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

        {/* TAB 10: USERS PERMISSIONS */}
        {activeTab === "permissions" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Users Permissions Management
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Manage staff and employee access to different modules. Control
                which features each employee can access.
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
                      <div
                        key={module}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={emp.permissions[module]}
                          onChange={() =>
                            handlePermissionToggle(emp.id, module)
                          }
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                        <label className="text-xs font-medium text-slate-700 capitalize cursor-pointer">
                          {module}
                        </label>
                      </div>
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
                ].map((mod) => (
                  <div
                    key={mod}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center"
                  >
                    <p className="text-xs font-medium text-slate-700">{mod}</p>
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

        {/* TAB 11: PAYMENT METHODS */}
        {activeTab === "payment" && (
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-5">
                Payment Methods Configuration
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Select which payment methods are available for each transaction
                type (Sales, Purchase, Expenses).
              </p>
            </div>

            <div className="space-y-6">
              {/* Sales Payment Methods */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Sales Transactions
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.sales.includes(method)}
                        onChange={() =>
                          handlePaymentMethodToggle("sales", method)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Purchase Payment Methods */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Purchase Transactions
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.purchase.includes(method)}
                        onChange={() =>
                          handlePaymentMethodToggle("purchase", method)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expenses Payment Methods */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Expenses (e.g., Light Bill, Internet, etc.)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={paymentMethods.expenses.includes(method)}
                        onChange={() =>
                          handlePaymentMethodToggle("expenses", method)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Btn
              variant="primary"
              onClick={handleSavePaymentMethods}
              icon={<Check className="w-4 h-4" />}
            >
              Save Payment Methods
            </Btn>
          </div>
        )}

        {/* TAB 12: SECURITY SETTINGS */}
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
                    handlePasswordChange("currentPassword", value)
                  }
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={passwordData.newPassword}
                  onChange={(value) =>
                    handlePasswordChange("newPassword", value)
                  }
                  error={passwordErrors.newPassword}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(value) =>
                    handlePasswordChange("confirmPassword", value)
                  }
                  error={passwordErrors.confirmPassword}
                />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-slate-500">
                      Require OTP on login
                    </p>
                  </div>
                  <button
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${twoFactorAuth ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${twoFactorAuth ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Session Timeout
                    </p>
                    <p className="text-xs text-slate-500">
                      Auto-logout after 30 minutes of inactivity
                    </p>
                  </div>
                  <button
                    onClick={() => setSessionTimeout(!sessionTimeout)}
                    className={`w-10 h-6 rounded-full relative flex-shrink-0 ml-4 ${sessionTimeout ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow ${sessionTimeout ? "right-1" : "left-1"}`}
                    />
                  </button>
                </div>
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
