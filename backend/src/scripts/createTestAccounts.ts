import { query } from "../db";

async function createTestAccounts() {
  try {
    console.log("🧪 Creating test accounts for chat debugging...\n");

    const user1Result = await query<{ id: string }>(
      "INSERT INTO users(alias, status) VALUES ($1, 'waiting') RETURNING id",
      ["TestUser1"]
    );
    const userId1 = user1Result.rows[0]?.id;
    console.log("✅ Created User 1:", userId1);

    const profile1 = {
      fullName: { first: "Test", last: "User", middle: "One" },
      dob: "2000-01-01",
      email: "testuser1@wvsu.edu.ph",
      college: "College of Arts and Sciences",
      course: "Computer Science",
      yearLevel: "3rd Year",
      alias: "TestUser1",
      gcashRef: "TEST001",
      paymentProofUrl: "https://example.com/proof1.jpg",
      participationMode: "full",
      sogiesc: {
        sexualOrientation: "Heterosexual",
        genderIdentity: "Cisgender",
        genderExpression: "Masculine",
        sexCharacteristics: "Male",
        pronouns: "He/Him"
      },
      personality: {
        sunSign: "Aries",
        mbti: "ENFP",
        socialBattery: "Extrovert"
      },
      loveLanguageReceive: ["Words of Affirmation", "Quality Time"],
      loveLanguageProvide: ["Acts of Service", "Physical Touch"],
      interests: ["Gaming", "Music", "Movies", "Sports", "Tech", "Books", "Anime", "Cooking"],
      preferred: {
        college: "Any",
        course: "Any",
        yearLevel: "Any",
        identity: "Any"
      },
      verificationStatus: "verified",
      paymentStatus: "verified"
    };

    await query("INSERT INTO user_profiles(user_id, profile) VALUES ($1, $2)", [
      userId1,
      profile1
    ]);
    console.log("✅ Created profile for User 1");

    const user2Result = await query<{ id: string }>(
      "INSERT INTO users(alias, status) VALUES ($1, 'waiting') RETURNING id",
      ["TestUser2"]
    );
    const userId2 = user2Result.rows[0]?.id;
    console.log("✅ Created User 2:", userId2);

    const profile2 = {
      fullName: { first: "Test", last: "User", middle: "Two" },
      dob: "2000-02-02",
      email: "testuser2@wvsu.edu.ph",
      college: "College of Arts and Sciences",
      course: "Information Technology",
      yearLevel: "3rd Year",
      alias: "TestUser2",
      gcashRef: "TEST002",
      paymentProofUrl: "https://example.com/proof2.jpg",
      participationMode: "full",
      sogiesc: {
        sexualOrientation: "Heterosexual",
        genderIdentity: "Cisgender",
        genderExpression: "Feminine",
        sexCharacteristics: "Female",
        pronouns: "She/Her"
      },
      personality: {
        sunSign: "Libra",
        mbti: "ISFJ",
        socialBattery: "Introvert"
      },
      loveLanguageReceive: ["Quality Time", "Acts of Service"],
      loveLanguageProvide: ["Words of Affirmation", "Gifts"],
      interests: ["Gaming", "Music", "Movies", "Sports", "Tech", "Books", "Anime", "Art"],
      preferred: {
        college: "Any",
        course: "Any",
        yearLevel: "Any",
        identity: "Any"
      },
      verificationStatus: "verified",
      paymentStatus: "verified"
    };

    await query("INSERT INTO user_profiles(user_id, profile) VALUES ($1, $2)", [
      userId2,
      profile2
    ]);
    console.log("✅ Created profile for User 2");

    const matchResult = await query<{ id: string }>(
      "INSERT INTO matches(user1_id, user2_id, compatibility_score, reasons) VALUES ($1, $2, $3, $4) RETURNING id",
      [userId1, userId2, 85, ["Shared interests", "Compatible personalities", "Love language overlap"]]
    );
    const matchId = matchResult.rows[0]?.id;
    console.log("✅ Created match:", matchId);

    await query("UPDATE users SET status = 'matched' WHERE id IN ($1, $2)", [
      userId1,
      userId2
    ]);
    console.log("✅ Updated user statuses to 'matched'");

    await query(
      "INSERT INTO chat_limits(user_id, match_id, messages_sent) VALUES ($1, $3, 0), ($2, $3, 0)",
      [userId1, userId2, matchId]
    );
    console.log("✅ Initialized chat limits");

    await query(
      "INSERT INTO consent(match_id, user_id, consent_chat, consent_reveal) VALUES ($1, $2, true, false), ($1, $3, true, false) ON CONFLICT (match_id, user_id) DO UPDATE SET consent_chat = true",
      [matchId, userId1, userId2]
    );
    console.log("✅ Set chat consent for both users");

    console.log("\n🎉 Test accounts created successfully!\n");
    console.log("📧 Test Account 1:");
    console.log("   Email: testuser1@wvsu.edu.ph");
    console.log("   User ID:", userId1);
    console.log("   Alias: TestUser1");
    console.log("\n📧 Test Account 2:");
    console.log("   Email: testuser2@wvsu.edu.ph");
    console.log("   User ID:", userId2);
    console.log("   Alias: TestUser2");
    console.log("\n💕 Match ID:", matchId);
    console.log("\n✨ You can now sign in with either account to test the chat!");
    console.log("   Note: You'll need to request OTP codes. Check backend logs for codes.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test accounts:", error);
    process.exit(1);
  }
}

createTestAccounts();
