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
  const up = u.profile as Record<string, any>;
  const vp = v.profile as Record<string, any>;
  const sogiescU = u.profile.sogiesc ?? {};
  const sogiescV = v.profile.sogiesc ?? {};

  // ===== SECTION 3: SOGIE-SC COMPATIBILITY (PRIMARY - 40 points max) =====
  // This is the MOST IMPORTANT factor for matching
  
  // 1. SEXUAL ORIENTATION COMPATIBILITY (15 points - CRITICAL)
  const orientationU = sogiescU.orientation || sogiescU.sexualOrientation || "";
  const orientationV = sogiescV.orientation || sogiescV.sexualOrientation || "";
  
  if (orientationU && orientationV) {
    // Comprehensive orientation compatibility matrix
    const compatibleOrientations: Record<string, string[]> = {
      "Heterosexual": ["Heterosexual", "Bisexual", "Pansexual"],
      "Homosexual": ["Homosexual", "Bisexual", "Pansexual"],
      "Bisexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
      "Pansexual": ["Heterosexual", "Homosexual", "Bisexual", "Pansexual"],
      "Asexual": ["Asexual", "Demisexual", "Gray-Asexual"],
      "Queer": ["Queer", "Bisexual", "Pansexual", "Heterosexual", "Homosexual"]
    };
    
    const uCompatible = compatibleOrientations[orientationU] || [];
    const isCompatible = uCompatible.includes(orientationV);
    
    if (!isCompatible) {
      return 0; // Incompatible orientations - no match possible
    }
    
    // Perfect match gets maximum points
    if (orientationU === orientationV) {
      totalScore += 15;
    } else {
      // Compatible but different orientations
      totalScore += 10;
    }
  } else {
    // If orientation not specified, give base score but lower
    totalScore += 5;
  }

  // 2. GENDER IDENTITY COMPATIBILITY (10 points)
  const genderIdentityU = sogiescU.genderIdentity || "";
  const genderIdentityV = sogiescV.genderIdentity || "";
  
  if (genderIdentityU && genderIdentityV) {
    if (genderIdentityU === genderIdentityV) {
      totalScore += 10; // Same gender identity
    } else {
      // Different but compatible identities
      const compatibleIdentities: Record<string, string[]> = {
        "Man": ["Man", "Non-binary", "Genderqueer"],
        "Woman": ["Woman", "Non-binary", "Genderqueer"],
        "Non-binary": ["Non-binary", "Man", "Woman", "Genderqueer", "Genderfluid"],
        "Genderqueer": ["Genderqueer", "Non-binary", "Man", "Woman"],
        "Genderfluid": ["Genderfluid", "Non-binary", "Genderqueer"]
      };
      
      const uCompatible = compatibleIdentities[genderIdentityU] || [];
      if (uCompatible.includes(genderIdentityV)) {
        totalScore += 7; // Compatible identities
      } else {
        totalScore += 4; // Different but still valid
      }
    }
  }

  // 3. GENDER EXPRESSION COMPATIBILITY (8 points)
  const genderExpressionU = sogiescU.genderExpression || "";
  const genderExpressionV = sogiescV.genderExpression || "";
  
  if (genderExpressionU && genderExpressionV) {
    if (genderExpressionU === genderExpressionV) {
      totalScore += 8; // Matching expression
    } else {
      // Complementary expressions can work well
      const complementaryPairs = [
        ["Masculine", "Feminine"],
        ["Feminine", "Androgynous"],
        ["Androgynous", "Fluid"],
        ["Fluid", "Masculine"],
        ["Fluid", "Feminine"]
      ];
      
      const isComplementary = complementaryPairs.some(
        ([a, b]) => 
          (a === genderExpressionU && b === genderExpressionV) ||
          (b === genderExpressionU && a === genderExpressionV)
      );
      
      totalScore += isComplementary ? 6 : 4; // Complementary or different
    }
  }

  // 4. PRONOUNS COMPATIBILITY (4 points)
  const pronounsU = sogiescU.pronouns || "";
  const pronounsV = sogiescV.pronouns || "";
  
  if (pronounsU && pronounsV) {
    if (pronounsU === pronounsV) {
      totalScore += 4; // Same pronouns
    } else if (pronounsU.includes("/") && pronounsV.includes("/")) {
      // Check if there's overlap (e.g., "He/They" and "They/Them")
      const uPronouns = pronounsU.split("/");
      const vPronouns = pronounsV.split("/");
      const hasOverlap = uPronouns.some(p => vPronouns.includes(p));
      totalScore += hasOverlap ? 3 : 2;
    } else {
      totalScore += 2; // Different pronouns
    }
  }

  // 5. SEX CHARACTERISTICS (3 points - less weight, more inclusive)
  const sexCharU = sogiescU.sexCharacteristics || "";
  const sexCharV = sogiescV.sexCharacteristics || "";
  
  if (sexCharU && sexCharV && sexCharU === sexCharV) {
    totalScore += 3; // Same sex characteristics
  }

  // ===== PREFERRED PERSON MATCHING (25 points max) =====
  // Check if they match each other's preferences
  
  if (!preferencePasses(u, v) || !preferencePasses(v, u)) {
    return 0; // Must pass mutual preferences
  }
  
  const pref1 = u.profile.preferred ?? {};
  const pref2 = v.profile.preferred ?? {};
  
  let preferenceScore = 10; // Base score for passing preferences
  
  // College preference matching (both directions)
  if (pref1.college && pref1.college !== "Any") {
    if (pref1.college === vp.college) {
      preferenceScore += 5; // User 1's preference matches User 2
    }
  }
  if (pref2.college && pref2.college !== "Any") {
    if (pref2.college === up.college) {
      preferenceScore += 5; // User 2's preference matches User 1
    }
  }
  
  // Year level preference matching
  if (pref1.yearLevel && pref1.yearLevel !== "Any") {
    if (pref1.yearLevel === vp.yearLevel) {
      preferenceScore += 3;
    }
  }
  if (pref2.yearLevel && pref2.yearLevel !== "Any") {
    if (pref2.yearLevel === up.yearLevel) {
      preferenceScore += 3;
    }
  }
  
  // Course preference matching
  if (pref1.course && pref1.course !== "Any") {
    if (pref1.course === vp.course) {
      preferenceScore += 2;
    }
  }
  if (pref2.course && pref2.course !== "Any") {
    if (pref2.course === up.course) {
      preferenceScore += 2;
    }
  }
  
  totalScore += Math.min(preferenceScore, 25);

  // ===== INTERESTS MATCHING (20 points max) =====
  const uInterests = getInterests(u);
  const vInterests = getInterests(v);
  const sharedInterests = [...vInterests].filter((i) => uInterests.has(i));
  const totalUniqueInterests = new Set([...uInterests, ...vInterests]).size;
  
  if (sharedInterests.length < 3) {
    // Still allow match but with lower score
    totalScore += sharedInterests.length * 2;
  } else {
    const interestRatio = sharedInterests.length / Math.max(totalUniqueInterests, 1);
    const interestScore = Math.min(20 * (interestRatio * 1.2), 20);
    totalScore += interestScore;
  }

  // ===== LOVE LANGUAGES (10 points max) =====
  const loveLangUReceive = u.profile.loveLanguageReceive ?? [];
  const loveLangVProvide = v.profile.loveLanguageProvide ?? [];
  const loveLangUProvide = u.profile.loveLanguageProvide ?? [];
  const loveLangVReceive = v.profile.loveLanguageReceive ?? [];
  
  const receiveMatch = loveLangUReceive.filter(lang => loveLangVProvide.includes(lang)).length;
  const provideMatch = loveLangUProvide.filter(lang => loveLangVReceive.includes(lang)).length;
  const totalLoveLangMatches = receiveMatch + provideMatch;
  
  if (totalLoveLangMatches > 0) {
    const perfectReciprocal = receiveMatch > 0 && provideMatch > 0;
    totalScore += Math.min(totalLoveLangMatches * 3 + (perfectReciprocal ? 2 : 0), 10);
  }

  // ===== PERSONALITY ALIGNMENT (5 points max - reduced weight) =====
  const personalityU = u.profile.personality ?? {};
  const personalityV = v.profile.personality ?? {};
  
  // MBTI Compatibility (3 points)
  if (personalityU.mbti && personalityV.mbti) {
    if (personalityU.mbti === personalityV.mbti) {
      totalScore += 3;
    } else {
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
      totalScore += isCompatible ? 2 : 1;
    }
  }

  // Social Battery (2 points)
  if (personalityU.socialBattery && personalityV.socialBattery) {
    if (personalityU.socialBattery === personalityV.socialBattery) {
      totalScore += 2;
    } else {
      totalScore += 1;
    }
  }

  return Math.min(Math.floor(totalScore), maxScore);
}

