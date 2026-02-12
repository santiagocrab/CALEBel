import nodemailer from "nodemailer";

const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER?.trim();
// Google app passwords are often shown with spaces; strip them automatically.
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");
const fromAddress = process.env.SMTP_FROM ?? (smtpUser ? `CALEBel <${smtpUser}>` : "CALEBel <no-reply@calebel.local>");

function canSend() {
  return Boolean(smtpUser && smtpPass);
}

function buildTransport(host: string, port: number) {
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
    service: host.includes("gmail") ? "gmail" : undefined,
    host,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });
}

function getTransportCandidates() {
  const candidates: Array<{ host: string; port: number }> = [];
  const pushUnique = (host: string, port: number) => {
    if (!candidates.some((c) => c.host === host && c.port === port)) {
      candidates.push({ host, port });
    }
  };

  // Primary configured transport first
  pushUnique(smtpHost, smtpPort);

  // For Gmail, always try both common ports.
  if (smtpHost.includes("gmail")) {
    pushUnique(smtpHost, 587); // STARTTLS
    pushUnique(smtpHost, 465); // SSL/TLS
  }

  return candidates;
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!canSend()) {
    // eslint-disable-next-line no-console
    console.error("❌ Email skipped (SMTP not configured):", subject, to);
    console.error("   Missing SMTP configuration. Check environment variables:");
    console.error("   SMTP_HOST:", smtpHost || "NOT SET");
    console.error("   SMTP_USER:", smtpUser || "NOT SET");
    console.error("   SMTP_PASS:", smtpPass ? "***" : "NOT SET");
    return;
  }
  
  const candidates = getTransportCandidates();
  let lastError: any = null;

  for (const candidate of candidates) {
    const transport = buildTransport(candidate.host, candidate.port);
    if (!transport) continue;

    try {
      const info = await transport.sendMail({
        from: fromAddress,
        to,
        subject,
        html
      });
      console.log("✅ Email sent successfully!");
      console.log("   To:", to);
      console.log("   Subject:", subject);
      console.log("   Message ID:", info.messageId);
      console.log(`   SMTP: ${candidate.host}:${candidate.port}`);
      return info;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Failed via SMTP ${candidate.host}:${candidate.port}`, error?.code || error);
    }
  }

  console.error("❌ Failed to send email:", lastError);
  console.error("   To:", to);
  console.error("   Subject:", subject);
  
  // Provide helpful error messages for common issues
  if (lastError?.code === "EAUTH" || lastError?.responseCode === 535) {
    console.error("");
    console.error("⚠️  GMAIL AUTHENTICATION ERROR");
    console.error("   Your Gmail app password is invalid or expired.");
    console.error("   Please follow these steps:");
    console.error("   1. Enable 2-Step Verification on your Google Account");
    console.error("   2. Generate a new App Password: https://myaccount.google.com/apppasswords");
    console.error("   3. Update SMTP_PASS in your environment variables");
    console.error("   4. Restart/redeploy the backend service");
    console.error("");
    console.error("   See backend/GMAIL_SETUP.md for detailed instructions");
  }

  throw lastError;
}
