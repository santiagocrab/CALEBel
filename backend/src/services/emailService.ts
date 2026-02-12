import nodemailer from "nodemailer";
import { google } from "googleapis";

const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER?.trim();
// Google app passwords are often shown with spaces; strip them automatically.
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");
const fromAddress = process.env.SMTP_FROM ?? (smtpUser ? `CALEBel <${smtpUser}>` : "CALEBel <no-reply@calebel.local>");

// Gmail API OAuth2 credentials (optional, for when SMTP is blocked)
const gmailClientId = process.env.GMAIL_CLIENT_ID?.trim();
const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();

function canSend() {
  return Boolean(smtpUser && smtpPass) || Boolean(gmailClientId && gmailClientSecret && gmailRefreshToken);
}

function buildTransport(host: string, port: number) {
  if (!smtpUser || !smtpPass) {
    return null;
  }
  
  // Debug: Log password length (not the actual password)
  console.log("📧 Email Service Config (SMTP):");
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
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
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

async function sendViaGmailAPI(to: string, subject: string, html: string) {
  if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken || !smtpUser) {
    return null;
  }

  try {
    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      gmailClientId,
      gmailClientSecret,
      "urn:ietf:wg:oauth:2.0:oob" // Out-of-band redirect (for refresh token)
    );

    oauth2Client.setCredentials({
      refresh_token: gmailRefreshToken
    });

    // Get access token
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error("Failed to get access token from Gmail API");
    }

    // Create Gmail API client
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create email message in RFC 2822 format
    const message = [
      `From: ${fromAddress}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      html
    ].join("\n");

    // Encode message in base64url format
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email via Gmail API
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log("✅ Email sent successfully via Gmail API!");
    console.log("   To:", to);
    console.log("   Subject:", subject);
    console.log("   Message ID:", response.data.id);
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed via Gmail API:", error?.message || error);
    throw error;
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!canSend()) {
    console.error("❌ Email skipped (no email configuration):", subject, to);
    console.error("   Missing email configuration. Check environment variables:");
    console.error("   SMTP_USER:", smtpUser || "NOT SET");
    console.error("   SMTP_PASS:", smtpPass ? "***" : "NOT SET");
    console.error("   GMAIL_CLIENT_ID:", gmailClientId ? "SET" : "NOT SET");
    console.error("   GMAIL_CLIENT_SECRET:", gmailClientSecret ? "SET" : "NOT SET");
    console.error("   GMAIL_REFRESH_TOKEN:", gmailRefreshToken ? "SET" : "NOT SET");
    return;
  }

  // Try Gmail API first (works when SMTP ports are blocked)
  if (gmailClientId && gmailClientSecret && gmailRefreshToken && smtpUser) {
    try {
      return await sendViaGmailAPI(to, subject, html);
    } catch (err: any) {
      console.error("❌ Gmail API failed, falling back to SMTP:", err?.message || err);
      // Fall through to SMTP
    }
  }

  // Fall back to SMTP if Gmail API is not configured or failed
  if (!smtpUser || !smtpPass) {
    throw new Error("No working email provider configured. Set SMTP credentials or Gmail API OAuth2 credentials.");
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
      console.log("✅ Email sent successfully via SMTP!");
      console.log("   To:", to);
      console.log("   Subject:", subject);
      console.log("   Message ID:", info.messageId);
      console.log(`   SMTP: ${candidate.host}:${candidate.port}`);
      return info;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Failed via SMTP ${candidate.host}:${candidate.port}`, error?.code || error);
      
      // If SMTP times out, try Gmail API as fallback
      if (error?.code === "ETIMEDOUT" && gmailClientId && gmailClientSecret && gmailRefreshToken) {
        console.log("🔄 SMTP timed out, trying Gmail API...");
        try {
          return await sendViaGmailAPI(to, subject, html);
        } catch (gmailError: any) {
          console.error("❌ Gmail API also failed:", gmailError?.message || gmailError);
          // Continue to next SMTP candidate
        }
      }
    }
  }

  console.error("❌ Failed to send email via all methods:", lastError);
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
  }

  if (lastError?.code === "ETIMEDOUT") {
    console.error("");
    console.error("⚠️  SMTP CONNECTION TIMEOUT");
    console.error("   Render is blocking SMTP ports (587, 465).");
    console.error("   Solution: Set up Gmail API OAuth2 credentials:");
    console.error("   1. Go to https://console.cloud.google.com/");
    console.error("   2. Create a new project or select existing");
    console.error("   3. Enable Gmail API");
    console.error("   4. Create OAuth2 credentials (Desktop app)");
    console.error("   5. Get refresh token (see DEPLOYMENT.md)");
    console.error("   6. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN");
    console.error("");
  }

  throw lastError;
}
