import { query } from "../db";
import { sendEmail } from "./emailService";

type WaitingUser = {
  id: string;
  profile: {
    interests: string[];
    preferred: Record<string, string>;
    personality?: Record<string, string>;
    sogiesc?: Record<string, string>;
    loveLanguageReceive?: string[];
    loveLanguageProvide?: string[];
  };
};

function getInterests(user: WaitingUser) {
  return new Set(user.profile.interests ?? []);
}

function matchesPreference(preferred: string | undefined, value: string | undefined) {
  const normalized = preferred?.toLowerCase() ?? "";
  if (!preferred || normalized.includes("any") || normalized.includes("no preference")) {
    return true;
  }
  return preferred === value;
}

function preferencePasses(u: WaitingUser, v: WaitingUser) {
  const pref = u.profile.preferred ?? {};
  const vp = v.profile as Record<string, any>;
  return (
    matchesPreference(pref.college, vp.college) &&
    matchesPreference(pref.course, vp.course) &&
    matchesPreference(pref.yearLevel, vp.yearLevel) &&
    matchesPreference(pref.identity, vp.identity)
  );
}

/**
 * Enhanced compatibility scoring algorithm
 * Uses multi-dimensional analysis for better matching
 */
function compatibilityScore(u: WaitingUser, v: WaitingUser) {
  let totalScore = 0;
  const maxScore = 100;

  // 1. INTERESTS MATCHING (30 points max)
  const uInterests = getInterests(u);
  const vInterests = getInterests(v);
  const sharedInterests = [...vInterests].filter((i) => uInterests.has(i));
  const totalUniqueInterests = new Set([...uInterests, ...vInterests]).size;
  
  if (sharedInterests.length < 3) {
    return 0; // Minimum 3 shared interests required
  }
  
  // Interest diversity bonus (more shared interests = higher score)
  const interestRatio = sharedInterests.length / Math.max(totalUniqueInterests, 1);
  const interestScore = Math.min(30 * (interestRatio * 1.5), 30);
  totalScore += interestScore;

  // 2. PREFERENCE COMPATIBILITY (15 points max)
  if (!preferencePasses(u, v) || !preferencePasses(v, u)) {
    return 0; // Must pass mutual preferences
  }
  
  const pref1 = u.profile.preferred ?? {};
  const pref2 = v.profile.preferred ?? {};
  const vp = v.profile as Record<string, any>;
  const up = u.profile as Record<string, any>;
  
  let preferenceScore = 15; // Base score for passing preferences
  // Bonus for exact matches
  if (pref1.college && pref1.college !== "Any" && pref1.college === vp.college) preferenceScore += 2;
  if (pref1.course && pref1.course !== "Any" && pref1.course === vp.course) preferenceScore += 2;
  if (pref1.yearLevel && pref1.yearLevel !== "Any" && pref1.yearLevel === vp.yearLevel) preferenceScore += 1;
  totalScore += Math.min(preferenceScore, 20);

  // 3. PERSONALITY ALIGNMENT (25 points max)
  const personalityU = u.profile.personality ?? {};
  const personalityV = v.profile.personality ?? {};
  
  // MBTI Compatibility (10 points)
  if (personalityU.mbti && personalityV.mbti) {
    if (personalityU.mbti === personalityV.mbti) {
      totalScore += 10; // Perfect match
    } else {
      // Partial match based on MBTI compatibility matrix
      const mbtiCompatible = [
        ["INTJ", "ENFP"], ["INTP", "ENTJ"], ["ENTJ", "INTP"], ["ENTP", "INFJ"],
        ["INFJ", "ENTP"], ["INFP", "ESTJ"], ["ENFJ", "ISFP"], ["ENFP", "INTJ"],
        ["ISTJ", "ESFP"], ["ISFJ", "ESTP"], ["ESTJ", "INFP"], ["ESFJ", "ISTP"],
        ["ISTP", "ESFJ"], ["ISFP", "ENFJ"], ["ESTP", "ISFJ"], ["ESFP", "ISTJ"]
      ];
      const isCompatible = mbtiCompatible.some(
        ([a, b]) => 
          (a === personalityU.mbti && b === personalityV.mbti) ||
          (b === personalityU.mbti && a === personalityV.mbti)
      );
      totalScore += isCompatible ? 7 : 4; // Compatible types get bonus
    }
  }

  // Social Battery (8 points)
  if (personalityU.socialBattery && personalityV.socialBattery) {
    if (personalityU.socialBattery === personalityV.socialBattery) {
      totalScore += 8; // Perfect match
    } else {
      // Complementary matching (introvert + extrovert can work)
      const uBattery = personalityU.socialBattery.toLowerCase();
      const vBattery = personalityV.socialBattery.toLowerCase();
      const bothIntro = (uBattery.includes("introvert") && vBattery.includes("introvert"));
      const bothExtra = (uBattery.includes("extrovert") && vBattery.includes("extrovert"));
      totalScore += bothIntro || bothExtra ? 5 : 6; // Complementary gets slight bonus
    }
  }

  // Zodiac Sign (7 points)
  if (personalityU.sunSign && personalityV.sunSign) {
    if (personalityU.sunSign === personalityV.sunSign) {
      totalScore += 7;
    } else {
      // Zodiac element compatibility
      const elements: Record<string, string[]> = {
        fire: ["Aries", "Leo", "Sagittarius"],
        earth: ["Taurus", "Virgo", "Capricorn"],
        air: ["Gemini", "Libra", "Aquarius"],
        water: ["Cancer", "Scorpio", "Pisces"]
      };
      const uElement = Object.keys(elements).find(k => elements[k].includes(personalityU.sunSign));
      const vElement = Object.keys(elements).find(k => elements[k].includes(personalityV.sunSign));
      if (uElement === vElement) {
        totalScore += 5; // Same element
      } else {
        totalScore += 3; // Different elements
      }
    }
  }

  // 4. LOVE LANGUAGES (20 points max)
  const loveLangUReceive = u.profile.loveLanguageReceive ?? [];
  const loveLangVProvide = v.profile.loveLanguageProvide ?? [];
  const loveLangUProvide = u.profile.loveLanguageProvide ?? [];
  const loveLangVReceive = v.profile.loveLanguageReceive ?? [];
  
  // Reciprocal matching (how I receive matches how they give)
  const receiveMatch = loveLangUReceive.filter(lang => loveLangVProvide.includes(lang)).length;
  const provideMatch = loveLangUProvide.filter(lang => loveLangVReceive.includes(lang)).length;
  const totalLoveLangMatches = receiveMatch + provideMatch;
  
  if (totalLoveLangMatches > 0) {
    // Perfect reciprocal match gets bonus
    const perfectReciprocal = receiveMatch > 0 && provideMatch > 0;
    totalScore += Math.min(totalLoveLangMatches * 6 + (perfectReciprocal ? 5 : 0), 20);
  }

  // 5. SOGIESC COMPATIBILITY (10 points max)
  const sogiescU = u.profile.sogiesc ?? {};
  const sogiescV = v.profile.sogiesc ?? {};
  
  // Gender expression compatibility
  if (sogiescU.genderExpression && sogiescV.genderExpression) {
    if (sogiescU.genderExpression === sogiescV.genderExpression) {
      totalScore += 6;
    } else {
      totalScore += 3; // Different expressions can still be compatible
    }
  }
  
  // Sexual orientation compatibility check
  const orientationU = sogiescU.orientation || sogiescU.sexualOrientation;
  const orientationV = sogiescV.orientation || sogiescV.sexualOrientation;
  if (orientationU && orientationV) {
    // Basic compatibility check (simplified)
    const compatibleOrientations = [
      ["Heterosexual", "Heterosexual"],
      ["Homosexual", "Homosexual"],
      ["Bisexual", "Bisexual"],
      ["Bisexual", "Heterosexual"],
      ["Bisexual", "Homosexual"],
      ["Pansexual", "Pansexual"],
      ["Pansexual", "Bisexual"],
      ["Pansexual", "Heterosexual"],
      ["Pansexual", "Homosexual"]
    ];
    const isCompatible = compatibleOrientations.some(
      ([a, b]) => 
        (a === orientationU && b === orientationV) ||
        (b === orientationU && a === orientationV)
    );
    if (isCompatible) {
      totalScore += 4;
    } else {
      return 0; // Incompatible orientations
    }
  }

  // 6. BONUS FACTORS (5 points max)
  // Age/Year level proximity bonus
  const yearU = parseInt(up.yearLevel?.replace(/\D/g, "") || "0");
  const yearV = parseInt(vp.yearLevel?.replace(/\D/g, "") || "0");
  if (yearU > 0 && yearV > 0) {
    const yearDiff = Math.abs(yearU - yearV);
    if (yearDiff === 0) totalScore += 3;
    else if (yearDiff === 1) totalScore += 2;
    else if (yearDiff === 2) totalScore += 1;
  }

  // College match bonus
  if (up.college && vp.college && up.college === vp.college) {
    totalScore += 2;
  }

  return Math.min(Math.floor(totalScore), maxScore);
}

