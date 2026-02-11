import { query } from "../db";

export async function upsertConsentChat(matchId: string, userId: string, consent: boolean) {
  await query(
    "INSERT INTO consent(match_id, user_id, consent_chat, consent_reveal) VALUES ($1, $2, $3, false) ON CONFLICT (match_id, user_id) DO UPDATE SET consent_chat = $3, updated_at = NOW()",
    [matchId, userId, consent]
  );
}

export async function upsertConsentReveal(matchId: string, userId: string, consent: boolean) {
  await query(
    "INSERT INTO consent(match_id, user_id, consent_chat, consent_reveal) VALUES ($1, $2, false, $3) ON CONFLICT (match_id, user_id) DO UPDATE SET consent_reveal = $3, updated_at = NOW()",
    [matchId, userId, consent]
  );
}

export async function bothConsented(matchId: string, field: "consent_chat" | "consent_reveal") {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM consent WHERE match_id = $1 AND ${field} = true`,
    [matchId]
  );
  return Number(result.rows[0]?.count ?? 0) >= 2;
}

export async function getMatchParticipants(matchId: string) {
  const result = await query<{ user1_id: string; user2_id: string }>(
    "SELECT user1_id, user2_id FROM matches WHERE id = $1",
    [matchId]
  );
  return result.rows[0] ?? null;
}
