import { Request, Response } from "express";
import { bothConsented, getMatchParticipants } from "../services/consentService";
import { query } from "../db";

export async function getReveal(req: Request, res: Response) {
  const { matchId } = req.params;
  const { userId } = req.query as { userId?: string };
  if (!matchId || !userId) {
    return res.status(400).json({ error: "matchId and userId required." });
  }

  // Check individual consent status
  const consentResult = await query<{ user_id: string; consent_reveal: boolean }>(
    "SELECT user_id, consent_reveal FROM consent WHERE match_id = $1",
    [matchId]
  );

  const userConsents = consentResult.rows;
  const currentUserConsented = userConsents.find(c => c.user_id === userId)?.consent_reveal || false;
  const partnerConsented = userConsents.find(c => c.user_id !== userId)?.consent_reveal || false;
  const bothRevealed = currentUserConsented && partnerConsented;

  // If both haven't revealed, return status information
  if (!bothRevealed) {
    return res.json({
      status: "pending",
      currentUserConsented,
      partnerConsented,
      message: currentUserConsented 
        ? "Waiting for your match to choose Reveal." 
        : partnerConsented
        ? "Please choose Reveal to see your match's identity."
        : "Reveal not confirmed by both users."
    });
  }

  // Both have revealed - proceed with reveal data
  const participants = await getMatchParticipants(matchId);
  if (!participants) {
    return res.status(404).json({ error: "Match not found." });
  }

  const partnerId =
    participants.user1_id === userId ? participants.user2_id : participants.user1_id;

  const profileResult = await query<{ profile: Record<string, any> }>(
    "SELECT profile FROM user_profiles WHERE user_id = $1",
    [partnerId]
  );
  const partnerProfile = profileResult.rows[0]?.profile;
  if (!partnerProfile) {
    return res.status(404).json({ error: "Partner not found." });
  }

  const isAnonymous = partnerProfile.participationMode === "anonymous";
  if (isAnonymous) {
    return res.json({
      status: "revealed",
      mode: "anonymous",
      alias: partnerProfile.alias,
      meetup: {
        time: "February 14, 10AM – 4PM",
        location: "CICT SC Booth, WVSU Main Campus"
      }
    });
  }

  return res.json({
    status: "revealed",
    mode: "full",
    name: partnerProfile.fullName,
    college: partnerProfile.college,
    course: partnerProfile.course,
    yearLevel: partnerProfile.yearLevel,
    socialLink: partnerProfile.socialLink
  });
}
