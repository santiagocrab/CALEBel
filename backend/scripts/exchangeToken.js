/**
 * Exchange authorization code for refresh token
 * Usage: node scripts/exchangeToken.js <authorization-code>
 */

const { google } = require("googleapis");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "1019165335079-e5kn4fbtf92e8f2omv9k0ni51a2tt0s7.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "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";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const AUTH_CODE = process.argv[2];

if (!AUTH_CODE) {
  console.error("❌ Error: Authorization code required");
  console.error("");
  console.error("Usage: node scripts/exchangeToken.js <authorization-code>");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

(async () => {
  try {
    const { tokens } = await oauth2Client.getToken(AUTH_CODE);
    
    if (!tokens.refresh_token) {
      console.error("");
      console.error("❌ No refresh token received. This might mean:");
      console.error("   - You already authorized this app before (revoke access and try again)");
      console.error("   - The authorization code expired");
      console.error("");
      console.error("Try getting a new authorization code with:");
      console.error("   node scripts/getGmailRefreshToken.js");
      process.exit(1);
    }

    console.log("");
    console.log("=".repeat(60));
    console.log("✅ SUCCESS! Your Gmail API credentials:");
    console.log("=".repeat(60));
    console.log("");
    console.log("Add these to your Render environment variables:");
    console.log("");
    console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("");
    console.log("=".repeat(60));
    console.log("");
    console.log("⚠️  Keep these credentials secure! Never commit them to git.");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ Error getting refresh token:", error.message);
    console.error("");
    if (error.message.includes("invalid_grant")) {
      console.error("This usually means:");
      console.error("  - Authorization code expired (get a new one)");
      console.error("  - Authorization code already used");
      console.error("  - Wrong Google account used");
      console.error("");
    }
    process.exit(1);
  }
})();
