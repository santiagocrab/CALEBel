# CALEBel: The Search for your Ka-Label

This document delivers the requested system blueprint for CALEBel: a controlled, university-run matchmaking + chat experience for the Taga-West community.

## 1. System architecture diagram (conceptual)

```
Users (Web)
  |
  | HTTPS (REST + polling)
  v
Next.js App Router (Vercel)
  |
  | JSON REST
  v
Backend API (Node.js or Spring Boot) on Render
  |
  | SQL
  v
PostgreSQL (Render or managed)
```

## 2. Algorithm pseudocode

```
INPUT: registered users with profiles, status = "waiting"
OUTPUT: matches with >= 3 shared interests and preference alignment

function buildInterestSet(user):
  return set of selected vibe categories + specified sub-interests

function compatibilityScore(u, v):
  sharedInterests = intersection(buildInterestSet(u), buildInterestSet(v))
  if size(sharedInterests) < 3: return 0

  // Preference filters (must pass)
  if not matchesPreferredCollege(u, v): return 0
  if not matchesPreferredCourse(u, v): return 0
  if not matchesPreferredYear(u, v): return 0
  if not matchesPreferredIdentity(u, v): return 0

  // Weighted scoring (simple, avoid overengineering)
  score = 0
  score += 40 * normalize(size(sharedInterests), 3, 8)
  score += 20 if u.social_battery == v.social_battery else 5
  score += 20 if u.mbti == v.mbti else 5
  score += 10 if u.sun_sign == v.sun_sign else 3
  score += 10 if u.gender_expression == v.gender_expression else 3
  return score

function matchUsers(waitingUsers):
  matches = []
  used = set()

  for each user u in waitingUsers:
    if u.id in used: continue
    best = null
    bestScore = 0
    for each user v in waitingUsers where v.id != u.id and v.id not in used:
      score = compatibilityScore(u, v)
      if score > bestScore:
        bestScore = score
        best = v
    if best != null and bestScore > 0:
      matches.append((u, best, bestScore))
      used.add(u.id)
      used.add(best.id)
  return matches
```

## 3. Database schema (normalized)

```
USERS
- id (PK, UUID)
- alias (text, nullable)
- role (text, default 'student')
- schedule (text, nullable)          -- optional profile field
- energy (text, nullable)            -- optional profile field
- collaboration (text, nullable)     -- optional profile field
- intent (text, nullable)            -- optional profile field
- status (text, enum: waiting|matched)
- created_at (timestamp)

MATCHES
- id (PK, UUID)
- user1_id (FK -> USERS.id)
- user2_id (FK -> USERS.id)
- compatibility_score (int)
- created_at (timestamp)

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

Indexes:
- USERS(status)
- MATCHES(user1_id), MATCHES(user2_id)
- CHAT_MESSAGES(match_id, created_at)
- CHAT_LIMITS(user_id, match_id)
```

## 4. API contract definitions

Base URL: `/api`

### POST /api/register
Request (JSON)
```
{
  "fullName": "First M. Last",
  "dob": "2003-05-21",
  "email": "name@wvsu.edu.ph",
  "college": "CICT",
  "course": "BSCS",
  "yearLevel": "1st",
  "gcashRef": "1234567890",
  "paymentProofUrl": "https://...",
  "socialLink": "https://facebook.com/...",
  "participationMode": "full|anonymous",
  "alias": "TheCaffeinatedTechy",
  "sogiesc": {
    "sexualOrientation": "Pansexual",
    "genderIdentity": "Cisgender - Woman",
    "genderExpression": "Feminine",
    "sexCharacteristics": "Female",
    "pronouns": "she/her"
  },
  "personality": {
    "sunSign": "Sagittarius",
    "mbti": "INFP",
    "socialBattery": "Introvert"
  },
  "interests": [
    "Hobbyist: Literature",
    "Academic: Research",
    "Music: Rock",
    "Advocacy: Community Service"
  ],
  "preferred": {
    "college": "CICT",
    "course": "BSCS",
    "yearLevel": "Any",
    "identity": "Woman"
  },
  "agreeTerms": true
}
```
Response 201
```
{ "userId": "uuid", "status": "waiting" }
```