function matchReasons(u: WaitingUser, v: WaitingUser) {
  const reasons: string[] = [];
  
  // Shared interests
  const sharedInterests = [...getInterests(u)].filter((i) => getInterests(v).has(i));
  if (sharedInterests.length >= 5) {
    reasons.push(`🌟 ${sharedInterests.length} shared interests`);
  } else if (sharedInterests.length >= 3) {
    reasons.push(`✨ ${sharedInterests.length} shared interests`);
  }
  
  // Love languages - reciprocal matching
  const receiveU = u.profile?.loveLanguageReceive ?? [];
  const provideV = v.profile?.loveLanguageProvide ?? [];
  const provideU = u.profile?.loveLanguageProvide ?? [];
  const receiveV = v.profile?.loveLanguageReceive ?? [];
  
  const receiveMatch = receiveU.filter((lang: string) => provideV.includes(lang)).length;
  const provideMatch = provideU.filter((lang: string) => receiveV.includes(lang)).length;
  
  if (receiveMatch > 0 && provideMatch > 0) {
    reasons.push(`💕 Perfect love language match (${receiveMatch + provideMatch} languages)`);
  } else if (receiveMatch > 0 || provideMatch > 0) {
    reasons.push(`💖 Love language compatibility`);
  }
  
  // Personality matches
  const personalityU = u.profile.personality ?? {};
  const personalityV = v.profile.personality ?? {};
  
  if (personalityU.mbti && personalityV.mbti) {
    if (personalityU.mbti === personalityV.mbti) {
      reasons.push(`🧠 Same MBTI type (${personalityU.mbti})`);
    } else {
      reasons.push(`🧠 Compatible MBTI types`);
    }
  }
  
  if (personalityU.socialBattery && personalityV.socialBattery) {
    if (personalityU.socialBattery === personalityV.socialBattery) {
      reasons.push(`⚡ Matching social energy`);
    } else {
      reasons.push(`⚡ Complementary social styles`);
    }
  }
  
  // Preference match
  if (preferencePasses(u, v) && preferencePasses(v, u)) {
    reasons.push(`🎯 Perfect preference alignment`);
  }
  
  // Zodiac compatibility
  if (personalityU.sunSign && personalityV.sunSign) {
    if (personalityU.sunSign === personalityV.sunSign) {
      reasons.push(`⭐ Same zodiac sign (${personalityU.sunSign})`);
    }
  }
  
  // Ensure at least 3 reasons
  if (reasons.length < 3) {
    reasons.push("✨ Great compatibility potential");
  }
  
  return reasons.slice(0, 5); // Return up to 5 reasons
}

