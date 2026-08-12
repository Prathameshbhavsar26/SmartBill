import nodemailer from "nodemailer";

/**
 * Helper to construct an SMTP transporter from environment variables.
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

    // Default to Gmail service if user/pass provided without explicit host
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
 * Send Employee Login Credentials via Email.
 *
 * @param {object} params
 * @param {string} params.toEmail Employee's email address
 * @param {string} params.employeeName Employee's full name
 * @param {string} params.tempPassword Temporary password configured by owner
 * @param {string} params.businessName Business name of the owner
 * @param {string} params.role Assigned role (e.g. Cashier, Manager)
 * @param {string} [params.portalUrl] Application login URL
 */
export const sendEmployeeCredentialsEmail = async ({
  toEmail,
  employeeName,
  tempPassword,
  businessName = "Smart Bill",
  role = "Employee",
  portalUrl = process.env.CLIENT_URL || "http://localhost:5173/login",
}) => {
  try {
    const { transporter, isTest } = await getTransporter();
    const fromAddress =
      process.env.SMTP_FROM ||
      process.env.EMAIL_USER ||
      `"Smart Bill System" <no-reply@smartbill.com>`;

    const subject = `Welcome to ${businessName} - Your Smart Bill Login Credentials`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Smart Bill Account Credentials</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; }
    .badge { display: inline-block; background: rgba(37, 99, 235, 0.2); color: #60a5fa; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-top: 12px; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .message { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .card { background: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px solid #cbd5e1; margin-bottom: 24px; }
    .card-row { margin-bottom: 12px; }
    .card-row:last-child { margin-bottom: 0; }
    .card-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
    .card-value { font-size: 15px; color: #0f172a; font-weight: 600; font-family: monospace; word-break: break-all; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3); }
    .notice { font-size: 12px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; }
    .footer { background: #f8fafc; padding: 20px 28px; text-align: center; border-t: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Smart Bill</h1>
      <p>Business Billing & Management System</p>
      <div class="badge">${businessName}</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${employeeName},</div>
      <p class="message">
        Your employee account has been successfully created by <strong>${businessName}</strong>. You have been assigned the role of <strong>${role}</strong>.
      </p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Login Email</span>
          <span class="card-value">${toEmail}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Temporary Password</span>
          <span class="card-value" style="color: #2563eb;">${tempPassword}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Assigned Role</span>
          <span class="card-value" style="font-family: inherit;">${role}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${portalUrl}" class="btn" target="_blank">Log In to Smart Bill</a>
      </div>

      <div class="notice">
        🔒 <strong>Security Note:</strong> Please log in to your account using the credentials above and update your password after your initial login.
      </div>
    </div>

    <div class="footer">
      This is an automated message generated by Smart Bill for ${businessName}.<br>
      Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
    `;

    if (!transporter) {
      const warnMsg = "SMTP credentials not configured in backend .env";
      return { success: false, error: warnMsg };
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : null;

    if (previewUrl) {
      console.log(`[EMAIL TEST PREVIEW] View email: ${previewUrl}`);
    } else {
      console.log(`[EMAIL SUCCESS] Credentials email sent to ${toEmail}. Message ID: ${info.messageId}`);
    }

    return { success: true, messageId: info.messageId, previewUrl, isTest };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};
