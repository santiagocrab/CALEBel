import { Request, Response } from "express";
import { query } from "../db";
import { sendEmail } from "../services/emailService";

/**
 * Get all registrants with their profile data
 * GET /api/admin/users
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const usersResult = await query<{
      id: string;
      alias: string;
      status: string;
      created_at: string;
      profile: any;
    }>(
      `SELECT 
        u.id,
        u.alias,
        u.status,
        u.created_at,
        up.profile
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY u.created_at DESC`
    );

    const users = usersResult.rows.map((row) => ({
      id: row.id,
      alias: row.alias,
      status: row.status,
      createdAt: row.created_at,
      email: row.profile?.email || "N/A",
      fullName: row.profile?.fullName
        ? `${row.profile.fullName.first} ${row.profile.fullName.middle || ""} ${row.profile.fullName.last}`.trim()
        : "N/A",
      college: row.profile?.college || "N/A",
      course: row.profile?.course || "N/A",
      yearLevel: row.profile?.yearLevel || "N/A",
      paymentStatus: row.profile?.paymentStatus || "unverified",
      verificationStatus: row.profile?.verificationStatus || "unverified",
      gcashRef: row.profile?.gcashRef || "N/A",
      gcashAccount: row.profile?.gcashAccount || row.profile?.gcashAccountNumber || row.profile?.gcashRef || "N/A",
      paymentProofUrl: row.profile?.paymentProofUrl || null,
      sogiesc: row.profile?.sogiesc || {},
      personality: row.profile?.personality || {},
      loveLanguages: {
        receive: row.profile?.loveLanguageReceive || [],
        provide: row.profile?.loveLanguageProvide || []
      },
      interests: row.profile?.interests || [],
      preferred: row.profile?.preferred || {}
    }));

    return res.json({ users, total: users.length });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      error: "Failed to fetch users",
      details: error.message
    });
  }
}

/**
 * Update payment verification status
 * POST /api/admin/verify-payment
 * Body: { userId: string, verified: boolean }
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { userId, verified } = req.body as { userId: string; verified: boolean };

    if (!userId || typeof verified !== "boolean") {
      return res.status(400).json({ error: "userId and verified (boolean) required." });
    }

    // Get user email before updating
    const userResult = await query<{ profile: any }>(
      "SELECT profile FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const userEmail = userResult.rows[0].profile?.email;

    await query(
      `UPDATE user_profiles 
       SET profile = jsonb_set(profile, '{paymentStatus}', $1, true) 
       WHERE user_id = $2`,
      [JSON.stringify(verified ? "verified" : "rejected"), userId]
    );

    console.log(`\n💰 Payment ${verified ? "VERIFIED" : "REJECTED"} for user: ${userId}\n`);

    // Send email if payment is rejected
    if (!verified && userEmail) {
      try {
        await sendEmail(
          userEmail,
          "Payment Verification - CALEBel",
          `Your payment has been unverified. Please register again.\n\nThank you,\nCALEBel Team`
        );
        console.log(`📧 Unverification email sent to: ${userEmail}`);
      } catch (emailError) {
        console.error("Failed to send unverification email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return res.json({
      success: true,
      message: `Payment ${verified ? "verified" : "rejected"} successfully.`
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      error: "Failed to verify payment",
      details: error.message
    });
  }
}

/**
 * Get all matches with compatibility scores
 * GET /api/admin/matches
 */
