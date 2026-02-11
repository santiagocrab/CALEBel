import { Request, Response } from "express";
import { query } from "../db";
import { createChatMessage, incrementChatLimit } from "../services/chatService";

export async function checkTestAccounts(req: Request, res: Response) {
  try {
    const user1 = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      ["testuser1@wvsu.edu.ph"]
    );
    const user2 = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      ["testuser2@wvsu.edu.ph"]
    );

    return res.json({
      user1: {
        exists: user1.rows.length > 0,
        userId: user1.rows[0]?.user_id || null,
        email: user1.rows[0]?.profile?.email || null
      },
      user2: {
        exists: user2.rows.length > 0,
        userId: user2.rows[0]?.user_id || null,
        email: user2.rows[0]?.profile?.email || null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Debug endpoint to send a message as a test account
 * POST /api/test/send-message-as-partner
 * Body: { matchId, message }
 */
export async function sendMessageAsPartner(req: Request, res: Response) {
  try {
    const { matchId, message } = req.body as { matchId: string; message: string };
    const currentUserId = req.body.userId || req.query.userId as string;

    if (!matchId || !message) {
      return res.status(400).json({ error: "matchId and message required." });
    }

    // Get the match to find the partner
    const matchResult = await query<{ user1_id: string; user2_id: string }>(
      "SELECT user1_id, user2_id FROM matches WHERE id = $1",
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: "Match not found." });
    }

    const match = matchResult.rows[0];
    
    // Determine partner ID
    let partnerId: string;
    if (currentUserId) {
      // If currentUserId is provided, use the other user as partner
      partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
    } else {
      // Otherwise, use user2 as the partner (for debugging)
      partnerId = match.user2_id;
    }

    // Check if partner is a test account
    const partnerCheck = await query<{ alias: string }>(
      "SELECT alias FROM users WHERE id = $1",
      [partnerId]
    );

    const partnerAlias = partnerCheck.rows[0]?.alias || "TestUser";

    // Send the message
    const messageId = await createChatMessage(matchId, partnerId, message);
    await incrementChatLimit(matchId, partnerId);

    console.log("\n" + "=".repeat(60));
    console.log("💬 DEBUG: Message sent as partner");
    console.log("=".repeat(60));
    console.log(`   Match ID: ${matchId}`);
    console.log(`   Partner ID: ${partnerId}`);
    console.log(`   Partner Alias: ${partnerAlias}`);
    console.log(`   Message: ${message}`);
    console.log(`   Message ID: ${messageId}`);
    console.log("=".repeat(60) + "\n");

    return res.json({
      success: true,
      messageId,
      partnerId,
      partnerAlias,
      message
    });
  } catch (error: any) {
    console.error("Error sending debug message:", error);
    return res.status(500).json({ 
      error: "Failed to send message",
      details: error.message 
    });
  }
}

export async function createTestAccounts(req: Request, res: Response) {
  try {
    console.log("🧪 Starting test account creation...");

    const existing1 = await query<{ user_id: string }>(
      "SELECT user_id FROM user_profiles WHERE profile->>'email' = $1",
      ["testuser1@wvsu.edu.ph"]
    );
    const existing2 = await query<{ user_id: string }>(
      "SELECT user_id FROM user_profiles WHERE profile->>'email' = $1",
      ["testuser2@wvsu.edu.ph"]
    );

    if (existing1.rows.length > 0 || existing2.rows.length > 0) {
      console.log("⚠️  Test accounts already exist");
      return res.status(400).json({ 
        error: "Test accounts already exist. Delete them first or use existing accounts.",
        existing: {
          user1: existing1.rows[0]?.user_id || null,
          user2: existing2.rows[0]?.user_id || null
        },
        message: "You can still use the existing accounts to sign in."
      });
    }

    console.log("📝 Creating User 1...");
    const user1Result = await query<{ id: string }>(
      "INSERT INTO users(alias, status) VALUES ($1, 'waiting') RETURNING id",
      ["TestUser1"]
    );
    const userId1 = user1Result.rows[0]?.id;
    console.log("   ✅ User 1 created:", userId1);

    const profile1 = {
      fullName: { first: "Test", last: "User", middle: "One" },
      dob: "2000-01-01",
      email: "testuser1@wvsu.edu.ph",
      college: "College of Arts and Sciences",
      course: "Computer Science",
      yearLevel: "3rd Year",
      alias: "TestUser1",
      gcashRef: "TEST001",
      paymentProofUrl: "https://example.com/proof1.jpg",
      participationMode: "full",
      sogiesc: {
        sexualOrientation: "Heterosexual",
        genderIdentity: "Cisgender",
        genderExpression: "Masculine",
        sexCharacteristics: "Male",
        pronouns: "He/Him"
      },
      personality: {
        sunSign: "Aries",
        mbti: "ENFP",
        socialBattery: "Extrovert"
      },
      loveLanguageReceive: ["Words of Affirmation", "Quality Time"],
      loveLanguageProvide: ["Acts of Service", "Physical Touch"],
      interests: ["Gaming", "Music", "Movies", "Sports", "Tech", "Books", "Anime", "Cooking"],
      preferred: {
        college: "Any",
        course: "Any",
        yearLevel: "Any",
        identity: "Any"
      },
      verificationStatus: "verified",
      paymentStatus: "verified"
    };

    await query("INSERT INTO user_profiles(user_id, profile) VALUES ($1, $2)", [
      userId1,
      profile1
    ]);
    console.log("   ✅ Profile 1 created");

    console.log("📝 Creating User 2...");
    const user2Result = await query<{ id: string }>(
      "INSERT INTO users(alias, status) VALUES ($1, 'waiting') RETURNING id",
      ["TestUser2"]
    );
    const userId2 = user2Result.rows[0]?.id;
    console.log("   ✅ User 2 created:", userId2);

    const profile2 = {
      fullName: { first: "Test", last: "User", middle: "Two" },
      dob: "2000-02-02",
      email: "testuser2@wvsu.edu.ph",
      college: "College of Arts and Sciences",
      course: "Information Technology",
      yearLevel: "3rd Year",
      alias: "TestUser2",
      gcashRef: "TEST002",
      paymentProofUrl: "https://example.com/proof2.jpg",
      participationMode: "full",
      sogiesc: {
        sexualOrientation: "Heterosexual",
        genderIdentity: "Cisgender",
        genderExpression: "Feminine",
        sexCharacteristics: "Female",
        pronouns: "She/Her"
      },
      personality: {
        sunSign: "Libra",
        mbti: "ISFJ",
        socialBattery: "Introvert"
      },
      loveLanguageReceive: ["Quality Time", "Acts of Service"],
      loveLanguageProvide: ["Words of Affirmation", "Gifts"],
      interests: ["Gaming", "Music", "Movies", "Sports", "Tech", "Books", "Anime", "Art"],
      preferred: {
        college: "Any",
        course: "Any",
        yearLevel: "Any",
        identity: "Any"
      },
      verificationStatus: "verified",
      paymentStatus: "verified"
    };

    await query("INSERT INTO user_profiles(user_id, profile) VALUES ($1, $2)", [
      userId2,
      profile2
    ]);
    console.log("   ✅ Profile 2 created");

    console.log("💕 Creating match...");
    const matchResult = await query<{ id: string }>(
      "INSERT INTO matches(user1_id, user2_id, compatibility_score, reasons) VALUES ($1, $2, $3, $4) RETURNING id",
      [userId1, userId2, 85, ["Shared interests", "Compatible personalities", "Love language overlap"]]
    );
    const matchId = matchResult.rows[0]?.id;
    console.log("   ✅ Match created:", matchId);

    await query("UPDATE users SET status = 'matched' WHERE id IN ($1, $2)", [
      userId1,
      userId2
    ]);
    console.log("   ✅ User statuses updated to 'matched'");

    await query(
      "INSERT INTO chat_limits(user_id, match_id, messages_sent) VALUES ($1, $3, 0), ($2, $3, 0)",
      [userId1, userId2, matchId]
    );
    console.log("   ✅ Chat limits initialized");

    await query(
      "INSERT INTO consent(match_id, user_id, consent_chat, consent_reveal) VALUES ($1, $2, true, false), ($1, $3, true, false) ON CONFLICT (match_id, user_id) DO UPDATE SET consent_chat = true",
      [matchId, userId1, userId2]
    );
    console.log("   ✅ Chat consent set for both users");

    console.log("🔍 Verifying accounts...");
    const verify1 = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      ["testuser1@wvsu.edu.ph"]
    );
    const verify2 = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      ["testuser2@wvsu.edu.ph"]
    );

    console.log("   ✅ User 1 verified:", verify1.rows.length > 0 ? "Yes" : "No");
    console.log("   ✅ User 2 verified:", verify2.rows.length > 0 ? "Yes" : "No");

    if (verify1.rows.length === 0 || verify2.rows.length === 0) {
      console.error("❌ Verification failed! Accounts may not be accessible.");
    }

    return res.status(201).json({
      success: true,
      message: "Test accounts created and matched successfully!",
      accounts: {
        user1: {
          email: "testuser1@wvsu.edu.ph",
          userId: userId1,
          alias: "TestUser1",
          verified: verify1.rows.length > 0
        },
        user2: {
          email: "testuser2@wvsu.edu.ph",
          userId: userId2,
          alias: "TestUser2",
          verified: verify2.rows.length > 0
        }
      },
      match: {
        matchId,
        compatibilityScore: 85
      },
      instructions: {
        step1: "Sign in with testuser1@wvsu.edu.ph or testuser2@wvsu.edu.ph",
        step2: "Request OTP code (check backend logs for the code)",
        step3: "Enter the OTP code to sign in",
        step4: "You'll be redirected to the chat page automatically",
        step5: "Use POST /api/test/send-message-as-partner to send messages as the partner for debugging"
      }
    });
  } catch (error: any) {
    console.error("❌ Error creating test accounts:", error);
    return res.status(500).json({ 
      error: "Failed to create test accounts",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}

/**
 * Manually match two users by email
 * POST /api/test/match-users
 * Body: { email1: string, email2: string }
 */
export async function matchUsersByEmail(req: Request, res: Response) {
  try {
    const { email1, email2 } = req.body as { email1: string; email2: string };

    if (!email1 || !email2) {
      return res.status(400).json({ error: "email1 and email2 required." });
    }

    console.log("\n" + "=".repeat(60));
    console.log("💕 MANUAL MATCH REQUEST");
    console.log("=".repeat(60));
    console.log(`   Email 1: ${email1}`);
    console.log(`   Email 2: ${email2}`);
    console.log("=".repeat(60) + "\n");

    // Find user 1
    const user1Result = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      [email1]
    );

    if (user1Result.rows.length === 0) {
      return res.status(404).json({ error: `User not found: ${email1}. Please register first.` });
    }

    const userId1 = user1Result.rows[0].user_id;
    const profile1 = user1Result.rows[0].profile;

    // Find user 2
    const user2Result = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      [email2]
    );

    if (user2Result.rows.length === 0) {
      return res.status(404).json({ error: `User not found: ${email2}. Please register first.` });
    }

    const userId2 = user2Result.rows[0].user_id;
    const profile2 = user2Result.rows[0].profile;

    // Check if they're already matched
    const existingMatch = await query<{ id: string }>(
      "SELECT id FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) LIMIT 1",
      [userId1, userId2]
    );

    if (existingMatch.rows.length > 0) {
      return res.json({
        success: true,
        message: "Users are already matched.",
        matchId: existingMatch.rows[0].id,
        user1: { email: email1, userId: userId1, alias: profile1?.alias },
        user2: { email: email2, userId: userId2, alias: profile2?.alias }
      });
    }

    // Create match
    const matchResult = await query<{ id: string }>(
      "INSERT INTO matches(user1_id, user2_id, compatibility_score, reasons) VALUES ($1, $2, $3, $4) RETURNING id",
      [userId1, userId2, 90, ["Manual match", "Both users requested", "Compatible profiles"]]
    );
    const matchId = matchResult.rows[0]?.id;

    // Update user statuses
    await query("UPDATE users SET status = 'matched' WHERE id IN ($1, $2)", [
      userId1,
      userId2
    ]);

    // Initialize chat limits
    await query(
      "INSERT INTO chat_limits(user_id, match_id, messages_sent) VALUES ($1, $3, 0), ($2, $3, 0) ON CONFLICT DO NOTHING",
      [userId1, userId2, matchId]
    );

    // Set consent for chat (both users consent)
    await query(
      "INSERT INTO consent(match_id, user_id, consent_chat, consent_reveal) VALUES ($1, $2, true, false), ($1, $3, true, false) ON CONFLICT (match_id, user_id) DO UPDATE SET consent_chat = true",
      [matchId, userId1, userId2]
    );

    console.log("✅ Match created successfully!");
    console.log(`   Match ID: ${matchId}`);
    console.log(`   User 1: ${email1} (${userId1})`);
    console.log(`   User 2: ${email2} (${userId2})\n`);

    return res.json({
      success: true,
      message: "Users matched successfully!",
      matchId,
      user1: {
        email: email1,
        userId: userId1,
        alias: profile1?.alias || "N/A"
      },
      user2: {
        email: email2,
        userId: userId2,
        alias: profile2?.alias || "N/A"
      },
      instructions: {
        step1: "Both users can now sign in",
        step2: "They will be redirected to /chat automatically",
        step3: "They can start chatting immediately"
      }
    });
  } catch (error: any) {
    console.error("❌ Error matching users:", error);
    return res.status(500).json({
      error: "Failed to match users",
      details: error.message
    });
  }
}
