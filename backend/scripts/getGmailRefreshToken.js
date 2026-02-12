/**
 * Helper script to get Gmail API refresh token
 * 
 * Run this once to get your refresh token:
 * 1. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in your environment
 * 2. Run: node scripts/getGmailRefreshToken.js
 * 3. Follow the prompts to authorize and get the refresh token
 * 4. Add GMAIL_REFRESH_TOKEN to your Render environment variables
 */

const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set");
  console.error("");
  console.error("To get these credentials:");
  console.error("1. Go to https://console.cloud.google.com/");
  console.error("2. Create a new project or select existing");
  console.error("3. Enable Gmail API");
  console.error("4. Go to 'Credentials' > 'Create Credentials' > 'OAuth client ID'");
  console.error("5. Choose 'Desktop app' as application type");
  console.error("6. Copy the Client ID and Client Secret");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent"
});

console.log("");
console.log("=".repeat(60));
console.log("🔐 Gmail API OAuth2 Setup");
console.log("=".repeat(60));
console.log("");
console.log("1. Open this URL in your browser:");
console.log("");
console.log(authUrl);
console.log("");
console.log("2. Sign in with: wvsucalebel@gmail.com");
console.log("3. Click 'Allow' to grant permissions");
console.log("4. Copy the authorization code from the page");
console.log("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter the authorization code: ", async (code) => {
  rl.close();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      console.error("");
      console.error("❌ No refresh token received. Make sure you:");
      console.error("   - Selected 'wvsucalebel@gmail.com'");
      console.error("   - Clicked 'Allow' (not 'Cancel')");
      console.error("   - Used the 'consent' prompt (delete and re-run if needed)");
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
    console.error("Common issues:");
    console.error("  - Authorization code expired (get a new one)");
    console.error("  - Wrong Google account (use wvsucalebel@gmail.com)");
    console.error("  - Gmail API not enabled in Google Cloud Console");
    console.error("");
    process.exit(1);
  }
});
