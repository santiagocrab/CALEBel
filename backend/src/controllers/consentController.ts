import { Request, Response } from "express";
import { isUserInMatch } from "../services/chatService";
import {
  bothConsented,
  getMatchParticipants,
  upsertConsentChat,
  upsertConsentReveal
} from "../services/consentService";
import { query } from "../db";
import { sendEmail } from "../services/emailService";

async function getProfileEmail(userId: string) {
  const result = await query<{ profile: Record<string, any> }>(
    "SELECT profile FROM user_profiles WHERE user_id = $1",
    [userId]
  );
  return result.rows[0]?.profile?.email ?? null;
}

async function getProfileMode(userId: string) {
  const result = await query<{ profile: Record<string, any> }>(
    "SELECT profile FROM user_profiles WHERE user_id = $1",
    [userId]
  );
  return result.rows[0]?.profile?.participationMode ?? null;
}

export async function consentChat(req: Request, res: Response) {
  const { matchId, userId, consent } = req.body as {
    matchId: string;
    userId: string;
    consent: boolean;
  };

  if (!matchId || !userId) {
    return res.status(400).json({ error: "matchId and userId required." });
  }
  const inMatch = await isUserInMatch(matchId, userId);
  if (!inMatch) {
    return res.status(403).json({ error: "User not in match." });
  }

  await upsertConsentChat(matchId, userId, Boolean(consent));
  const unlocked = await bothConsented(matchId, "consent_chat");
  return res.json({ unlocked });
}

export async function consentReveal(req: Request, res: Response) {
  const { matchId, userId, consent } = req.body as {
    matchId: string;
    userId: string;
    consent: boolean;
  };

  if (!matchId || !userId) {
    return res.status(400).json({ error: "matchId and userId required." });
  }
  const inMatch = await isUserInMatch(matchId, userId);
  if (!inMatch) {
    return res.status(403).json({ error: "User not in match." });
  }

  await upsertConsentReveal(matchId, userId, Boolean(consent));
  const revealed = await bothConsented(matchId, "consent_reveal");

  if (revealed) {
    const participants = await getMatchParticipants(matchId);
    if (participants) {
      const user1Email = await getProfileEmail(participants.user1_id);
      const user2Email = await getProfileEmail(participants.user2_id);
      const user1Mode = await getProfileMode(participants.user1_id);
      const user2Mode = await getProfileMode(participants.user2_id);
      const subject = "CALEBel Mutual Reveal";
      const body =
        user1Mode === "anonymous" || user2Mode === "anonymous"
          ? "<p>Your match chose Reveal. Since one or both of you are anonymous, please meet at the CICT SC booth at the scheduled time with your alias card.</p>"
          : "<p>Your match chose Reveal. You may now share identities and socials as agreed.</p>";
      if (user1Email) {
        await sendEmail(user1Email, subject, body);
      }
      if (user2Email) {
        await sendEmail(user2Email, subject, body);
      }
    }
  }

  return res.json({ revealed });
}
