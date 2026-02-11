import { query } from "../db";

/**
 * Script to manually match two users by email
 * Run with: npx ts-node src/scripts/matchUsers.ts
 */

const EMAIL1 = "adatamia.misplacido@wvsu.edu.ph";
const EMAIL2 = "james.remegio@wvsu.edu.ph";

async function matchUsers() {
  try {
    console.log("🔍 Looking for users...\n");

    // Find user 1
    const user1Result = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      [EMAIL1]
    );

    if (user1Result.rows.length === 0) {
      console.error(`❌ User not found: ${EMAIL1}`);
      console.log("   Please register this user first.");
      process.exit(1);
    }

    const userId1 = user1Result.rows[0].user_id;
    const profile1 = user1Result.rows[0].profile;
    console.log(`✅ Found User 1:`);
    console.log(`   Email: ${EMAIL1}`);
    console.log(`   User ID: ${userId1}`);
    console.log(`   Alias: ${profile1?.alias || "N/A"}\n`);

    // Find user 2
    const user2Result = await query<{ user_id: string; profile: any }>(
      "SELECT user_id, profile FROM user_profiles WHERE profile->>'email' = $1",
      [EMAIL2]
    );

    if (user2Result.rows.length === 0) {
      console.error(`❌ User not found: ${EMAIL2}`);
      console.log("   Please register this user first.");
      process.exit(1);
    }

    const userId2 = user2Result.rows[0].user_id;
    const profile2 = user2Result.rows[0].profile;
    console.log(`✅ Found User 2:`);
    console.log(`   Email: ${EMAIL2}`);
    console.log(`   User ID: ${userId2}`);
    console.log(`   Alias: ${profile2?.alias || "N/A"}\n`);

    // Check if they're already matched
    const existingMatch = await query<{ id: string }>(
      "SELECT id FROM matches WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) LIMIT 1",
      [userId1, userId2]
    );

    if (existingMatch.rows.length > 0) {
      console.log(`⚠️  These users are already matched!`);
      console.log(`   Match ID: ${existingMatch.rows[0].id}\n`);
      process.exit(0);
    }

    // Create match
    console.log("💕 Creating match...\n");
    const matchResult = await query<{ id: string }>(
      "INSERT INTO matches(user1_id, user2_id, compatibility_score, reasons) VALUES ($1, $2, $3, $4) RETURNING id",
      [userId1, userId2, 90, ["Manual match", "Both users requested", "Compatible profiles"]]
    );
    const matchId = matchResult.rows[0]?.id;
    console.log(`✅ Match created: ${matchId}\n`);

    // Update user statuses
    await query("UPDATE users SET status = 'matched' WHERE id IN ($1, $2)", [
      userId1,
      userId2
    ]);
    console.log("✅ User statuses updated to 'matched'\n");

    // Initialize chat limits
    await query(
      "INSERT INTO chat_limits(user_id, match_id, messages_sent) VALUES ($1, $3, 0), ($2, $3, 0) ON CONFLICT DO NOTHING",
      [userId1, userId2, matchId]
    );
    console.log("✅ Chat limits initialized\n");

    // Set consent for chat (both users consent)
    await query(
      "INSERT INTO consent(match_id, user_id, consent_chat, consent_reveal) VALUES ($1, $2, true, false), ($1, $3, true, false) ON CONFLICT (match_id, user_id) DO UPDATE SET consent_chat = true",
      [matchId, userId1, userId2]
    );
    console.log("✅ Chat consent set for both users\n");

    console.log("========================================");
    console.log("🎉 MATCH CREATED SUCCESSFULLY!");
    console.log("========================================\n");
    console.log(`Match ID: ${matchId}`);
    console.log(`User 1: ${EMAIL1} (${userId1})`);
    console.log(`User 2: ${EMAIL2} (${userId2})`);
    console.log(`\nBoth users can now:`);
    console.log(`  ✅ Sign in and go to /chat`);
    console.log(`  ✅ Start chatting immediately`);
    console.log(`  ✅ See each other's messages\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating match:", error);
    process.exit(1);
  }
}

matchUsers();