export async function getAllMatches(req: Request, res: Response) {
  try {
    const matchesResult = await query<{
      id: string;
      user1_id: string;
      user2_id: string;
      compatibility_score: number;
      reasons: string[];
      created_at: string;
      user1_alias: string;
      user2_alias: string;
      user1_email: string;
      user2_email: string;
    }>(
      `SELECT 
        m.id,
        m.user1_id,
        m.user2_id,
        m.compatibility_score,
        m.reasons,
        m.created_at,
        u1.alias as user1_alias,
        u2.alias as user2_alias,
        up1.profile->>'email' as user1_email,
        up2.profile->>'email' as user2_email
      FROM matches m
      JOIN users u1 ON m.user1_id = u1.id
      JOIN users u2 ON m.user2_id = u2.id
      LEFT JOIN user_profiles up1 ON m.user1_id = up1.user_id
      LEFT JOIN user_profiles up2 ON m.user2_id = up2.user_id
      ORDER BY m.created_at DESC`
    );

    const matches = matchesResult.rows.map((row) => ({
      id: row.id,
      user1: {
        id: row.user1_id,
        alias: row.user1_alias,
        email: row.user1_email || "N/A"
      },
      user2: {
        id: row.user2_id,
        alias: row.user2_alias,
        email: row.user2_email || "N/A"
      },
      compatibilityScore: row.compatibility_score,
      reasons: row.reasons || [],
      createdAt: row.created_at
    }));

    return res.json({ matches, total: matches.length });
  } catch (error: any) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({
      error: "Failed to fetch matches",
      details: error.message
    });
  }
}

/**
 * Calculate compatibility between two users
 * POST /api/admin/calculate-compatibility
 * Body: { userId1: string, userId2: string }
 */
export async function calculateCompatibility(req: Request, res: Response) {
  try {
    const { userId1, userId2 } = req.body as { userId1: string; userId2: string };

    if (!userId1 || !userId2) {
      return res.status(400).json({ error: "userId1 and userId2 required." });
    }

    // Get user profiles
    const user1Result = await query<{ profile: any }>(
      "SELECT profile FROM user_profiles WHERE user_id = $1",
      [userId1]
    );
    const user2Result = await query<{ profile: any }>(
      "SELECT profile FROM user_profiles WHERE user_id = $1",
      [userId2]
    );

    if (user1Result.rows.length === 0 || user2Result.rows.length === 0) {
      return res.status(404).json({ error: "One or both users not found." });
    }

    const profile1 = user1Result.rows[0].profile;
    const profile2 = user2Result.rows[0].profile;

    // Calculate compatibility score (simplified version)
    let score = 0;
    const reasons: string[] = [];

    // MBTI compatibility (simple check)
    if (profile1.personality?.mbti && profile2.personality?.mbti) {
      if (profile1.personality.mbti === profile2.personality.mbti) {
        score += 15;
        reasons.push("Same MBTI type");
      } else {
        score += 5;
      }
    }

    // Zodiac compatibility
    if (profile1.personality?.sunSign && profile2.personality?.sunSign) {
      score += 10;
      reasons.push("Zodiac compatibility");
    }

    // Social battery compatibility
    if (profile1.personality?.socialBattery && profile2.personality?.socialBattery) {
      if (profile1.personality.socialBattery === profile2.personality.socialBattery) {
        score += 15;
        reasons.push("Matching social battery");
      } else {
        score += 10;
        reasons.push("Complementary social battery");
      }
    }

    // Love languages overlap
    const loveLang1Receive = profile1.loveLanguageReceive || [];
    const loveLang2Provide = profile2.loveLanguageProvide || [];
    const loveLang1Provide = profile1.loveLanguageProvide || [];
    const loveLang2Receive = profile2.loveLanguageReceive || [];

    const receiveMatch = loveLang1Receive.filter((lang: string) =>
      loveLang2Provide.includes(lang)
    ).length;
    const provideMatch = loveLang1Provide.filter((lang: string) =>
      loveLang2Receive.includes(lang)
    ).length;

    if (receiveMatch > 0 || provideMatch > 0) {
      score += (receiveMatch + provideMatch) * 10;
      reasons.push(`${receiveMatch + provideMatch} love language matches`);
    }

    // Interests overlap
    const interests1 = profile1.interests || [];
    const interests2 = profile2.interests || [];
    const commonInterests = interests1.filter((interest: string) =>
      interests2.includes(interest)
    );

    if (commonInterests.length > 0) {
      score += commonInterests.length * 5;
      reasons.push(`${commonInterests.length} shared interests`);
    }

    // Preferred compatibility
    const pref1 = profile1.preferred || {};
    const pref2 = profile2.preferred || {};

    if (
      (pref1.college === "Any" || pref1.college === profile2.college) &&
      (pref2.college === "Any" || pref2.college === profile1.college)
    ) {
      score += 5;
    }

    // Cap at 100
    score = Math.min(score, 100);

    return res.json({
      userId1,
      userId2,
      compatibilityScore: score,
      reasons: reasons.length > 0 ? reasons : ["Basic compatibility"],
      commonInterests: commonInterests,
      loveLanguageMatches: {
        user1Receives: receiveMatch,
        user2Receives: provideMatch
      }
    });
  } catch (error: any) {
    console.error("Error calculating compatibility:", error);
    return res.status(500).json({
      error: "Failed to calculate compatibility",
      details: error.message
    });
  }
}