export async function matchWaitingUsers() {
  const result = await query<WaitingUser>(
    "SELECT u.id, p.profile FROM users u JOIN user_profiles p ON u.id = p.user_id WHERE u.status = 'waiting'"
  );
  const waiting = result.rows;
  const used = new Set<string>();
  let matchedCount = 0;

  for (const u of waiting) {
    if (used.has(u.id)) {
      continue;
    }
    let best: WaitingUser | null = null;
    let bestScore = 0;
    for (const v of waiting) {
      if (u.id === v.id || used.has(v.id)) {
        continue;
      }
      const score = compatibilityScore(u, v);
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    }
    if (best && bestScore > 0) {
      const reasons = matchReasons(u, best);
      const matchResult = await query<{ id: string }>(
        "INSERT INTO matches(user1_id, user2_id, compatibility_score, reasons) VALUES ($1, $2, $3, $4) RETURNING id",
        [u.id, best.id, bestScore, reasons]
      );
      const matchId = matchResult.rows[0]?.id;
      if (matchId) {
        await query("UPDATE users SET status = 'matched' WHERE id IN ($1, $2)", [
          u.id,
          best.id
        ]);
        await query(
          "INSERT INTO chat_limits(user_id, match_id, messages_sent) VALUES ($1, $3, 0), ($2, $3, 0)",
          [u.id, best.id, matchId]
        );
        // Get user emails - try from profile first, then from users table
        const userEmails = await query<{ user_id: string; email: string }>(
          "SELECT u.id as user_id, COALESCE(up.profile->>'email', u.email) as email FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id IN ($1, $2)",
          [u.id, best.id]
        );
        
        // Send match found email with congratulations
        const { generateMatchFoundEmail } = await import("../templates/emailTemplates");
        const websiteUrl = process.env.FRONTEND_URL || "https://calebel.vercel.app";
        
        for (const row of userEmails.rows) {
          const email = row.email;
          if (email) {
            try {
              const emailHtml = generateMatchFoundEmail(bestScore, reasons, websiteUrl, false);
              await sendEmail(
                email,
                "🎉 Congratulations! We Found Your Ka-Label! 💕",
                emailHtml
              );
              console.log(`✅ Match found email sent to: ${email}`);
            } catch (err: any) {
              console.error(`❌ Failed to send match found email to ${email}:`, err?.message || err);
              // Don't fail the match if email fails
            }
          } else {
            console.warn(`⚠️  No email found for user ${row.user_id}, skipping match notification email`);
          }
        }
        used.add(u.id);
        used.add(best.id);
        matchedCount += 1;
      }
    }
  }
  return matchedCount;
}

