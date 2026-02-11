# CALEBel System Deliverables

## 1) Database schema (tables + relationships)

```
USERS
- id (PK, UUID)
- alias (text, required)
- role (text, default 'student')
- status (text: pending | waiting | matched | ended)
- created_at (timestamp)

USER_PROFILES
- user_id (PK, FK -> USERS.id)
- profile (jsonb)  -- stores sensitive profile data securely

MATCHES
- id (PK, UUID)
- user1_id (FK -> USERS.id)
- user2_id (FK -> USERS.id)
- compatibility_score (int)
- reasons (text[])                -- top 3 reasons
- created_at (timestamp)

CONSENT
- match_id (FK -> MATCHES.id)
- user_id (FK -> USERS.id)
- consent_chat (bool)
- consent_reveal (bool)
- updated_at (timestamp)

CHAT_MESSAGES
- id (PK, UUID)
- match_id (FK -> MATCHES.id)
- sender_id (FK -> USERS.id)
- message (text)
- char_count (int)
- created_at (timestamp)

CHAT_LIMITS
- user_id (FK -> USERS.id)
- match_id (FK -> MATCHES.id)
- messages_sent (int, max 25)

RECALIBRATION_REQUESTS
- id (PK, UUID)
- user_id (FK -> USERS.id)
- match_id (FK -> MATCHES.id)
- gcash_ref (text)
- payment_proof_url (text)
- status (text: pending | verified | rejected)
- created_at (timestamp)
```

## 2) REST API endpoints (examples)

### POST /api/register
```
{
  "fullName": { "first": "Anna", "middle": "L", "last": "Reyes" },
  "dob": "2003-05-21",
  "email": "anna@wvsu.edu.ph",
  "college": "CICT",
  "course": "BSCS",
  "yearLevel": "2nd",
  "alias": "TheCaffeinatedTechy",
  "gcashRef": "123456",
  "paymentProofUrl": "https://...",
  "socialLink": "https://facebook.com/...",
  "participationMode": "full",
  "sogiesc": { ... },
  "personality": { ... },
  "loveLanguageReceive": ["Quality Time", "Words of Affirmation"],
  "loveLanguageProvide": ["Acts of Service", "Quality Time"],
  "interests": ["Academic: Research", "Music: OPM", "Lifestyle: Cafe"],
  "preferred": { "college": "CICT", "course": "", "yearLevel": "Any", "identity": "Everyone" },
  "agreeTerms": true
}
```
Response `201`
```
{ "userId": "uuid", "status": "pending" }
```

### POST /api/match
Triggers matching job (scheduled).
Response `200`
```
{ "matchedCount": 10 }
```

### GET /api/match/:userId
Response (waiting)
```
{ "status": "waiting" }
```
Response (matched)
```
{
  "status": "matched",
  "matchId": "uuid",
  "compatibilityScore": 86,
  "reasons": ["Shared interests", "Love language overlap", "Preference match"],
  "partnerReport": { ... }
}
```

### POST /api/consent/chat
```
{ "matchId": "uuid", "userId": "uuid", "consent": true }
```
Unlocks chat only if both consent.

### POST /api/chat/send
```
{ "matchId": "uuid", "senderId": "uuid", "message": "Hi there!" }
```
Validates 150 chars + 25 message limit + profanity filter.

### POST /api/recalibrate
```
{ "matchId": "uuid", "userId": "uuid", "gcashRef": "...", "paymentProofUrl": "..." }
```

## 3) Matching job flow

1. Select `USERS` where `status = waiting` and verified payment/email.
2. For each user, find candidates that:
   - share ≥ 3 interests
   - pass preference filters (department/course/year/identity)
3. Score candidates (soft weights):
   - MBTI group proximity
   - love language overlap
   - social battery compatibility
   - light astrology weight
4. Create `MATCHES`, set `status = matched`.
5. Send Connection Report email with top 3 reasons and summary.

## 4) Frontend routes and key components

Routes:
- `/` Landing
- `/register` Stepper hub
- `/register/step-1` … `/step-6`
- `/register/confirmation`
- `/match`
- `/match/cancelled`
- `/match/recalibrate`
- `/match/end`
- `/chat/[matchId]`
- `/reveal`

Key components:
- `LandingHero`, `StepShell`, `StepForm`, `MatchCard`, `ChatWindow`
- UI: `Button`, `Card`, `Badge`, `Progress`, `Alert`, `ChatBubble`, `Counter`

## 5) Tailwind theme tokens (Salmverse)

```
colors:
  wine: #850E35
  rose: #EE6983
  blush: #FFC4C4
  ivory: #FFF5E4
borderRadius:
  soft: 16px
  card: 20px
```

## 6) Implementation plan (MVP phases)

1. Registration + verification + payment upload
2. Matching job + Connection Report email
3. Consent gate YES/NO for chat
4. Chat with strict limits + profanity filter
5. Reveal / Recalibrate / End outcomes