/**
 * Manually create a match between two users
 * POST /api/admin/create-match
 * Body: { userId1: string, userId2: string, compatibilityScore?: number, reasons?: string[] }
 */
export async function createMatch(req: Request, res: Response) {
  try {
    const { userId1, userId2, compatibilityScore, reasons } = req.body as {
      userId1: string;
      userId2: string;
      compatibilityScore?: number;
      reasons?: string[];
    };

    if (!userId1 || !userId2) {
      return res.status(400).json({ error: "userId1 and userId2 required." });
    }

    // Check if users exist
    const user1Result = await query<{ id: string }>("SELECT id FROM users WHERE id = $1", [userId1]);
    const user2Result = await query<{ id: string }>("SELECT id FROM users WHERE id = $1", [userId2]);

    if (user1Result.rows.length === 0 || user2Result.rows.length === 0) {
      return res.status(404).json({ error: "One or both users not found." });
    }

    // Check if already matched
    const existingMatch = await query<{ id: string }>(
      "SELECT id FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) LIMIT 1",
      [userId1, userId2]
    );

    if (existingMatch.rows.length > 0) {
      return res.status(400).json({
        error: "Users are already matched.",
        matchId: existingMatch.rows[0].id
      });
    }

    // Calculate compatibility if not provided
    let finalScore = compatibilityScore || 85;
    let finalReasons = reasons || ["Admin-approved match"];

    if (!compatibilityScore || !reasons) {
      // Get user profiles to calculate compatibility
      const user1Result = await query<{ profile: any }>(
        "SELECT profile FROM user_profiles WHERE user_id = $1",
        [userId1]
      );
      const user2Result = await query<{ profile: any }>(
        "SELECT profile FROM user_profiles WHERE user_id = $1",
        [userId2]
      );

      if (user1Result.rows.length > 0 && user2Result.rows.length > 0) {
        const profile1 = user1Result.rows[0].profile;
        const profile2 = user2Result.rows[0].profile;

        // Calculate compatibility score
        let score = 0;
        const scoreReasons: string[] = [];

        // MBTI compatibility
        if (profile1.personality?.mbti && profile2.personality?.mbti) {
          if (profile1.personality.mbti === profile2.personality.mbti) {
            score += 15;
            scoreReasons.push("Same MBTI type");
          } else {
            score += 5;
          }
        }

        // Zodiac compatibility
        if (profile1.personality?.sunSign && profile2.personality?.sunSign) {
          score += 10;
          scoreReasons.push("Zodiac compatibility");
        }

        // Social battery compatibility
        if (profile1.personality?.socialBattery && profile2.personality?.socialBattery) {
          if (profile1.personality.socialBattery === profile2.personality.socialBattery) {
            score += 15;
            scoreReasons.push("Matching social battery");
          } else {
            score += 10;
            scoreReasons.push("Complementary social battery");
          }
        }

        // Love languages overlap
        const loveLang1Receive = profile1.loveLanguageReceive || [];
        const loveLang2Provide = profile2.loveLanguageProvide || [];
        const loveLang1Provide = profile1.loveLanguageProvide || [];
        const loveLang2Receive = profile2.loveLanguageReceive || [];

        const receiveMatch = loveLang1Receive.filter((lang: string) =>
          loveLang2Provide.includes(lang)
        ).length;
        const provideMatch = loveLang1Provide.filter((lang: string) =>
          loveLang2Receive.includes(lang)
        ).length;

        if (receiveMatch > 0 || provideMatch > 0) {
          score += (receiveMatch + provideMatch) * 10;
          scoreReasons.push(`${receiveMatch + provideMatch} love language matches`);
        }

        // Interests overlap
        const interests1 = profile1.interests || [];
        const interests2 = profile2.interests || [];
        const commonInterests = interests1.filter((interest: string) =>
          interests2.includes(interest)
        );

        if (commonInterests.length > 0) {
          score += commonInterests.length * 5;
          scoreReasons.push(`${commonInterests.length} shared interests`);
        }

        // Cap at 100
        finalScore = Math.min(score, 100);
        finalReasons = scoreReasons.length > 0 ? scoreReasons : ["Admin-approved match"];
      }
    }

    // Create match
    const matchResult = await query<{ id: string }>(
      "INSERT INTO matches(user1_id, user2_id, compatibility_score, reasons) VALUES ($1, $2, $3, $4) RETURNING id",
      [userId1, userId2, finalScore, finalReasons]
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

    // Send match found emails to both users
    const userProfiles = await query<{ profile: Record<string, any> }>(
      "SELECT profile FROM user_profiles WHERE user_id IN ($1, $2)",
      [userId1, userId2]
    );

    const websiteUrl = process.env.FRONTEND_URL || "http://localhost:3005";
    const { generateMatchFoundEmail } = await import("../templates/emailTemplates");
    const { sendEmail } = await import("../services/emailService");

    for (const row of userProfiles.rows) {
      const email = row.profile?.email;
      if (email) {
        try {
          const emailHtml = generateMatchFoundEmail(finalScore, finalReasons, websiteUrl);
          await sendEmail(
            email,
            "🎉 Congratulations! We Found Your Ka-Label! 💕",
            emailHtml
          );
          console.log(`✅ Match notification email sent to: ${email}`);
        } catch (err) {
          console.error(`❌ Failed to send match email to ${email}:`, err);
          // Don't fail the match creation if email fails
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("💕 ADMIN MATCH CREATED");
    console.log("=".repeat(60));
    console.log(`   Match ID: ${matchId}`);
    console.log(`   User 1: ${userId1}`);
    console.log(`   User 2: ${userId2}`);
    console.log(`   Compatibility: ${finalScore}%`);
    console.log("=".repeat(60) + "\n");

    return res.json({
      success: true,
      message: "Match created successfully!",
      matchId,
      compatibilityScore: finalScore,
      reasons: finalReasons
    });
  } catch (error: any) {
    console.error("Error creating match:", error);
    return res.status(500).json({
      error: "Failed to create match",
      details: error.message
    });
  }
}

/**
 * Get compatibility suggestions for a user
 * GET /api/admin/compatibility-suggestions/:userId
 */
export async function getCompatibilitySuggestions(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId required." });
    }

    // Get current user profile
    const currentUserResult = await query<{ profile: any }>(
      "SELECT profile FROM user_profiles WHERE user_id = $1",
      [userId]
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const currentProfile = currentUserResult.rows[0].profile;

    // Get all other users who are waiting and not already matched
    const otherUsersResult = await query<{
      user_id: string;
      alias: string;
      profile: any;
    }>(
      `SELECT 
        u.id as user_id,
        u.alias,
        up.profile
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != $1 
        AND u.status = 'waiting'
        AND (up.profile->>'paymentStatus' = 'verified' OR up.profile->>'paymentStatus' IS NULL)
        AND NOT EXISTS (
          SELECT 1 FROM matches m 
          WHERE (m.user1_id = u.id OR m.user2_id = u.id)
        )
      ORDER BY u.created_at DESC`,
      [userId]
    );

    const suggestions = await Promise.all(
      otherUsersResult.rows.map(async (row) => {
        const otherProfile = row.profile;
        let score = 0;
        const reasons: string[] = [];

        // MBTI compatibility
        if (currentProfile.personality?.mbti && otherProfile.personality?.mbti) {
          if (currentProfile.personality.mbti === otherProfile.personality.mbti) {
            score += 15;
            reasons.push("Same MBTI type");
          } else {
            score += 5;
          }
        }

        // Zodiac compatibility
        if (currentProfile.personality?.sunSign && otherProfile.personality?.sunSign) {
          score += 10;
          reasons.push("Zodiac compatibility");
        }

        // Social battery compatibility
        if (currentProfile.personality?.socialBattery && otherProfile.personality?.socialBattery) {
          if (currentProfile.personality.socialBattery === otherProfile.personality.socialBattery) {
            score += 15;
            reasons.push("Matching social battery");
          } else {
            score += 10;
            reasons.push("Complementary social battery");
          }
        }

        // Love languages overlap
        const loveLang1Receive = currentProfile.loveLanguageReceive || [];
        const loveLang2Provide = otherProfile.loveLanguageProvide || [];
        const loveLang1Provide = currentProfile.loveLanguageProvide || [];
        const loveLang2Receive = otherProfile.loveLanguageReceive || [];

        const receiveMatch = loveLang1Receive.filter((lang: string) =>
          loveLang2Provide.includes(lang)
        ).length;
        const provideMatch = loveLang1Provide.filter((lang: string) =>
          loveLang2Receive.includes(lang)
        ).length;

        if (receiveMatch > 0 || provideMatch > 0) {
          score += (receiveMatch + provideMatch) * 10;
          reasons.push(`${receiveMatch + provideMatch} love language matches`);
        }

        // Interests overlap
        const interests1 = currentProfile.interests || [];
        const interests2 = otherProfile.interests || [];
        const commonInterests = interests1.filter((interest: string) =>
          interests2.includes(interest)
        );

        if (commonInterests.length > 0) {
          score += commonInterests.length * 5;
          reasons.push(`${commonInterests.length} shared interests`);
        }

        // Preferred compatibility
        const pref1 = currentProfile.preferred || {};
        const pref2 = otherProfile.preferred || {};

        if (
          (pref1.college === "Any" || pref1.college === otherProfile.college) &&
          (pref2.college === "Any" || pref2.college === currentProfile.college)
        ) {
          score += 5;
        }

        score = Math.min(score, 100);

        return {
          userId: row.user_id,
          alias: row.alias,
          email: otherProfile.email || "N/A",
          compatibilityScore: score,
          reasons: reasons.length > 0 ? reasons : ["Basic compatibility"],
          commonInterests: commonInterests
        };
      })
    );

    // Sort by compatibility score (highest first)
    suggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.json({ suggestions });
  } catch (error: any) {
    console.error("Error getting compatibility suggestions:", error);
    return res.status(500).json({
      error: "Failed to get compatibility suggestions",
      details: error.message
    });
  }
}

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
export async function getStats(req: Request, res: Response) {
  try {
    const totalUsers = await query<{ count: string }>("SELECT COUNT(*) as count FROM users");
    const waitingUsers = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM users WHERE status = 'waiting'"
    );
    const matchedUsers = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM users WHERE status = 'matched'"
    );
    const totalMatches = await query<{ count: string }>("SELECT COUNT(*) as count FROM matches");
    const verifiedPayments = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_profiles WHERE profile->>'paymentStatus' = 'verified'`
    );
    const unverifiedPayments = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_profiles WHERE profile->>'paymentStatus' != 'verified' OR profile->>'paymentStatus' IS NULL`
    );

    return res.json({
      totalUsers: parseInt(totalUsers.rows[0]?.count || "0"),
      waitingUsers: parseInt(waitingUsers.rows[0]?.count || "0"),
      matchedUsers: parseInt(matchedUsers.rows[0]?.count || "0"),
      totalMatches: parseInt(totalMatches.rows[0]?.count || "0"),
      verifiedPayments: parseInt(verifiedPayments.rows[0]?.count || "0"),
      unverifiedPayments: parseInt(unverifiedPayments.rows[0]?.count || "0")
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      error: "Failed to fetch statistics",
      details: error.message
    });
  }
}
