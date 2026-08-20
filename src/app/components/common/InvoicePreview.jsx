import React from 'react';

export default function InvoicePreview({ settings, businessInfo }) {
  // Extract settings for preview
  const {
    invoicePrefix = "INV",
    startingNumber = "1001",
    invoiceTitle = "Tax Invoice",
    showCustomerName = true,
    showBillingAddress = true,
    showHSN = true,
    showDescription = true,
    showTax = true,
    showDiscount = true,
    showBankDetails = false,
    showUPIQR = false,
    bankName = "",
    accountHolder = "",
    accountNumber = "",
    ifsc = "",
    upiId = "",
    invoiceFooter = "Thank you for your business!",
    termsAndConditions = "",
    showSignature = false,
    signatureUrl = "",
    template = "Classic",
    primaryColor = "#2563eb",
    paperSize = "A4"
  } = settings || {};

  const bInfo = businessInfo || {};

  // Mock Data
  const sampleItems = [
    { name: "Premium Widget", hsn: "8471", desc: "Red color variant", qty: 2, price: 1500, discount: 100, tax: 252, amount: 2900 },
    { name: "Standard Gadget", hsn: "8472", desc: "", qty: 1, price: 800, discount: 0, tax: 144, amount: 944 }
  ];

  // Scale the preview down so it fits nicely
  const pSize = paperSize || "A4";
  const previewScale = pSize === "Thermal 58mm" ? 0.8 : (pSize === "Thermal 80mm" ? 0.7 : 0.55);
  
  const getTemplateStyle = () => {
    switch (template) {
      case "Modern":
        return { headerBg: primaryColor, headerColor: '#ffffff', border: `1px solid ${primaryColor}` };
      case "Minimal":
        return { headerBg: 'transparent', headerColor: '#333333', border: '1px solid #eeeeee' };
      default: // Classic
        return { headerBg: '#f8fafc', headerColor: '#0f172a', border: '1px solid #e2e8f0' };
    }
  };
  
  const tpl = getTemplateStyle();

  return (
    <div className="bg-slate-100 rounded-xl p-4 flex justify-center overflow-hidden h-[calc(100vh-200px)] items-start pt-8">
      <div 
        className="bg-white shadow-lg origin-top" 
        style={{ 
          transform: `scale(${previewScale})`,
          width: pSize.includes("Thermal") ? (pSize.includes("58") ? "300px" : "400px") : "800px",
          minHeight: pSize.includes("Thermal") ? "auto" : "1123px", // A4 ratio
          border: tpl.border
        }}
      >
        {/* Header */}
        <div style={{ backgroundColor: tpl.headerBg, color: tpl.headerColor, padding: '24px' }} className="flex justify-between items-start">
          <div>
            {bInfo.logoUrl && <img src={bInfo.logoUrl} alt="Logo" className="max-h-16 mb-2" />}
            <h2 className="text-2xl font-bold">{bInfo.businessName || "Your Business Name"}</h2>
            <p className="text-sm opacity-90">{bInfo.address || "123 Business Street"}</p>
            <p className="text-sm opacity-90">{bInfo.city}, {bInfo.state} - {bInfo.pincode}</p>
            <p className="text-sm opacity-90">GSTIN: {bInfo.gstin || "27XXXXX1234X1ZX"}</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{invoiceTitle}</h1>
            <p className="font-semibold text-lg">{invoicePrefix}-{startingNumber}</p>
            <p className="text-sm opacity-90">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="p-6 border-b" style={{ borderColor: tpl.border }}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Billed To</h3>
          {showCustomerName && <p className="font-bold text-slate-800">John Doe (Sample Customer)</p>}
          {showBillingAddress && (
            <p className="text-sm text-slate-600">
              456 Client Avenue, New Delhi, DL<br/>
              Phone: +91 98765 43210
            </p>
          )}
        </div>

        {/* Items Table */}
        <div className="p-6">
          <table className="w-full text-left text-sm mb-4">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-2">Item</th>
                {showHSN && <th className="py-2">HSN</th>}
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Rate</th>
                {showDiscount && <th className="py-2 text-right">Disc</th>}
                {showTax && <th className="py-2 text-right">Tax</th>}
                <th className="py-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sampleItems.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3">
                    <p className="font-medium">{item.name}</p>
                    {showDescription && item.desc && <p className="text-xs text-slate-500">{item.desc}</p>}
                  </td>
                  {showHSN && <td className="py-3 text-slate-600">{item.hsn}</td>}
                  <td className="py-3 text-center">{item.qty}</td>
                  <td className="py-3 text-right">₹{item.price}</td>
                  {showDiscount && <td className="py-3 text-right">₹{item.discount}</td>}
                  {showTax && <td className="py-3 text-right">₹{item.tax}</td>}
                  <td className="py-3 text-right font-bold">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹3844.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ color: primaryColor }}>
                <span>Total:</span>
                <span>₹3844.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-6 mt-8 flex flex-wrap gap-6 justify-between border-t border-slate-100">
          
          <div className="flex-1 min-w-[200px]">
            {showBankDetails && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-slate-800">Bank Details</h4>
                <p className="text-xs text-slate-600">
                  Bank: {bankName || "Sample Bank"}<br/>
                  A/C Name: {accountHolder || "Business Name"}<br/>
                  A/C No: {accountNumber || "1234567890"}<br/>
                  IFSC: {ifsc || "SBIN0001234"}
                </p>
              </div>
            )}
            {showUPIQR && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-slate-800 mb-1">Pay via UPI</h4>
                <div className="w-20 h-20 bg-slate-200 flex items-center justify-center text-xs text-slate-500 border">
                  QR Code
                </div>
                <p className="text-xs text-slate-600 mt-1">{upiId || "sample@upi"}</p>
              </div>
            )}
            {termsAndConditions && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-slate-800">Terms & Conditions</h4>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{termsAndConditions}</p>
              </div>
            )}
          </div>

          <div className="w-48 text-right flex flex-col justify-end">
            {showSignature && (
              <div className="mb-2 flex justify-end">
                {signatureUrl ? (
                  <img src={signatureUrl} alt="Signature" className="h-12 object-contain" />
                ) : (
                  <div className="h-12 w-32 border-b-2 border-dashed border-slate-300"></div>
                )}
              </div>
            )}
            <p className="text-xs font-semibold text-slate-800">Authorized Signatory</p>
          </div>
        </div>

        {invoiceFooter && (
          <div className="w-full text-center py-4 bg-slate-50 text-xs text-slate-500 border-t">
            {invoiceFooter}
          </div>
        )}
      </div>
    </div>
  );
}
