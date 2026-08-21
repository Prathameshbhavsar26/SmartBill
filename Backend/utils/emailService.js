import nodemailer from "nodemailer";
import SystemSettings from "../models/SystemSettings.js";

/**
 * Query SystemSettings from MongoDB for the requested email template.
 * @param {string|number} templateIdentifier Template Name or ID
 */
export const getSystemTemplate = async (templateIdentifier) => {
  try {
    const settings = await SystemSettings.findOne({ key: "global_system_settings" }).lean();
    if (!settings || !Array.isArray(settings.emailTemplates)) {
      return null;
    }

    const searchKey = String(templateIdentifier).toLowerCase().replace(/email/g, "").trim();

    const template = settings.emailTemplates.find((t) => {
      if (t.id === templateIdentifier || t.id === Number(templateIdentifier)) return true;
      const tName = String(t.name).toLowerCase().replace(/email/g, "").trim();
      return tName === searchKey || tName.includes(searchKey) || searchKey.includes(tName);
    });

    return template || null;
  } catch (err) {
    console.error("Failed to query SystemSettings for email templates:", err);
    return null;
  }
};

/**
 * Replace placeholders like {user_name}, {invoice_no}, {amount}, {reset_link}, {expiry_date}
 */
export const replacePlaceholders = (text = "", variables = {}) => {
  if (!text) return "";
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
};

/**
 * Construct an SMTP transporter from environment variables.
 */
const getTransporter = async () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    if (host) {
      return {
        transporter: nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        }),
        isTest: false,
      };
    }

    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      }),
      isTest: false,
    };
  }

  // Automatic Ethereal test account fallback if real credentials missing
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      isTest: true,
    };
  } catch (err) {
    console.warn("Could not create Ethereal test account:", err.message);
    return { transporter: null, isTest: false };
  }
};

/**
 * Generic Email Dispatcher that respects active/inactive status & custom templates from MongoDB
 */
export const sendSystemEmail = async ({
  templateName,
  toEmail,
  variables = {},
  defaultSubject = "",
  defaultBody = "",
  customHtml = null,
}) => {
  try {
    // 1. Fetch template settings from MongoDB
    const templateConfig = await getSystemTemplate(templateName);

    // 2. Check if template is disabled in SuperAdmin settings
    if (templateConfig && templateConfig.status === "inactive") {
      console.log(
        `[EMAIL SKIPPED] Email template "${templateName}" is currently set to INACTIVE in SuperAdmin settings.`
      );
      return {
        success: false,
        skipped: true,
        reason: `Email template "${templateName}" is disabled in SuperAdmin settings.`,
      };
    }

    // 3. Determine subject line & body text
    const rawSubject = templateConfig?.subject || defaultSubject || `Notification - ${templateName}`;
    const rawBody = templateConfig?.body || defaultBody;

    const finalSubject = replacePlaceholders(rawSubject, variables);
    const finalBody = replacePlaceholders(rawBody, variables);

    // 4. Build HTML layout
    const htmlContent = customHtml
      ? replacePlaceholders(customHtml, variables)
      : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${finalSubject}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 700; }
    .content { padding: 28px 24px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; color: #334155; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${variables.business_name || "SmartBill"}</h2>
    </div>
    <div class="content">${finalBody}</div>
    <div class="footer">
      This is an automated system notification from ${variables.business_name || "SmartBill"}.
    </div>
  </div>
</body>
</html>
      `;

    // 5. Send via Transporter
    const { transporter, isTest } = await getTransporter();
    if (!transporter) {
      return { success: false, error: "SMTP credentials not configured in backend." };
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      process.env.EMAIL_USER ||
      `"Smart Bill System" <no-reply@smartbill.com>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: finalSubject,
      html: htmlContent,
    });

    const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log(`[EMAIL TEST PREVIEW] View "${templateName}" email: ${previewUrl}`);
    } else {
      console.log(`[EMAIL SUCCESS] "${templateName}" email sent to ${toEmail}. Message ID: ${info.messageId}`);
    }

    return { success: true, messageId: info.messageId, previewUrl, isTest };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send "${templateName}" email to ${toEmail}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome Email to Business Owner or User
 */
export const sendWelcomeEmail = async ({
  toEmail,
  userName = "User",
  businessName = "Smart Bill",
  tempPassword = "",
  role = "Owner",
  portalUrl = process.env.CLIENT_URL || "http://localhost:5173/login",
}) => {
  return sendSystemEmail({
    templateName: "Welcome Email",
    toEmail,
    variables: {
      user_name: userName,
      employee_name: userName,
      temp_password: tempPassword,
      business_name: businessName,
      role: role,
      portal_url: portalUrl,
    },
    defaultSubject: `Welcome to ${businessName}`,
    defaultBody: `Hello ${userName},\n\nWelcome to ${businessName}! We are excited to have you onboard.\n\nBest regards,\n${businessName} Team`,
  });
};

/**
 * Send Employee Login Credentials via Email
 */
export const sendEmployeeCredentialsEmail = async ({
  toEmail,
  employeeName,
  tempPassword,
  businessName = "Smart Bill",
  role = "Employee",
  portalUrl = process.env.CLIENT_URL || "http://localhost:5173/login",
}) => {
  return sendWelcomeEmail({
    toEmail,
    userName: employeeName,
    businessName,
    tempPassword,
    role,
    portalUrl,
  });
};

/**
 * Send Invoice Email
 */
export const sendInvoiceEmail = async ({
  toEmail,
  invoiceNo,
  amount,
  userName = "Valued Customer",
  businessName = "Smart Bill",
}) => {
  return sendSystemEmail({
    templateName: "Invoice Email",
    toEmail,
    variables: {
      invoice_no: invoiceNo,
      amount: amount,
      user_name: userName,
      business_name: businessName,
    },
    defaultSubject: `Your Invoice - ${invoiceNo}`,
    defaultBody: `Dear ${userName},\n\nPlease find attached your invoice ${invoiceNo} for amount ${amount}.\n\nThank you for your business!`,
  });
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async ({
  toEmail,
  userName = "User",
  resetLink = "#",
  businessName = "Smart Bill",
}) => {
  return sendSystemEmail({
    templateName: "Password Reset",
    toEmail,
    variables: {
      user_name: userName,
      reset_link: resetLink,
      business_name: businessName,
    },
    defaultSubject: "Reset Your Password",
    defaultBody: `Hello ${userName},\n\nYou requested to reset your password. Click the link below to proceed:\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
  });
};

/**
 * Send Subscription Reminder Email
 */
export const sendSubscriptionReminderEmail = async ({
  toEmail,
  userName = "Business Owner",
  expiryDate = "soon",
  businessName = "Smart Bill",
}) => {
  return sendSystemEmail({
    templateName: "Subscription Reminder",
    toEmail,
    variables: {
      user_name: userName,
      expiry_date: expiryDate,
      business_name: businessName,
    },
    defaultSubject: "Your subscription expires soon",
    defaultBody: `Hello ${userName},\n\nYour SmartBill subscription is scheduled to expire on ${expiryDate}. Please renew your plan to avoid service interruption.`,
  });
};
