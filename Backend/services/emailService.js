import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const EMAIL_FROM =
  process.env.EMAIL_FROM || `SmartBill <${SMTP_USER || "noreply@smartbill.app"}>`;

function transporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

/**
 * Build a clean, self-contained HTML invoice email body.
 */
export function buildInvoiceEmailHtml({ order, customerEmail, businessName }) {
  const rows = (order.items || [])
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;color:#334155;">${it.name || ""}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;color:#475569;">${it.qty || 0}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:right;color:#475569;">${money(it.price)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:right;color:#0f172a;">${money(it.amount || it.price * it.qty)}</td>
        </tr>`,
    )
    .join("");

  const statusColor =
    order.status === "Paid"
      ? "#059669"
      : order.status === "Partial"
        ? "#d97706"
        : "#dc2626";

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:#2563eb;color:#ffffff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:18px;font-weight:700;">${businessName || "SmartBill"}</div>
            <div style="font-size:12px;opacity:0.9;">Sales Invoice</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:700;font-family:monospace;letter-spacing:1px;">${order.invoiceNo || "INV"}</div>
            <div style="font-size:12px;opacity:0.9;">${new Date(order.date || Date.now()).toLocaleDateString("en-IN")}</div>
          </div>
        </div>

        <div style="padding:24px 28px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
            <div>
              <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Bill To</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${order.customerName || "Customer"}</div>
              <div style="font-size:13px;color:#475569;">${customerEmail || ""}</div>
            </div>
            <div style="text-align:right;">
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:${statusColor}1a;color:${statusColor};border:1px solid ${statusColor}33;">${order.status || "Paid"}</span>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Rate</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div style="text-align:right;margin-top:16px;">
            <div style="display:inline-block;text-align:left;">
              <div style="display:flex;justify-content:space-between;gap:40px;font-size:13px;color:#475569;padding:3px 0;">
                <span>Subtotal</span><span style="font-family:monospace;">${money(order.subtotal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:40px;font-size:13px;color:#475569;padding:3px 0;">
                <span>GST (${order.gstRate || 0}%)</span><span style="font-family:monospace;">${money(order.gst)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:40px;font-size:16px;font-weight:700;color:#0f172a;border-top:2px solid #e2e8f0;margin-top:6px;padding-top:8px;">
                <span>Total</span><span style="font-family:monospace;color:#2563eb;">${money(order.totalOrderValue)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:40px;font-size:13px;color:#059669;padding:3px 0;">
                <span>Amount Paid</span><span style="font-family:monospace;">${money(order.amountPaid)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:40px;font-size:13px;color:${(order.balanceDue || 0) > 0 ? "#dc2626" : "#059669"};padding:3px 0;">
                <span>Balance Due</span><span style="font-family:monospace;">${money(order.balanceDue)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eef2f7;font-size:12px;color:#94a3b8;text-align:center;">
            Thank you for your business! This is a system-generated invoice.
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Send an invoice email to a customer.
 * @param {object} options
 * @param {object} options.order - The saved order document.
 * @param {string} options.to - Customer email address.
 * @param {string} [options.businessName] - Business name shown in the email.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendInvoiceEmail({ order, to, businessName }) {
  if (!to || !String(to).trim()) {
    return { success: false, message: "No customer email provided." };
  }
  if (!SMTP_USER || !SMTP_PASS) {
    return {
      success: false,
      message: "Email not configured (SMTP_USER/SMTP_PASS missing in .env).",
    };
  }

  const html = buildInvoiceEmailHtml({
    order,
    customerEmail: to,
    businessName: businessName || "SmartBill",
  });

  const mailOptions = {
    from: EMAIL_FROM,
    to: String(to).trim(),
    subject: `Invoice ${order.invoiceNo || ""} from ${businessName || "SmartBill"}`.trim(),
    html,
  };

  try {
    const info = await transporter().sendMail(mailOptions);
    console.log("INVOICE EMAIL SENT:", info.messageId, "->", to);
    return { success: true, message: "Invoice emailed successfully." };
  } catch (error) {
    console.error("SEND INVOICE EMAIL ERROR:", error.message);

    // Map common SMTP auth failures to a friendly, actionable message so the
    // invoice screen never shows a raw Google server error.
    const msg = String(error.message || "");
    if (/Invalid login|Username and Password not accepted|BadCredentials/i.test(msg)) {
      return {
        success: false,
        message:
          "Email not sent: SMTP credentials rejected. Please set a valid Gmail App Password in Backend/.env (SMTP_USER/SMTP_PASS) and restart the server.",
      };
    }
    if (/ECONNECTION|ETIMEDOUT|ENOTFOUND/i.test(msg)) {
      return {
        success: false,
        message: "Email not sent: could not connect to the email server.",
      };
    }
    return { success: false, message: error.message };
  }
}
