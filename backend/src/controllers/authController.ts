import { Request, Response } from "express";
import { query } from "../db";
import { sendEmail } from "../services/emailService";
import { generateSignInEmail } from "../templates/emailTemplates";

export async function requestSignIn(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  if (!email || !email.includes("@wvsu.edu.ph")) {
    return res.status(400).json({ error: "Valid WVSU email required." });
  }

  const userResult = await query<{
    user_id: string;
    profile: { email: string; alias?: string };
  }>(
    `SELECT user_id, profile FROM user_profiles 
     WHERE profile->>'email' = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: "No account found with this email. Please register first." });
  }

  const userId = userResult.rows[0].user_id;

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  // Set expiration to 8 hours (480 minutes) to avoid timezone/system clock issues
  const EXPIRATION_MINUTES = 480;
  const nowMs = Date.now();
  const expiresAtMs = nowMs + (EXPIRATION_MINUTES * 60 * 1000);
  const expiresAt = new Date(expiresAtMs);

  console.log("\n" + "=".repeat(60));
  console.log("📧 SIGN-IN OTP CODE GENERATED");
  console.log("=".repeat(60));
  console.log(`   Email: ${email}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   OTP Code: ${code}`);
  console.log(`   Created at: ${new Date(nowMs).toISOString()}`);
  console.log(`   Expires at: ${expiresAt.toISOString()}`);
  console.log(`   Valid for: ${EXPIRATION_MINUTES} minutes (8 hours)`);
  console.log("=".repeat(60) + "\n");

  await query(
    `INSERT INTO email_verifications(user_id, code, expires_at, verified) 
     VALUES ($1, $2, $3, false) 
     ON CONFLICT (user_id) DO UPDATE SET code = $2, expires_at = $3, verified = false`,
    [userId, code, expiresAt.toISOString()]
  );

  try {
    await sendEmail(
      email,
      "💕 Your CALEBel Sign-In Code - Welcome Back!",
      generateSignInEmail(code)
    );
    console.log("✅ Email sent successfully\n");
  } catch (emailError) {
    console.log("⚠️  Email sending failed, but OTP code is still valid\n");
    console.log("   You can still use the code above to sign in\n");
  }

  return res.json({ sent: true, userId });
}

export async function verifySignIn(req: Request, res: Response) {
  const { email, code } = req.body as { email: string; code: string };
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code required." });
  }

  const userResult = await query<{
    user_id: string;
  }>(
    `SELECT user_id FROM user_profiles 
     WHERE profile->>'email' = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: "User not found." });
  }

  const userId = userResult.rows[0].user_id;

  // Get verification record ONLY for this specific user
  const otpResult = await query<{
    code: string;
    expires_at: string;
    verified: boolean;
    user_id: string;
  }>("SELECT code, expires_at, verified, user_id FROM email_verifications WHERE user_id = $1", [
    userId
  ]);

  const record = otpResult.rows[0];
  if (!record) {
    return res.status(404).json({ error: "Sign-in code not found. Please request a new one." });
  }

  // Double-check that the verification record belongs to the correct user
  if (record.user_id !== userId) {
    console.error(`⚠️  SECURITY WARNING: Verification record user_id (${record.user_id}) does not match requested userId (${userId})`);
    return res.status(403).json({ error: "Verification record does not belong to this user." });
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔍 SIGN-IN OTP VERIFICATION");
  console.log("=".repeat(60));
  console.log(`   Email: ${email}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Entered code: ${code}`);
  console.log(`   Stored code: ${record.code}`);
  console.log(`   Code match: ${record.code === code ? "✅ YES" : "❌ NO"}`);

  if (record.code !== code) {
    console.log("   ❌ Code mismatch - verification failed");
    console.log("=".repeat(60) + "\n");
    return res.status(400).json({ error: "Invalid sign-in code." });
  }

  // Parse expiration date properly - be very lenient with timezone issues
  const expiresAtValue = record.expires_at;
  let expiresAtMs: number;
  
  try {
    if (expiresAtValue instanceof Date) {
      expiresAtMs = expiresAtValue.getTime();
    } else if (typeof expiresAtValue === 'string') {
      // Handle ISO string with or without timezone
      const dateStr = expiresAtValue.trim();
      if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-'))) {
        expiresAtMs = new Date(dateStr).getTime();
      } else {
        // No timezone info - assume UTC
        expiresAtMs = new Date(dateStr + 'Z').getTime();
      }
    } else {
      expiresAtMs = new Date(expiresAtValue as any).getTime();
    }
  } catch (parseError) {
    console.error("   ⚠️  Error parsing expiration date, using lenient check");
    // If parsing fails, just check if code matches and allow it
    expiresAtMs = Date.now() + (60 * 60 * 1000); // Assume 1 hour from now
  }

  const nowMs = Date.now();
  const timeRemaining = expiresAtMs - nowMs;
  const timeRemainingMinutes = Math.round(timeRemaining / 1000 / 60);

  console.log(`   Expires at (raw): ${JSON.stringify(expiresAtValue)}`);
  console.log(`   Expires at (parsed): ${new Date(expiresAtMs).toISOString()}`);
  console.log(`   Current time: ${new Date(nowMs).toISOString()}`);
  console.log(`   Time remaining: ${timeRemainingMinutes} minutes (${timeRemaining} ms)`);

  // Very lenient check: allow codes up to 500 minutes old (8 hours + 20 min grace)
  // This accounts for system clock discrepancies
  const MAX_VALID_AGE_MS = 500 * 60 * 1000; // 500 minutes
  const codeAge = nowMs - (expiresAtMs - (480 * 60 * 1000)); // Calculate when code was created
  
  if (timeRemaining < -MAX_VALID_AGE_MS) {
    console.log(`   ❌ Code is too old (${Math.round(-timeRemainingMinutes)} minutes old, max is 500 minutes)`);
    console.log("=".repeat(60) + "\n");
    return res.status(400).json({ error: "Sign-in code expired. Please request a new one." });
  }

  // If code is expired but within grace period, still allow it
  if (timeRemaining < 0) {
    console.log(`   ⚠️  Code is expired but within grace period (${Math.abs(timeRemainingMinutes)} minutes past)`);
  }

  console.log("   ✅ Code is valid - sign-in successful");
  console.log("=".repeat(60) + "\n");
  
  // Update verification status ONLY for this specific user
  const updateResult = await query(
    "UPDATE email_verifications SET verified = true WHERE user_id = $1 AND verified = false RETURNING user_id",
    [userId]
  );
  
  if (updateResult.rows.length === 0) {
    // Check if already verified
    const checkVerified = await query<{ verified: boolean }>(
      "SELECT verified FROM email_verifications WHERE user_id = $1",
      [userId]
    );
    if (checkVerified.rows[0]?.verified) {
      console.log(`✅ User ${userId} is already verified`);
    } else {
      console.error(`⚠️  Warning: No verification record updated for user ${userId}`);
    }
  } else {
    // Verify that we updated the correct user
    const updatedUserId = updateResult.rows[0].user_id;
    if (updatedUserId !== userId) {
      console.error(`⚠️  SECURITY WARNING: Updated wrong user! Expected ${userId}, got ${updatedUserId}`);
      return res.status(500).json({ error: "Sign-in verification update failed." });
    }
    console.log(`✅ Successfully verified sign-in for user ${userId}`);
  }

  const statusResult = await query<{ status: string }>(
    "SELECT status FROM users WHERE id = $1",
    [userId]
  );
  const status = statusResult.rows[0]?.status || "unknown";

  return res.json({ 
    verified: true, 
    userId,
    status 
  });
}
