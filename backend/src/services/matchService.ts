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

function compatibilityScore(u: WaitingUser, v: WaitingUser) {
  const uInterests = getInterests(u);
  const shared = [...getInterests(v)].filter((i) => uInterests.has(i));
  if (shared.length < 3) {
    return 0;
  }
  if (!preferencePasses(u, v) || !preferencePasses(v, u)) {
    return 0;
  }
  const personalityU = u.profile.personality ?? {};
  const personalityV = v.profile.personality ?? {};
  const score =
    40 * Math.min(shared.length / 8, 1) +
    (personalityU.socialBattery === personalityV.socialBattery ? 20 : 5) +
    (personalityU.mbti === personalityV.mbti ? 20 : 5) +
    (personalityU.sunSign === personalityV.sunSign ? 10 : 3) +
    (u.profile.sogiesc?.genderExpression === v.profile.sogiesc?.genderExpression
      ? 10
      : 3);
  return Math.floor(score);
}

function matchReasons(u: WaitingUser, v: WaitingUser) {
  const reasons: string[] = [];
  const sharedInterests = [...getInterests(u)].filter((i) => getInterests(v).has(i));
  if (sharedInterests.length >= 3) {
    reasons.push("Shared interests");
  }
  const receiveU = u.profile?.loveLanguageReceive ?? [];
  const receiveV = v.profile?.loveLanguageReceive ?? [];
  const overlap = receiveU.filter((lang: string) => receiveV.includes(lang));
  if (overlap.length > 0) {
    reasons.push("Love language overlap");
  }
  if (preferencePasses(u, v) && preferencePasses(v, u)) {
    reasons.push("Preference match");
  }
  if (reasons.length < 3) {
    reasons.push("Personality alignment");
  }
  return reasons.slice(0, 3);
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
        const userEmails = await query<{ profile: Record<string, any> }>(
          "SELECT profile FROM user_profiles WHERE user_id IN ($1, $2)",
          [u.id, best.id]
        );
        
        // Send match found email with congratulations
        const { generateMatchFoundEmail } = await import("../templates/emailTemplates");
        const websiteUrl = process.env.FRONTEND_URL || "https://calebel.vercel.app";
        
        for (const row of userEmails.rows) {
          const email = row.profile?.email;
          if (email) {
            try {
              const emailHtml = generateMatchFoundEmail(bestScore, reasons, websiteUrl);
              await sendEmail(
                email,
                "🎉 Congratulations! We Found Your Ka-Label! 💕",
                emailHtml
              );
            } catch (err) {
              console.error("Error sending match found email:", err);
            }
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
