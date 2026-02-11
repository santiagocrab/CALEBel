import { Request, Response } from "express";
import { query } from "../db";
import { sendEmail } from "../services/emailService";
import { generateVerificationEmail } from "../templates/emailTemplates";

interface RegisterPayload {
  fullName: { first: string; middle?: string; last: string };
  dob: string;
  email: string;
  college: string;
  course: string;
  yearLevel: string;
  alias?: string;
  gcashRef: string;
  paymentProofUrl: string;
  socialLink?: string;
  participationMode: "full" | "anonymous";
  sogiesc: {
    sexualOrientation: string;
    genderIdentity: string;
    genderExpression: string;
    sexCharacteristics: string;
    pronouns: string;
  };
  personality: {
    sunSign: string;
    mbti: string;
    socialBattery: string;
  };
  loveLanguageReceive: string[];
  loveLanguageProvide: string[];
  interests: string[];
  preferred: {
    college: string;
    course: string;
    yearLevel: string;
    identity: string;
  };
  agreeTerms: boolean;
}

function isAdult(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  return age > 18 || (age === 18 && monthDiff >= 0);
}

export async function registerUser(req: Request, res: Response) {
  const payload = req.body as RegisterPayload;

  if (!payload.email || !payload.email.includes("@wvsu.edu.ph")) {
    return res.status(400).json({ error: "Valid WVSU email required." });
  }

  // Check if email is already registered
  const existingUser = await query<{ user_id: string }>(
    `SELECT up.user_id 
     FROM user_profiles up 
     WHERE LOWER(up.profile->>'email') = LOWER($1)`,
    [payload.email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      error: "User is already registered. Please sign in and find your Ka-Label."
    });
  }

  if (!isAdult(payload.dob)) {
    return res.status(400).json({ error: "Must be 18 years or older." });
  }

  if (!payload.agreeTerms) {
    return res.status(400).json({ error: "Must agree to terms." });
  }

  // Determine alias value
  const aliasValue = payload.participationMode === "anonymous" 
    ? (payload.alias || "")
    : (payload.alias || payload.fullName.first);

  if (payload.participationMode === "anonymous" && !aliasValue) {
    return res.status(400).json({ error: "Alias required for anonymous mode." });
  }

  const result = await query<{ id: string }>(
    "INSERT INTO users(alias, status) VALUES ($1, 'pending_verification') RETURNING id",
    [aliasValue]
  );

  const userId = result.rows[0]?.id;
  if (!userId) {
    return res.status(500).json({ error: "Failed to create user." });
  }

  const profile = {
    fullName: payload.fullName,
    dob: payload.dob,
    email: payload.email,
    college: payload.college,
    course: payload.course,
    yearLevel: payload.yearLevel,
    identity: payload.sogiesc?.genderIdentity ?? null,
    gcashRef: payload.gcashRef,
    paymentProofUrl: payload.paymentProofUrl,
    socialLink: payload.socialLink ?? null,
    participationMode: payload.participationMode,
    alias: aliasValue,
    sogiesc: payload.sogiesc,
    personality: payload.personality,
    loveLanguageReceive: payload.loveLanguageReceive,
    loveLanguageProvide: payload.loveLanguageProvide,
    interests: payload.interests,
    preferred: payload.preferred,
    verificationStatus: "pending",
    paymentStatus: "pending"
  };

  await query("INSERT INTO user_profiles(user_id, profile) VALUES ($1, $2)", [
    userId,
    profile
  ]);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  // Create verification record ONLY for this specific user
  await query(
    "INSERT INTO email_verifications(user_id, code, expires_at, verified) VALUES ($1, $2, $3, false) ON CONFLICT (user_id) DO UPDATE SET code = $2, expires_at = $3, verified = false",
    [userId, code, expiresAt.toISOString()]
  );
  
  // Verify the email belongs to this user before sending
  const emailCheck = await query<{ profile: Record<string, any> }>(
    "SELECT profile FROM user_profiles WHERE user_id = $1",
    [userId]
  );
  
  const userEmail = emailCheck.rows[0]?.profile?.email;
  if (!userEmail || userEmail.toLowerCase() !== payload.email.toLowerCase()) {
    console.error(`⚠️  SECURITY WARNING: Email mismatch! User ${userId} email in profile (${userEmail}) does not match registration email (${payload.email})`);
    return res.status(500).json({ error: "Email verification failed. Please contact support." });
  }
  
  // Send OTP email ONLY to the user who registered (ONE-TO-ONE)
  console.log(`\n📧 Sending OTP to registered user:`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Email: ${payload.email}`);
  console.log(`   OTP Code: ${code}\n`);
  
  try {
    await sendEmail(
      payload.email, // ONLY the email of the user who registered
      "💕 Your CALEBel Verification Code - Find Your Ka-Label!",
      generateVerificationEmail(code)
    );
    console.log(`✅ OTP email sent successfully to ${payload.email} for user ${userId}\n`);
  } catch (emailError) {
    // Log error but don't throw - registration should still succeed
    console.error("⚠️  Registration succeeded but email failed to send.");
    console.error("   User ID:", userId);
    console.error("   Verification Code:", code);
    console.error("   Email:", payload.email);
    console.error("   Error:", emailError);
    console.error("   Fix Gmail auth and restart backend to enable emails.");
  }

  return res.status(201).json({ 
    userId, 
    status: "pending_verification",
    verificationCode: code, // Include code in response for testing
    message: "Registration successful. Check email for verification code."
  });
}
