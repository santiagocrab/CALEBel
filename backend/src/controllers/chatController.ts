import { Request, Response } from "express";
import { query } from "../db";
import {
  isUserInMatch,
  getChatLimits,
  incrementChatLimit,
  createChatMessage,
  listChatMessages,
  getRemainingLimits
} from "../services/chatService";
import { bothConsented } from "../services/consentService";

const MAX_MESSAGES = 25;
const MAX_CHARS = 150;
const BLOCKED_TERMS = ["fuck", "shit", "bitch", "asshole"];

function containsProfanity(message: string) {
  const lower = message.toLowerCase();
  return BLOCKED_TERMS.some((term) => lower.includes(term));
}

export async function sendMessage(req: Request, res: Response) {
  const { matchId, senderId, message } = req.body as {
    matchId: string;
    senderId: string;
    message: string;
  };

  if (!matchId || !senderId || !message) {
    return res.status(400).json({ error: "matchId, senderId, and message required." });
  }
  if (message.length > MAX_CHARS) {
    return res.status(400).json({ error: "Message exceeds 150 characters." });
  }
  if (containsProfanity(message)) {
    return res.status(400).json({ error: "Message contains inappropriate language." });
  }

  const inMatch = await isUserInMatch(matchId, senderId);
  if (!inMatch) {
    return res.status(403).json({ error: "Sender not in match." });
  }
  const unlocked = await bothConsented(matchId, "consent_chat");
  if (!unlocked) {
    return res.status(403).json({ error: "Chat is locked until both users consent." });
  }

  const sentCount = await getChatLimits(matchId, senderId);
  if (sentCount === null) {
    return res.status(404).json({ error: "Chat limits not initialized." });
  }
  if (sentCount >= MAX_MESSAGES) {
    return res.status(403).json({ error: "Message limit reached." });
  }

  const messageId = await createChatMessage(matchId, senderId, message);
  await incrementChatLimit(matchId, senderId);

  // Check if this is the first message from this user
  // If so, notify the partner via email
  if (sentCount === 0) {
    try {
      // Get match details to find partner
      const matchResult = await query<{ user1_id: string; user2_id: string }>(
        "SELECT user1_id, user2_id FROM matches WHERE id = $1",
        [matchId]
      );
      const match = matchResult.rows[0];
      if (match) {
        const partnerId = match.user1_id === senderId ? match.user2_id : match.user1_id;
        
        // Get partner's email and alias
        const partnerResult = await query<{ profile: Record<string, any> }>(
          "SELECT profile FROM user_profiles WHERE user_id = $1",
          [partnerId]
        );
        const partnerProfile = partnerResult.rows[0]?.profile;
        const partnerEmail = partnerProfile?.email;
        const senderAlias = (await query<{ alias: string }>(
          "SELECT alias FROM users WHERE id = $1",
          [senderId]
        )).rows[0]?.alias || "Your Ka-Label";
        
        if (partnerEmail) {
          const { generateChatNotificationEmail } = await import("../templates/emailTemplates");
          const { sendEmail } = await import("../services/emailService");
          const websiteUrl = process.env.FRONTEND_URL || "http://localhost:3005";
          const emailHtml = generateChatNotificationEmail(senderAlias, websiteUrl);
          await sendEmail(
            partnerEmail,
            "💬 Your Ka-Label Sent You a Message! 💕",
            emailHtml
          );
        }
      }
    } catch (err) {
      console.error("Error sending chat notification email:", err);
      // Don't fail the message send if email fails
    }
  }

  return res.status(201).json({
    messageId,
    remaining: MAX_MESSAGES - (sentCount + 1)
  });
}

export async function getMessages(req: Request, res: Response) {
  const { matchId } = req.params;
  if (!matchId) {
    return res.status(400).json({ error: "matchId required." });
  }
  const messages = await listChatMessages(matchId);
  const limits = await getRemainingLimits(matchId);

  const remaining = limits.reduce<Record<string, number>>((acc, row) => {
    acc[row.user_id] = MAX_MESSAGES - row.messages_sent;
    return acc;
  }, {});

  return res.json({
    matchId,
    messages,
    limits: remaining
  });
}
