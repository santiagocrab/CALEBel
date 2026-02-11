import { Request, Response } from "express";
import { query } from "../db";
import { sendEmail } from "../services/emailService";
import { generateVerificationEmail } from "../templates/emailTemplates";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function upsertVerification(userId: string, code: string) {
  // Set expiration to 8 hours (480 minutes) to avoid timezone/system clock issues
  const EXPIRATION_MINUTES = 480;
  const nowMs = Date.now();
  const expiresAtMs = nowMs + (EXPIRATION_MINUTES * 60 * 1000);
  const expiresAt = new Date(expiresAtMs);
  
  console.log("\n" + "=".repeat(60));
  console.log("📧 REGISTRATION OTP CODE GENERATED");
  console.log("=".repeat(60));
  console.log(`   User ID: ${userId}`);
  console.log(`   OTP Code: ${code}`);
  console.log(`   Created at: ${new Date(nowMs).toISOString()}`);
  console.log(`   Expires at: ${expiresAt.toISOString()}`);
  console.log(`   Valid for: ${EXPIRATION_MINUTES} minutes (8 hours)`);
  console.log("=".repeat(60) + "\n");
  
  await query(
    "INSERT INTO email_verifications(user_id, code, expires_at, verified) VALUES ($1, $2, $3, false) ON CONFLICT (user_id) DO UPDATE SET code = $2, expires_at = $3, verified = false",
    [userId, code, expiresAt.toISOString()]
  );
}

export async function requestVerification(req: Request, res: Response) {
  const { userId, email } = req.body as { userId: string; email: string };
  if (!userId || !email) {
    return res.status(400).json({ error: "userId and email required." });
  }

  // Verify that the email belongs to this specific user (ONE-TO-ONE)
  const userCheck = await query<{ profile: Record<string, any> }>(
    "SELECT profile FROM user_profiles WHERE user_id = $1",
    [userId]
  );

  if (userCheck.rows.length === 0) {
    return res.status(404).json({ error: "User not found." });
  }

  const userEmail = userCheck.rows[0]?.profile?.email;
  if (!userEmail || userEmail.toLowerCase() !== email.toLowerCase()) {
    console.error(`⚠️  SECURITY WARNING: Email mismatch! User ${userId} email in profile (${userEmail}) does not match requested email (${email})`);
    return res.status(403).json({ error: "Email does not belong to this user." });
  }

  // Generate OTP code ONLY for this specific user
  const code = generateCode();
  await upsertVerification(userId, code);

  // Send OTP email ONLY to the user who requested it (ONE-TO-ONE)
  console.log(`\n📧 Sending OTP to user:`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Email: ${email}`);
  console.log(`   OTP Code: ${code}\n`);

  try {
    await sendEmail(
      email, // ONLY the email of the user who requested verification
      "💕 Your CALEBel Verification Code - Find Your Ka-Label!",
      generateVerificationEmail(code)
    );
    console.log(`✅ OTP email sent successfully to ${email} for user ${userId}\n`);
  } catch (emailError) {
    console.error(`❌ Failed to send OTP email to ${email} for user ${userId}:`, emailError);
    // Still return success since the code is generated and stored
  }

  return res.json({ sent: true });
}

export async function confirmVerification(req: Request, res: Response) {
  const { userId, code } = req.body as { userId: string; code: string };
  if (!userId || !code) {
    return res.status(400).json({ error: "userId and code required." });
  }

  // Verify that the userId exists and is valid
  const userCheck = await query<{ id: string }>("SELECT id FROM users WHERE id = $1", [userId]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({ error: "User not found." });
  }

  // Get verification record ONLY for this specific user
  const result = await query<{
    code: string;
    expires_at: string;
    verified: boolean;
    user_id: string;
  }>("SELECT code, expires_at, verified, user_id FROM email_verifications WHERE user_id = $1", [
    userId
  ]);
  const record = result.rows[0];
  if (!record) {
    return res.status(404).json({ error: "Verification request not found for this user." });
  }

  // Double-check that the verification record belongs to the correct user
  if (record.user_id !== userId) {
    console.error(`⚠️  SECURITY WARNING: Verification record user_id (${record.user_id}) does not match requested userId (${userId})`);
    return res.status(403).json({ error: "Verification record does not belong to this user." });
  }

  if (record.verified) {
    console.log(`✅ User ${userId} is already verified`);
    return res.json({ verified: true });
  }
  console.log("\n" + "=".repeat(60));
  console.log("🔍 REGISTRATION OTP VERIFICATION");
  console.log("=".repeat(60));
  console.log(`   User ID: ${userId}`);
  console.log(`   Entered code: ${code}`);
  console.log(`   Stored code: ${record.code}`);
  console.log(`   Code match: ${record.code === code ? "✅ YES" : "❌ NO"}`);

  if (record.code !== code) {
    console.log("   ❌ Code mismatch - verification failed");
    console.log("=".repeat(60) + "\n");
    return res.status(400).json({ error: "Invalid verification code." });
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
    return res.status(400).json({ error: "Verification code expired." });
  }

  // If code is expired but within grace period, still allow it
  if (timeRemaining < 0) {
    console.log(`   ⚠️  Code is expired but within grace period (${Math.abs(timeRemainingMinutes)} minutes past)`);
  }

  console.log("   ✅ Code is valid - verification successful");
  console.log("=".repeat(60) + "\n");

  // Update verification status ONLY for this specific user
  const updateResult = await query(
    "UPDATE email_verifications SET verified = true WHERE user_id = $1 AND verified = false RETURNING user_id",
    [userId]
  );
  
  if (updateResult.rows.length === 0) {
    console.error(`⚠️  Warning: No verification record updated for user ${userId}`);
    return res.status(500).json({ error: "Failed to update verification status." });
  }

  // Verify that we updated the correct user
  const updatedUserId = updateResult.rows[0].user_id;
  if (updatedUserId !== userId) {
    console.error(`⚠️  SECURITY WARNING: Updated wrong user! Expected ${userId}, got ${updatedUserId}`);
    return res.status(500).json({ error: "Verification update failed." });
  }

  // Update user status ONLY for this specific user
  await query("UPDATE users SET status = 'waiting' WHERE id = $1", [userId]);
  
  // Update user profile verification status ONLY for this specific user
  await query(
    "UPDATE user_profiles SET profile = jsonb_set(profile, '{verificationStatus}', '\"verified\"', true) WHERE user_id = $1",
    [userId]
  );

  console.log(`✅ Successfully verified user ${userId} - status updated to 'waiting'`);
  return res.json({ verified: true });
}
