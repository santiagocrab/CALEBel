import { Request, Response } from "express";
import { matchWaitingUsers, getMatchByUser } from "../services/matchService";

export async function runMatching(_req: Request, res: Response) {
  const matchedCount = await matchWaitingUsers();
  return res.json({ matchedCount });
}

export async function getMatchForUser(req: Request, res: Response) {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "User ID required." });
  }
  
  console.log(`\n🔍 Fetching match for user: ${userId}`);
  const match = await getMatchByUser(userId);
  
  if (!match) {
    console.log(`   ❌ No match found for user ${userId}`);
    return res.json({ status: "waiting" });
  }
  
  console.log(`   ✅ Match found!`);
  console.log(`   Match ID: ${match.matchId}`);
  console.log(`   Compatibility: ${match.compatibilityScore}%`);
  console.log(`   Partner alias: ${match.partnerProfile?.alias || "Unknown"}`);
  console.log(`   Partner profile exists: ${!!match.partnerProfile}`);
  
  return res.json({
    status: "matched",
    matchId: match.matchId,
    compatibilityScore: match.compatibilityScore,
    reasons: match.reasons,
    partner: match.partnerProfile || {}
  });
}
