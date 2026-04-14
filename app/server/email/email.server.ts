import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a password reset email with a styled HTML template.
 *
 * Required env vars:
 *  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — Brevo SMTP credentials
 *  - SMTP_FROM — Your verified sender email in Brevo (e.g. "you@yourdomain.com")
 *    This is DIFFERENT from SMTP_USER (which is a technical login like "a399@smtp-brevo.com").
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string,
) {
  // In development, always log the URL for easy testing
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n🔑 Password Reset Link (dev): ${resetUrl}\n`);
  }

  // Only attempt to send if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(
      "⚠️  SMTP not configured — skipping email send. Use the logged URL above.",
    );
    return;
  }

  // Use SMTP_FROM (your verified sender) — fallback to SMTP_USER if not set
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from: `"StudyVault" <${fromAddress}>`,
      to: toEmail,
      subject: "Reset Your Password — StudyVault",
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;">
          <div style="text-align:center;padding:24px 0;">
            <h2 style="color:#d97757;margin:0;">StudyVault</h2>
          </div>
          <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:32px;">
            <h3 style="margin-top:0;">Reset Your Password</h3>
            <p>We received a request to reset your password. Click the button below to choose a new one:</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:#d97757;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
                Reset Password
              </a>
            </div>
            <p style="font-size:13px;color:#888;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:12px;color:#aaa;margin:0;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="font-size:12px;color:#d97757;word-break:break-all;margin:4px 0 0;">${resetUrl}</p>
          </div>
        </div>
      `,
    });
    console.log(
      `✅ Password reset email sent to ${toEmail} (messageId: ${info.messageId})`,
    );
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    // Don't throw — we still want to show the success message to the user
    // (prevents email enumeration and avoids breaking the UX)
  }
}