### POST /api/match
Triggers matching job (admin-only or scheduled).
Response 200
```
{ "matchedCount": 12 }
```

### GET /api/match/:userId
Response 200 (waiting)
```
{ "status": "waiting" }
```
Response 200 (matched)
```
{
  "status": "matched",
  "matchId": "uuid",
  "compatibilityScore": 82,
  "partner": {
    "displayName": "Maria J. Dela Cruz",
    "college": "CICT",
    "course": "BSCS",
    "yearLevel": "1st",
    "sogiesc": { ... },
    "personality": { ... },
    "interests": [ ... ],
    "socialLink": "https://..."
  }
}
```

### POST /api/chat/send
Request
```
{ "matchId": "uuid", "senderId": "uuid", "message": "Hi there!" }
```
Backend validation:
- user is part of the match
- message length <= 150
- user message count < 25
- match exists and locked
Response 201
```
{ "messageId": "uuid", "remaining": 24 }
```

### GET /api/chat/:matchId
Response 200
```
{
  "matchId": "uuid",
  "messages": [
    { "id": "uuid", "senderId": "uuid", "message": "...", "createdAt": "..." }
  ],
  "limits": {
    "user1Remaining": 12,
    "user2Remaining": 8
  }
}
```

## 5. Frontend folder structure (Next.js App Router)

```
app/
  layout.tsx
  page.tsx                       -- Landing
  register/
    page.tsx                     -- Step-by-step registration
  match/
    page.tsx                     -- Match status
  chat/
    [matchId]/
      page.tsx                   -- Chat UI
  api/                           -- Next.js route handlers (optional proxy)
components/
  LandingHero.tsx
  StepForm.tsx
  MatchCard.tsx
  ChatWindow.tsx
  MessageCounter.tsx
  SystemMessage.tsx
lib/
  api.ts                         -- REST client
  validators.ts
  constants.ts                   -- palette + limits
styles/
  globals.css
public/
  logo.svg
```

## 6. Backend folder structure

Node.js (Express):
```
src/
  app.ts
  routes/
    register.ts
    match.ts
    chat.ts
  controllers/
    registerController.ts
    matchController.ts
    chatController.ts
  services/
    matchService.ts
    chatService.ts
  middleware/
    auth.ts
    rateLimit.ts
    validate.ts
  db/
    index.ts
    migrations/
    seeds/
  utils/
    logger.ts
```

Spring Boot:
```
src/main/java/edu/wvsu/calebel/
  CalebelApplication.java
  controller/
  service/
  repository/
  model/
  dto/
  config/
src/main/resources/
  application.yml
  db/migration/
```

## 7. Deployment notes (Vercel + Render)

- Vercel: deploy Next.js app; set `NEXT_PUBLIC_API_BASE_URL`.
- Render: deploy backend; set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`.
- Postgres: Render managed DB or external; run migrations on deploy.
- Enable HTTPS only; allow CORS from Vercel domain.
- Polling for match status: 10–30s interval, stop when matched.

## 8. Security and abuse-prevention considerations

- Enforce `@wvsu.edu.ph` at backend; do not rely on frontend validation.
- Verify payment proof server-side before enabling `status=waiting`.
- Match locking: once matched, both users cannot be re-matched.
- Message limits: 25 per user per match; reject overage.
- Message length: 150 chars max; reject at API.
- No edit/delete endpoints; messages are append-only.
- Protect chat routes: sender must be part of match.
- Rate-limit `/api/chat/send` per user to prevent bursts.
- Store minimal PII; anonymize when `participationMode=anonymous`.

## 9. Local development steps

1) Start Postgres
```
docker compose up -d
```

2) Configure environment
- Backend: set `PORT`, `DATABASE_URL`, `CORS_ORIGINS`
- Frontend: set `NEXT_PUBLIC_API_BASE_URL`
Reference examples in `backend/config.example.json` and `frontend/config.example.json`.

3) Run migrations
```
cd backend
npm run db:migrate
```

4) Start backend + frontend
```
cd backend
npm run dev
```
```
cd frontend
npm run dev
```
```
