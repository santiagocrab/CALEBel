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

    const users = usersResult.rows.map((row) => {
      const profile = row.profile || {};
      const paymentProofUrl = profile.paymentProofUrl || profile.proofUrl || null;
      
      // Log if payment proof URL exists
      if (paymentProofUrl) {
        console.log(`📸 Payment proof found for user ${row.id}: ${paymentProofUrl.substring(0, 50)}...`);
      } else {
        console.log(`⚠️  No payment proof URL for user ${row.id} (alias: ${row.alias})`);
      }
      
      return {
        id: row.id,
        alias: row.alias,
        status: row.status,
        createdAt: row.created_at,
        email: profile.email || "N/A",
        fullName: profile.fullName
          ? `${profile.fullName.first} ${profile.fullName.middle || ""} ${profile.fullName.last}`.trim()
          : "N/A",
        college: profile.college || "N/A",
        course: profile.course || "N/A",
        yearLevel: profile.yearLevel || "N/A",
        paymentStatus: profile.paymentStatus || "unverified",
        verificationStatus: profile.verificationStatus || "unverified",
        gcashRef: profile.gcashRef || "N/A",
        gcashAccount: profile.gcashAccount || profile.gcashAccountNumber || profile.gcashRef || "N/A",
        paymentProofUrl: paymentProofUrl,
        sogiesc: profile.sogiesc || {},
        personality: profile.personality || {},
        loveLanguages: {
          receive: profile.loveLanguageReceive || [],
          provide: profile.loveLanguageProvide || []
        },
        interests: profile.interests || [],
        preferred: profile.preferred || {}
      };
    });

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

    // Use the same enhanced algorithm as matchService
    let totalScore = 0;
    const reasons: string[] = [];
    const sogiesc1 = profile1.sogiesc || {};
    const sogiesc2 = profile2.sogiesc || {};

    // ===== SECTION 3: SOGIE-SC COMPATIBILITY (PRIMARY - 40 points max) =====
    
    // 1. Sexual Orientation (15 points - CRITICAL)
    const orientation1 = sogiesc1.orientation || sogiesc1.sexualOrientation || "";
    const orientation2 = sogiesc2.orientation || sogiesc2.sexualOrientation || "";
    
    if (orientation1 && orientation2) {
      const compatibleOrientations: Record<string, string[]> = {
        "Heterosexual": ["Heterosexual", "Bisexual", "Pansexual"],
        "Homosexual": ["Homosexual", "Bisexual", "Pansexual"],
        "Bisexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
        "Pansexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
        "Asexual": ["Asexual", "Demisexual", "Gray-Asexual"],
        "Queer": ["Queer", "Bisexual", "Pansexual", "Heterosexual", "Homosexual"]
      };
      
      const compatible = compatibleOrientations[orientation1] || [];
      if (!compatible.includes(orientation2)) {
        return res.json({
          userId1,
          userId2,
          compatibilityScore: 0,
          reasons: ["❌ Incompatible orientations"],
          commonInterests: [],
          loveLanguageMatches: { user1Receives: 0, user2Receives: 0 }
        });
      }
      
      if (orientation1 === orientation2) {
        totalScore += 25; // Perfect orientation match
        reasons.push(`💜 Perfect orientation match (${orientation1})`);
      } else {
        totalScore += 18; // Compatible orientations
        reasons.push(`💜 Compatible orientations`);
      }
    } else {
      totalScore += 10;
    }

    // Note: Gender identity, gender expression, pronouns, and sex characteristics
    // are NOT used for matching - only sexual orientation compatibility matters

    // ===== PREFERRED PERSON MATCHING (25 points max) =====
    const pref1 = profile1.preferred || {};
    const pref2 = profile2.preferred || {};
    
    let preferenceScore = 10; // Base score
    
    // College preference matching (both directions)
    if (pref1.college && pref1.college !== "Any" && pref1.college === profile2.college) {
      preferenceScore += 5;
    }
    if (pref2.college && pref2.college !== "Any" && pref2.college === profile1.college) {
      preferenceScore += 5;
    }
    
    // Year level preference matching
    if (pref1.yearLevel && pref1.yearLevel !== "Any" && pref1.yearLevel === profile2.yearLevel) {
      preferenceScore += 3;
    }
    if (pref2.yearLevel && pref2.yearLevel !== "Any" && pref2.yearLevel === profile1.yearLevel) {
      preferenceScore += 3;
    }
    
    // Course preference matching
    if (pref1.course && pref1.course !== "Any" && pref1.course === profile2.course) {
      preferenceScore += 2;
    }
    if (pref2.course && pref2.course !== "Any" && pref2.course === profile1.course) {
      preferenceScore += 2;
    }
    
    totalScore += Math.min(preferenceScore, 30);
    
    if (preferenceScore >= 20) {
      reasons.push(`🎯 Perfect preference alignment`);
    } else if (preferenceScore >= 15) {
      reasons.push(`🎯 Strong preference match`);
    }

    // ===== INTERESTS MATCHING (25 points max) =====
    const interests1 = new Set(profile1.interests || []);
    const interests2 = new Set(profile2.interests || []);
    const sharedInterests = [...interests2].filter((i) => interests1.has(i));
    const totalUniqueInterests = new Set([...interests1, ...interests2]).size;
    
    const interestRatio = sharedInterests.length / Math.max(totalUniqueInterests, 1);
    let interestScore = 0;
    if (sharedInterests.length >= 3) {
      interestScore = Math.min(25 * (interestRatio * 1.2), 25);
    } else if (sharedInterests.length > 0) {
      interestScore = sharedInterests.length * 3;
    } else {
      interestScore = 2;
    }
    totalScore += interestScore;
    
    if (sharedInterests.length >= 5) {
      reasons.push(`🌟 ${sharedInterests.length} shared interests`);
    } else if (sharedInterests.length >= 3) {
      reasons.push(`✨ ${sharedInterests.length} shared interests`);
    } else if (sharedInterests.length > 0) {
      reasons.push(`💫 ${sharedInterests.length} shared interest${sharedInterests.length > 1 ? 's' : ''}`);
    }

    // ===== LOVE LANGUAGES (10 points max) =====
    const loveLang1Receive = profile1.loveLanguageReceive || [];
    const loveLang2Provide = profile2.loveLanguageProvide || [];
    const loveLang1Provide = profile1.loveLanguageProvide || [];
    const loveLang2Receive = profile2.loveLanguageReceive || [];
    
    const receiveMatch = loveLang1Receive.filter((lang: string) => loveLang2Provide.includes(lang)).length;
    const provideMatch = loveLang1Provide.filter((lang: string) => loveLang2Receive.includes(lang)).length;
    const totalLoveLangMatches = receiveMatch + provideMatch;
    
    if (totalLoveLangMatches > 0) {
      const perfectReciprocal = receiveMatch > 0 && provideMatch > 0;
      totalScore += Math.min(totalLoveLangMatches * 4 + (perfectReciprocal ? 3 : 0), 15);
      if (perfectReciprocal) {
        reasons.push(`💕 Perfect love language match (${totalLoveLangMatches} languages)`);
      } else {
        reasons.push(`💖 Love language compatibility`);
      }
    }

    // ===== PERSONALITY ALIGNMENT (5 points max) =====
    const personality1 = profile1.personality ?? {};
    const personality2 = profile2.personality ?? {};
    
    // MBTI (3 points)
    if (personality1.mbti && personality2.mbti) {
      if (personality1.mbti === personality2.mbti) {
        totalScore += 3;
        reasons.push(`🧠 Same MBTI type (${personality1.mbti})`);
      } else {
        const mbtiCompatible = [
          ["INTJ", "ENFP"], ["INTP", "ENTJ"], ["ENTJ", "INTP"], ["ENTP", "INFJ"],
          ["INFJ", "ENTP"], ["INFP", "ESTJ"], ["ENFJ", "ISFP"], ["ENFP", "INTJ"],
          ["ISTJ", "ESFP"], ["ISFJ", "ESTP"], ["ESTJ", "INFP"], ["ESFJ", "ISTP"],
          ["ISTP", "ESFJ"], ["ISFP", "ENFJ"], ["ESTP", "ISFJ"], ["ESFP", "ISTJ"]
        ];
        const isCompatible = mbtiCompatible.some(
          ([a, b]) => 
            (a === personality1.mbti && b === personality2.mbti) ||
            (b === personality1.mbti && a === personality2.mbti)
        );
        totalScore += isCompatible ? 2 : 1;
        reasons.push("🧠 Compatible MBTI types");
      }
    }

    // Social Battery (2 points)
    if (personality1.socialBattery && personality2.socialBattery) {
      if (personality1.socialBattery === personality2.socialBattery) {
        totalScore += 2;
        reasons.push("⚡ Matching social energy");
      } else {
        totalScore += 1;
      }
    }

    totalScore = Math.min(Math.floor(totalScore), 100);

    return res.json({
      userId1,
      userId2,
      compatibilityScore: totalScore,
      reasons: reasons.length > 0 ? reasons : ["✨ Great compatibility potential"],
      commonInterests: sharedInterests,
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
      // Get user profiles to calculate compatibility using enhanced algorithm
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

        // Use the same enhanced algorithm prioritizing SOGIE-SC
        let score = 0;
        const scoreReasons: string[] = [];
        const sogiesc1 = profile1.sogiesc || {};
        const sogiesc2 = profile2.sogiesc || {};

        // ===== SECTION 3: SOGIE-SC COMPATIBILITY (PRIMARY - 40 points max) =====
        
        // Sexual Orientation (15 points)
        const orientation1 = sogiesc1.orientation || sogiesc1.sexualOrientation || "";
        const orientation2 = sogiesc2.orientation || sogiesc2.sexualOrientation || "";
        
        if (orientation1 && orientation2) {
          const compatibleOrientations: Record<string, string[]> = {
            "Heterosexual": ["Heterosexual", "Bisexual", "Pansexual"],
            "Homosexual": ["Homosexual", "Bisexual", "Pansexual"],
            "Bisexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
            "Pansexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
            "Asexual": ["Asexual", "Demisexual", "Gray-Asexual"],
            "Queer": ["Queer", "Bisexual", "Pansexual", "Heterosexual", "Homosexual"]
          };
          
          const compatible = compatibleOrientations[orientation1] || [];
          if (compatible.includes(orientation2)) {
            if (orientation1 === orientation2) {
              score += 25; // Perfect orientation match
              scoreReasons.push(`💜 Perfect orientation match (${orientation1})`);
            } else {
              score += 18; // Compatible orientations
              scoreReasons.push(`💜 Compatible orientations`);
            }
          } else {
            score += 0; // Incompatible
          }
        } else {
          score += 10;
        }

        // Note: Gender identity, gender expression, pronouns, and sex characteristics
        // are NOT used for matching - only sexual orientation compatibility matters

        // ===== PREFERRED PERSON MATCHING (25 points max) =====
        const pref1 = profile1.preferred || {};
        const pref2 = profile2.preferred || {};
        
        let preferenceScore = 10;
        if (pref1.college && pref1.college !== "Any" && pref1.college === profile2.college) {
          preferenceScore += 5;
        }
        if (pref2.college && pref2.college !== "Any" && pref2.college === profile1.college) {
          preferenceScore += 5;
        }
        if (pref1.yearLevel && pref1.yearLevel !== "Any" && pref1.yearLevel === profile2.yearLevel) {
          preferenceScore += 3;
        }
        if (pref2.yearLevel && pref2.yearLevel !== "Any" && pref2.yearLevel === profile1.yearLevel) {
          preferenceScore += 3;
        }
        if (pref1.course && pref1.course !== "Any" && pref1.course === profile2.course) {
          preferenceScore += 2;
        }
        if (pref2.course && pref2.course !== "Any" && pref2.course === profile1.course) {
          preferenceScore += 2;
        }
        score += Math.min(preferenceScore, 30);
        if (preferenceScore >= 20) {
          scoreReasons.push(`🎯 Perfect preference alignment`);
        }

        // ===== INTERESTS (25 points max) =====
        const interests1 = new Set(profile1.interests || []);
        const interests2 = new Set(profile2.interests || []);
        const sharedInterests = [...interests2].filter((i) => interests1.has(i));
        const totalUniqueInterests = new Set([...interests1, ...interests2]).size;
        const interestRatio = sharedInterests.length / Math.max(totalUniqueInterests, 1);
        if (sharedInterests.length >= 3) {
          score += Math.min(25 * (interestRatio * 1.2), 25);
          scoreReasons.push(`🌟 ${sharedInterests.length} shared interests`);
        } else if (sharedInterests.length > 0) {
          score += sharedInterests.length * 3;
          scoreReasons.push(`✨ ${sharedInterests.length} shared interests`);
        } else {
          score += 2;
        }

        // ===== LOVE LANGUAGES (10 points max) =====
        const loveLang1Receive = profile1.loveLanguageReceive || [];
        const loveLang2Provide = profile2.loveLanguageProvide || [];
        const loveLang1Provide = profile1.loveLanguageProvide || [];
        const loveLang2Receive = profile2.loveLanguageReceive || [];
        
        const receiveMatch = loveLang1Receive.filter((lang: string) => loveLang2Provide.includes(lang)).length;
        const provideMatch = loveLang1Provide.filter((lang: string) => loveLang2Receive.includes(lang)).length;
        const totalLoveLangMatches = receiveMatch + provideMatch;
        
        if (totalLoveLangMatches > 0) {
          const perfectReciprocal = receiveMatch > 0 && provideMatch > 0;
          score += Math.min(totalLoveLangMatches * 4 + (perfectReciprocal ? 3 : 0), 15);
          if (perfectReciprocal) {
            scoreReasons.push(`💕 Perfect love language match`);
          } else {
            scoreReasons.push(`💖 Love language compatibility`);
          }
        }

        // ===== PERSONALITY (5 points max) =====
        if (profile1.personality?.mbti && profile2.personality?.mbti) {
          if (profile1.personality.mbti === profile2.personality.mbti) {
            score += 3;
            scoreReasons.push(`🧠 Same MBTI type (${profile1.personality.mbti})`);
          } else {
            score += 1;
          }
        }
        if (profile1.personality?.socialBattery && profile2.personality?.socialBattery) {
          if (profile1.personality.socialBattery === profile2.personality.socialBattery) {
            score += 2;
            scoreReasons.push(`⚡ Matching social energy`);
          } else {
            score += 1;
          }
        }

        finalScore = Math.min(Math.floor(score), 100);
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

    // Get user emails - try from profile first, then from users table
    const userEmails = await query<{ id: string; email: string }>(
      "SELECT u.id, COALESCE(up.profile->>'email', u.email) as email FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id IN ($1, $2)",
      [userId1, userId2]
    );

    const websiteUrl = process.env.FRONTEND_URL || "https://calebel.vercel.app";
    const { generateMatchFoundEmail } = await import("../templates/emailTemplates");
    const { sendEmail } = await import("../services/emailService");

    // Track email sending results
    const emailResults: Array<{ userId: string; email: string; success: boolean; error?: string }> = [];

    console.log("\n📧 Sending match notification emails to both users...");
    console.log("=".repeat(60));

    for (const row of userEmails.rows) {
      const email = row.email;
      if (email) {
        try {
          const emailHtml = generateMatchFoundEmail(finalScore, finalReasons, websiteUrl, true);
          await sendEmail(
            email,
            "🎉 Congratulations! You've Been Matched by Admin! 💕",
            emailHtml
          );
          console.log(`✅ Email sent successfully to: ${email} (User: ${row.id})`);
          emailResults.push({ userId: row.id, email, success: true });
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          console.error(`❌ Failed to send email to ${email} (User: ${row.id}):`, errorMsg);
          emailResults.push({ userId: row.id, email, success: false, error: errorMsg });
          // Continue to try sending to the other user even if one fails
        }
      } else {
        console.warn(`⚠️  No email found for user ${row.id}, cannot send notification`);
        emailResults.push({ userId: row.id, email: "N/A", success: false, error: "No email address found" });
      }
    }

    // Summary of email sending
    console.log("=".repeat(60));
    const successCount = emailResults.filter(r => r.success).length;
    const failCount = emailResults.filter(r => !r.success).length;
    console.log(`📊 Email Summary: ${successCount} sent successfully, ${failCount} failed`);
    
    if (failCount > 0) {
      console.log("\n⚠️  WARNING: Some users did not receive match notification emails!");
      emailResults.forEach(result => {
        if (!result.success) {
          console.log(`   - User ${result.userId} (${result.email}): ${result.error}`);
        }
      });
    }
    console.log("=".repeat(60) + "\n");

    console.log("\n" + "=".repeat(60));
    console.log("💕 ADMIN MATCH CREATED");
    console.log("=".repeat(60));
    console.log(`   Match ID: ${matchId}`);
    console.log(`   User 1: ${userId1}`);
    console.log(`   User 2: ${userId2}`);
    console.log(`   Compatibility: ${finalScore}%`);
    console.log(`   Emails Sent: ${emailResults.filter(r => r.success).length}/2`);
    console.log("=".repeat(60) + "\n");

    const emailsSent = emailResults.filter(r => r.success).length;
    const allEmailsSent = emailsSent === 2;

    return res.json({
      success: true,
      message: allEmailsSent 
        ? "Match created successfully! Both users have been notified via email." 
        : `Match created successfully! ${emailsSent} of 2 users were notified via email.`,
      matchId,
      compatibilityScore: finalScore,
      reasons: finalReasons,
      emailNotifications: {
        sent: emailsSent,
        total: 2,
        results: emailResults.map(r => ({
          userId: r.userId,
          email: r.email,
          success: r.success,
          ...(r.error && { error: r.error })
        }))
      }
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

    // First, let's check how many total users exist
    const totalUsersCheck = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM users WHERE id != $1",
      [userId]
    );
    console.log(`📊 Total users in system (excluding current): ${totalUsersCheck.rows[0]?.count || 0}`);

    // Get all other users who are not already in active matches
    // Be very permissive - include all users except the current one and those in active matches
    const otherUsersResult = await query<{
      user_id: string;
      alias: string;
      profile: any;
      status: string;
    }>(
      `SELECT 
        u.id as user_id,
        u.alias,
        up.profile,
        u.status
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != $1 
        AND up.profile IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM matches m 
          WHERE (m.user1_id = u.id OR m.user2_id = u.id) AND m.active = true
        )
      ORDER BY u.created_at DESC`,
      [userId]
    );

    console.log(`📊 Found ${otherUsersResult.rows.length} users after filtering (excluding current user and active matches)`);
    
    // Log status breakdown
    const statusBreakdown: Record<string, number> = {};
    otherUsersResult.rows.forEach(row => {
      statusBreakdown[row.status] = (statusBreakdown[row.status] || 0) + 1;
    });
    console.log(`📊 Status breakdown:`, statusBreakdown);

    const suggestions = await Promise.all(
      otherUsersResult.rows.map(async (row) => {
        const otherProfile = row.profile;
        let totalScore = 0;
        const reasons: string[] = [];

        // ===== SECTION 3: SOGIE-SC COMPATIBILITY (PRIMARY - 25 points max) =====
        // We only match based on compatible orientations, not gender identity
        const sogiesc1 = currentProfile.sogiesc || {};
        const sogiesc2 = otherProfile.sogiesc || {};
        
        // 1. Sexual Orientation (25 points - CRITICAL - ONLY FACTOR)
        const orientation1 = sogiesc1.orientation || sogiesc1.sexualOrientation || "";
        const orientation2 = sogiesc2.orientation || sogiesc2.sexualOrientation || "";
        
        if (orientation1 && orientation2) {
          const compatibleOrientations: Record<string, string[]> = {
            "Heterosexual": ["Heterosexual", "Bisexual", "Pansexual"],
            "Homosexual": ["Homosexual", "Bisexual", "Pansexual"],
            "Bisexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
            "Pansexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
            "Asexual": ["Asexual", "Demisexual", "Gray-Asexual"],
            "Queer": ["Queer", "Bisexual", "Pansexual", "Heterosexual", "Homosexual"]
          };
          
          const compatible = compatibleOrientations[orientation1] || [];
          if (!compatible.includes(orientation2)) {
            return null; // Incompatible - skip this user
          }
          
          if (orientation1 === orientation2) {
            totalScore += 25; // Perfect orientation match
            reasons.push(`💜 Perfect orientation match (${orientation1})`);
          } else {
            totalScore += 18; // Compatible orientations
            reasons.push(`💜 Compatible orientations`);
          }
        } else {
          totalScore += 10; // Base score if not specified
        }

        // Note: Gender identity, gender expression, pronouns, and sex characteristics
        // are NOT used for matching - only sexual orientation compatibility matters

        // ===== PREFERRED PERSON MATCHING (25 points max) =====
        const pref1 = currentProfile.preferred || {};
        const pref2 = otherProfile.preferred || {};
        
        let preferenceScore = 10; // Base score for passing preferences
        
        // College preference matching (both directions)
        if (pref1.college && pref1.college !== "Any" && pref1.college === otherProfile.college) {
          preferenceScore += 5;
        }
        if (pref2.college && pref2.college !== "Any" && pref2.college === currentProfile.college) {
          preferenceScore += 5;
        }
        
        // Year level preference matching
        if (pref1.yearLevel && pref1.yearLevel !== "Any" && pref1.yearLevel === otherProfile.yearLevel) {
          preferenceScore += 3;
        }
        if (pref2.yearLevel && pref2.yearLevel !== "Any" && pref2.yearLevel === currentProfile.yearLevel) {
          preferenceScore += 3;
        }
        
        // Course preference matching
        if (pref1.course && pref1.course !== "Any" && pref1.course === otherProfile.course) {
          preferenceScore += 2;
        }
        if (pref2.course && pref2.course !== "Any" && pref2.course === currentProfile.course) {
          preferenceScore += 2;
        }
        
        totalScore += Math.min(preferenceScore, 30);
        
        if (preferenceScore >= 20) {
          reasons.push(`🎯 Perfect preference alignment`);
        } else if (preferenceScore >= 15) {
          reasons.push(`🎯 Strong preference match`);
        }

        // ===== INTERESTS MATCHING (25 points max) =====
        const interests1 = new Set(currentProfile.interests || []);
        const interests2 = new Set(otherProfile.interests || []);
        const sharedInterests = [...interests2].filter((i) => interests1.has(i));
        const totalUniqueInterests = new Set([...interests1, ...interests2]).size;
        
        const interestRatio = sharedInterests.length / Math.max(totalUniqueInterests, 1);
        let interestScore = 0;
        if (sharedInterests.length >= 3) {
          interestScore = Math.min(25 * (interestRatio * 1.2), 25);
        } else if (sharedInterests.length > 0) {
          interestScore = sharedInterests.length * 3;
        } else {
          interestScore = 2;
        }
        totalScore += interestScore;
        
        if (sharedInterests.length >= 5) {
          reasons.push(`🌟 ${sharedInterests.length} shared interests`);
        } else if (sharedInterests.length >= 3) {
          reasons.push(`✨ ${sharedInterests.length} shared interests`);
        } else if (sharedInterests.length > 0) {
          reasons.push(`💫 ${sharedInterests.length} shared interest${sharedInterests.length > 1 ? 's' : ''}`);
        }

        // ===== LOVE LANGUAGES (10 points max) =====
        const loveLang1Receive = currentProfile.loveLanguageReceive || [];
        const loveLang2Provide = otherProfile.loveLanguageProvide || [];
        const loveLang1Provide = currentProfile.loveLanguageProvide || [];
        const loveLang2Receive = otherProfile.loveLanguageReceive || [];
        
        const receiveMatch = loveLang1Receive.filter((lang: string) => loveLang2Provide.includes(lang)).length;
        const provideMatch = loveLang1Provide.filter((lang: string) => loveLang2Receive.includes(lang)).length;
        const totalLoveLangMatches = receiveMatch + provideMatch;
        
        if (totalLoveLangMatches > 0) {
          const perfectReciprocal = receiveMatch > 0 && provideMatch > 0;
          totalScore += Math.min(totalLoveLangMatches * 4 + (perfectReciprocal ? 3 : 0), 15);
          if (perfectReciprocal) {
            reasons.push(`💕 Perfect love language match (${totalLoveLangMatches} languages)`);
          } else {
            reasons.push(`💖 Love language compatibility`);
          }
        }

        // ===== PERSONALITY ALIGNMENT (5 points max - reduced weight) =====
        const personality1 = currentProfile.personality ?? {};
        const personality2 = otherProfile.personality ?? {};
        
        // MBTI (3 points)
        if (personality1.mbti && personality2.mbti) {
          if (personality1.mbti === personality2.mbti) {
            totalScore += 3;
            reasons.push(`🧠 Same MBTI type (${personality1.mbti})`);
          } else {
            const mbtiCompatible = [
              ["INTJ", "ENFP"], ["INTP", "ENTJ"], ["ENTJ", "INTP"], ["ENTP", "INFJ"],
              ["INFJ", "ENTP"], ["INFP", "ESTJ"], ["ENFJ", "ISFP"], ["ENFP", "INTJ"],
              ["ISTJ", "ESFP"], ["ISFJ", "ESTP"], ["ESTJ", "INFP"], ["ESFJ", "ISTP"],
              ["ISTP", "ESFJ"], ["ISFP", "ENFJ"], ["ESTP", "ISFJ"], ["ESFP", "ISTJ"]
            ];
            const isCompatible = mbtiCompatible.some(
              ([a, b]) => 
                (a === personality1.mbti && b === personality2.mbti) ||
                (b === personality1.mbti && a === personality2.mbti)
            );
            totalScore += isCompatible ? 2 : 1;
            reasons.push("🧠 Compatible MBTI types");
          }
        }

        // Social Battery (2 points)
        if (personality1.socialBattery && personality2.socialBattery) {
          if (personality1.socialBattery === personality2.socialBattery) {
            totalScore += 2;
            reasons.push("⚡ Matching social energy");
          } else {
            totalScore += 1;
          }
        }
        const year1 = parseInt(String(currentProfile.yearLevel || "0").replace(/\D/g, ""));
        const year2 = parseInt(String(otherProfile.yearLevel || "0").replace(/\D/g, ""));
        if (year1 > 0 && year2 > 0) {
          const yearDiff = Math.abs(year1 - year2);
          if (yearDiff === 0) totalScore += 3;
          else if (yearDiff === 1) totalScore += 2;
          else if (yearDiff === 2) totalScore += 1;
        }

        if (currentProfile.college && otherProfile.college && currentProfile.college === otherProfile.college) {
          totalScore += 2;
        }

        totalScore = Math.min(Math.floor(totalScore), 100);

        return {
          userId: row.user_id,
          alias: row.alias,
          email: otherProfile.email || "N/A",
          compatibilityScore: totalScore,
          reasons: reasons.length > 0 ? reasons : ["✨ Great compatibility potential"],
          commonInterests: sharedInterests,
          personality: {
            mbti: personality2.mbti,
            zodiac: personality2.sunSign,
            socialBattery: personality2.socialBattery
          }
        };
      })
    );

    // Filter out null results and sort
    const validSuggestions = suggestions.filter(s => s !== null) as any[];
    validSuggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    console.log(`📊 Compatibility suggestions for user ${userId}:`);
    console.log(`   - Found ${otherUsersResult.rows.length} potential matches`);
    console.log(`   - Generated ${validSuggestions.length} valid suggestions`);
    
    // If no suggestions, provide more detailed info
    if (validSuggestions.length === 0) {
      console.warn(`⚠️  No suggestions generated. Possible reasons:`);
      console.warn(`   - No other users in system (total: ${totalUsersCheck.rows[0]?.count || 0})`);
      console.warn(`   - All users are already matched`);
      console.warn(`   - Users don't have profiles`);
    }

    return res.json({ 
      suggestions: validSuggestions,
      debug: {
        totalUsers: parseInt(totalUsersCheck.rows[0]?.count || "0"),
        potentialMatches: otherUsersResult.rows.length,
        validSuggestions: validSuggestions.length
      }
    });
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
