import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromAddress = process.env.SMTP_FROM ?? "CALEBel <no-reply@calebel.local>";

function canSend() {
  return smtpHost && smtpUser && smtpPass;
}

function buildTransport() {
  if (!canSend()) {
    return null;
  }
  
  // Debug: Log password length (not the actual password)
  console.log("📧 Email Service Config:");
  console.log("   Host:", smtpHost);
  console.log("   Port:", smtpPort);
  console.log("   User:", smtpUser);
  console.log("   Pass Length:", smtpPass?.length || 0, "characters");
  
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = buildTransport();
  if (!transport) {
    // eslint-disable-next-line no-console
    console.error("❌ Email skipped (SMTP not configured):", subject, to);
    console.error("   Missing SMTP configuration. Check environment variables:");
    console.error("   SMTP_HOST:", smtpHost || "NOT SET");
    console.error("   SMTP_USER:", smtpUser || "NOT SET");
    console.error("   SMTP_PASS:", smtpPass ? "***" : "NOT SET");
    return;
  }
  
  try {
    const info = await transport.sendMail({
      from: fromAddress,
      to,
      subject,
      html
    });
    // eslint-disable-next-line no-console
    console.log("✅ Email sent successfully!");
    console.log("   To:", to);
    console.log("   Subject:", subject);
    console.log("   Message ID:", info.messageId);
    return info;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to send email:", error);
    console.error("   To:", to);
    console.error("   Subject:", subject);
    
    // Provide helpful error messages for common issues
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error("");
      console.error("⚠️  GMAIL AUTHENTICATION ERROR");
      console.error("   Your Gmail app password is invalid or expired.");
      console.error("   Please follow these steps:");
      console.error("   1. Enable 2-Step Verification on your Google Account");
      console.error("   2. Generate a new App Password: https://myaccount.google.com/apppasswords");
      console.error("   3. Update SMTP_PASS in your .env file");
      console.error("   4. Restart the backend server");
      console.error("");
      console.error("   See backend/GMAIL_SETUP.md for detailed instructions");
    }
    
    throw error;
  }
}
