import { Request, Response } from "express";
import { query } from "../db";
import { isUserInMatch } from "../services/chatService";

export async function recalibrateMatch(req: Request, res: Response) {
  const { matchId, userId, gcashRef, paymentProofUrl } = req.body as {
    matchId: string;
    userId: string;
    gcashRef: string;
    paymentProofUrl: string;
  };
  if (!matchId || !userId || !gcashRef || !paymentProofUrl) {
    return res.status(400).json({ error: "matchId, userId, gcashRef, paymentProofUrl required." });
  }
  const inMatch = await isUserInMatch(matchId, userId);
  if (!inMatch) {
    return res.status(403).json({ error: "User not in match." });
  }

  await query(
    "INSERT INTO recalibration_requests(user_id, match_id, gcash_ref, payment_proof_url) VALUES ($1, $2, $3, $4)",
    [userId, matchId, gcashRef, paymentProofUrl]
  );
  await query("UPDATE matches SET active = false WHERE id = $1", [matchId]);
  await query("UPDATE users SET status = 'waiting' WHERE id = $1", [userId]);
  await query(
    "UPDATE user_profiles SET profile = jsonb_set(profile, '{paymentStatus}', '\"pending\"', true) WHERE user_id = $1",
    [userId]
  );

  return res.json({ status: "pending" });
}
