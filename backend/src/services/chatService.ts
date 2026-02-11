import { query } from "../db";

export async function isUserInMatch(matchId: string, userId: string) {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
    [matchId, userId]
  );
  return Number(result.rows[0]?.count ?? 0) > 0;
}

export async function getChatLimits(matchId: string, userId: string) {
  const result = await query<{ messages_sent: number }>(
    "SELECT messages_sent FROM chat_limits WHERE match_id = $1 AND user_id = $2",
    [matchId, userId]
  );
  return result.rows[0]?.messages_sent ?? null;
}

export async function incrementChatLimit(matchId: string, userId: string) {
  await query(
    "UPDATE chat_limits SET messages_sent = messages_sent + 1 WHERE match_id = $1 AND user_id = $2",
    [matchId, userId]
  );
}

export async function createChatMessage(matchId: string, senderId: string, message: string) {
  const result = await query<{ id: string }>(
    "INSERT INTO chat_messages(match_id, sender_id, message, char_count) VALUES ($1, $2, $3, $4) RETURNING id",
    [matchId, senderId, message, message.length]
  );
  return result.rows[0]?.id ?? null;
}

export async function listChatMessages(matchId: string) {
  const result = await query<{
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
  }>(
    "SELECT id, sender_id, message, created_at FROM chat_messages WHERE match_id = $1 ORDER BY created_at ASC",
    [matchId]
  );
  return result.rows.map((row: any) => ({
    id: row.id,
    senderId: row.sender_id,
    message: row.message,
    createdAt: row.created_at
  }));
}

export async function getRemainingLimits(matchId: string) {
  const result = await query<{ user_id: string; messages_sent: number }>(
    "SELECT user_id, messages_sent FROM chat_limits WHERE match_id = $1",
    [matchId]
  );
  return result.rows;
}