export async function getMatchByUser(userId: string) {
  // First check if active column exists, if not, query without it
  const matchResult = await query<{
    id: string;
    user1_id: string;
    user2_id: string;
    compatibility_score: number;
    reasons: string[];
    active?: boolean;
  }>(
    "SELECT id, user1_id, user2_id, compatibility_score, reasons FROM matches WHERE (user1_id = $1 OR user2_id = $1) LIMIT 1",
    [userId]
  );
  const match = matchResult.rows[0];
  if (!match) {
    return null;
  }
  const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;
  
  // Get partner's user alias and profile
  const partnerUserResult = await query<{ alias: string }>(
    "SELECT alias FROM users WHERE id = $1",
    [partnerId]
  );
  const partnerAlias = partnerUserResult.rows[0]?.alias || "Unknown";
  
  const partnerProfileResult = await query<{ profile: Record<string, any> }>(
    "SELECT profile FROM user_profiles WHERE user_id = $1",
    [partnerId]
  );
  const partnerProfile = partnerProfileResult.rows[0]?.profile ?? {};
  
  // Ensure alias is included in partnerProfile
  if (partnerProfile && !partnerProfile.alias) {
    partnerProfile.alias = partnerAlias;
  }
  
  return {
    matchId: match.id,
    compatibilityScore: match.compatibility_score,
    reasons: match.reasons ?? [],
    partnerProfile: {
      ...partnerProfile,
      alias: partnerAlias
    }
  };
}
