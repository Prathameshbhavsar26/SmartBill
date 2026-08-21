/**
 * Utility for formatting and sharing digital tax invoices via WhatsApp & Web Share API.
 */

const fmtCurrency = (num) => `₹${Number(num || 0).toLocaleString("en-IN")}`;

export const formatWhatsAppInvoiceMessage = (order, businessInfo = {}) => {
  if (!order) return "";

  const bizName = businessInfo.businessName || businessInfo.name || "SmartBill Merchant";
  const bizPhone = businessInfo.phone ? `\n📞 *Contact*: ${businessInfo.phone}` : "";
  const bizGst = businessInfo.gstin || businessInfo.gstNumber ? `\n🏛️ *GSTIN*: ${businessInfo.gstin || businessInfo.gstNumber}` : "";
  const bizAddress = businessInfo.address ? `\n📍 *Address*: ${businessInfo.address}` : "";

  const invNo = order.invoiceNo || order.orderId || order._id?.toString()?.slice(-6) || "INV-001";
  const dateStr = order.date
    ? new Date(order.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const customerName = order.customerName || order.customer?.name || "Valued Customer";

  const items = Array.isArray(order.items) ? order.items : [];
  let itemsList = "";
  if (items.length > 0) {
    itemsList = items
      .map((it, idx) => {
        const name = it.name || it.productName || `Item #${idx + 1}`;
        const qty = it.qty || it.quantity || 1;
        const rate = it.price || it.rate || 0;
        const total = it.total || it.amount || qty * rate;
        return `• *${name}*\n  ${qty} x ${fmtCurrency(rate)} = *${fmtCurrency(total)}*`;
      })
      .join("\n");
  } else {
    itemsList = "• General Purchase";
  }

  const subtotal = order.subtotal || order.subTotal || order.totalOrderValue || order.total || 0;
  const discount = order.discount || order.discountAmount || 0;
  const tax = order.gst || order.tax || order.totalTax || 0;
  const grandTotal = order.total || order.totalOrderValue || order.grandTotal || subtotal;
  const paymentMode = order.paymentMode || order.paymentMethod || "Cash";
  const paymentStatus = order.paymentStatus || order.status || "Paid";

  const message = `🧾 *TAX INVOICE / BILL RECEIPT*
━━━━━━━━━━━━━━━━━━━━
🏢 *${bizName}*${bizGst}${bizPhone}${bizAddress}

📄 *Invoice No*: #${invNo}
📅 *Date*: ${dateStr}
👤 *Customer*: ${customerName}
━━━━━━━━━━━━━━━━━━━━
📦 *PURCHASED ITEMS*:
${itemsList}
━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal*: ${fmtCurrency(subtotal)}${discount > 0 ? `\n🎁 *Discount*: -${fmtCurrency(discount)}` : ""}${tax > 0 ? `\n🏛️ *Tax / GST*: +${fmtCurrency(tax)}` : ""}
💰 *GRAND TOTAL*: *${fmtCurrency(grandTotal)}*
💳 *Payment*: ${paymentMode} (${paymentStatus})
━━━━━━━━━━━━━━━━━━━━
🙏 *Thank you for your business!*
Powered by *SmartBill*`;

  return message;
};

/**
 * Open WhatsApp with pre-formatted invoice message.
 * @param {Object} order - Order object
 * @param {Object} businessInfo - Business Settings / profile
 * @param {String} customerPhone - Optional override phone number
 */
export const shareInvoiceOnWhatsApp = (order, businessInfo = {}, customerPhone = "") => {
  const message = formatWhatsAppInvoiceMessage(order, businessInfo);
  let rawPhone = customerPhone || order.customerPhone || order.customer?.phone || "";

  // Normalize Indian / International Phone Number
  rawPhone = rawPhone.replace(/\D/g, "");
  if (rawPhone.length === 10) {
    rawPhone = `91${rawPhone}`;
  }

  const encodedMsg = encodeURIComponent(message);
  const waUrl = rawPhone
    ? `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, "_blank", "noopener,noreferrer");
};

/**
 * Native Web Share API if supported on device.
 */
export const shareInvoiceNative = async (order, businessInfo = {}) => {
  const message = formatWhatsAppInvoiceMessage(order, businessInfo);
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Invoice #${order.invoiceNo || "Receipt"} - ${businessInfo.businessName || "SmartBill"}`,
        text: message,
      });
      return true;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Native share failed, fallback to WhatsApp", err);
      }
    }
  }
  shareInvoiceOnWhatsApp(order, businessInfo);
  return false;
};
