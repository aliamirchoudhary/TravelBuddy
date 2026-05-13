const nodemailer = require('nodemailer');

/**
 * Email Service for TravelBuddy
 * Sends verification and password reset emails via Gmail SMTP.
 * Gracefully fails if EMAIL credentials are not configured.
 */

let transporter = null;

// Only create transporter if credentials are configured
if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Send email verification link after registration.
 */
const sendVerificationEmail = async (toEmail, displayName, token) => {
  if (!transporter) {
    console.warn('[EmailService] EMAIL credentials not configured — skipping verification email to', toEmail);
    console.log('[EmailService] Verification token (for manual testing):', token);
    return;
  }

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"TravelBuddy" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your TravelBuddy account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 30px; background: #0a1628; border-radius: 16px; border: 1px solid rgba(0,212,255,0.15);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #2563eb, #00d4ff); border-radius: 12px; line-height: 48px; font-size: 24px;">✈️</div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 16px 0 0;">TravelBuddy</h1>
        </div>
        <h2 style="color: #f8fafc; font-size: 20px; text-align: center; margin-bottom: 8px;">Welcome, ${displayName}!</h2>
        <p style="color: #94a3b8; font-size: 14px; text-align: center; line-height: 1.7; margin-bottom: 32px;">
          Please verify your email address to activate your account and start planning your adventures.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #00d4ff); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
          This link expires in 24 hours.<br/>
          If you didn't sign up for TravelBuddy, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

/**
 * Send password reset link.
 */
const sendPasswordResetEmail = async (toEmail, token) => {
  if (!transporter) {
    console.warn('[EmailService] EMAIL credentials not configured — skipping reset email to', toEmail);
    console.log('[EmailService] Reset token (for manual testing):', token);
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"TravelBuddy" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your TravelBuddy password',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 30px; background: #0a1628; border-radius: 16px; border: 1px solid rgba(220,38,38,0.2);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #dc2626, #f97316); border-radius: 12px; line-height: 48px; font-size: 24px;">🔒</div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 16px 0 0;">Password Reset</h1>
        </div>
        <p style="color: #94a3b8; font-size: 14px; text-align: center; line-height: 1.7; margin-bottom: 32px;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #f97316); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
          If you didn't request this, ignore this email. Your password will not change.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