function matchReasons(u: WaitingUser, v: WaitingUser) {
  const reasons: string[] = [];
  const sogiescU = u.profile.sogiesc ?? {};
  const sogiescV = v.profile.sogiesc ?? {};
  const up = u.profile as Record<string, any>;
  const vp = v.profile as Record<string, any>;
  const pref1 = u.profile.preferred ?? {};
  const pref2 = v.profile.preferred ?? {};
  
  // ===== SECTION 3: SOGIE-SC REASONS (PRIORITY) =====
  
  // Sexual orientation match
  const orientationU = sogiescU.orientation || sogiescU.sexualOrientation || "";
  const orientationV = sogiescV.orientation || sogiescV.sexualOrientation || "";
  if (orientationU && orientationV) {
    if (orientationU === orientationV) {
      reasons.push(`💜 Perfect orientation match (${orientationU})`);
    } else {
      reasons.push(`💜 Compatible orientations`);
    }
  }
  
  // Gender identity match
  const genderIdentityU = sogiescU.genderIdentity || "";
  const genderIdentityV = sogiescV.genderIdentity || "";
  if (genderIdentityU && genderIdentityV) {
    if (genderIdentityU === genderIdentityV) {
      reasons.push(`🌈 Matching gender identity (${genderIdentityU})`);
    } else {
      reasons.push(`🌈 Compatible gender identities`);
    }
  }
  
  // Gender expression match
  const genderExpressionU = sogiescU.genderExpression || "";
  const genderExpressionV = sogiescV.genderExpression || "";
  if (genderExpressionU && genderExpressionV) {
    if (genderExpressionU === genderExpressionV) {
      reasons.push(`✨ Matching gender expression (${genderExpressionU})`);
    } else {
      reasons.push(`✨ Complementary expressions`);
    }
  }
  
  // ===== PREFERRED PERSON MATCHING =====
  
  // Check if preferences match
  let prefMatches = 0;
  if (pref1.college && pref1.college !== "Any" && pref1.college === vp.college) {
    prefMatches++;
  }
  if (pref2.college && pref2.college !== "Any" && pref2.college === up.college) {
    prefMatches++;
  }
  if (pref1.yearLevel && pref1.yearLevel !== "Any" && pref1.yearLevel === vp.yearLevel) {
    prefMatches++;
  }
  if (pref2.yearLevel && pref2.yearLevel !== "Any" && pref2.yearLevel === up.yearLevel) {
    prefMatches++;
  }
  
  if (prefMatches >= 3) {
    reasons.push(`🎯 Perfect preference alignment (${prefMatches} matches)`);
  } else if (prefMatches >= 2) {
    reasons.push(`🎯 Strong preference match`);
  } else if (prefMatches >= 1) {
    reasons.push(`🎯 Preference compatibility`);
  }
  
  // ===== INTERESTS =====
  const sharedInterests = [...getInterests(u)].filter((i) => getInterests(v).has(i));
  if (sharedInterests.length >= 5) {
    reasons.push(`🌟 ${sharedInterests.length} shared interests`);
  } else if (sharedInterests.length >= 3) {
    reasons.push(`✨ ${sharedInterests.length} shared interests`);
  }
  
  // ===== LOVE LANGUAGES =====
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
  
  // ===== PERSONALITY =====
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
    }
  }
  
  // Ensure at least 3 reasons
  if (reasons.length < 3) {
    reasons.push("✨ Great compatibility potential");
  }
  
  return reasons.slice(0, 6); // Return up to 6 reasons
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
