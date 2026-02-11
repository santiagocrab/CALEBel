# CALEBel Website Summary

## Current Status
The frontend has been swapped to the GitHub Vite/React UI and wired to the existing backend REST API. Core flows (register → match → consent → chat → reveal) are connected to backend endpoints. Postgres + backend are running locally.

## What’s Implemented

### Frontend (Vite React)
- **Landing / How It Works / Register / Match / Chat / Post‑Chat / Reveal**
- Registration stepper with **required-field validation** per section
- Match result screen uses backend data and **consent YES/NO**
- Chat chamber pulls/sends messages via API with limits
- Post‑chat decision triggers reveal consent API

### Backend (Node + Express)
- Registration endpoint with full profile payload
- Matching job with constraints + scoring, **reasons returned**
- Consent endpoints: chat + reveal
- Chat endpoints with strict limits and basic profanity filter
- Email integration (SMTP) for match report + mutual reveal

## Key Routes
Frontend pages (React Router):
- `/` Landing
- `/how-it-works`
- `/register`
- `/match`
- `/chat`
- `/post-chat`
- `/reveal`

Backend endpoints:
- `POST /api/register`
- `POST /api/match` (admin/scheduled)
- `GET /api/match/:userId`
- `POST /api/match/consent/chat`
- `POST /api/match/consent/reveal`
- `POST /api/chat/send`
- `GET /api/chat/:matchId`

## Local Dev Setup
### Frontend (Vite)
```
cd frontend
set VITE_API_BASE_URL=http://localhost:4000
npm run dev
```
Runs at `http://localhost:3005` (set in `frontend/vite.config.ts`).

### Backend
```
cd backend
set DATABASE_URL=postgres://calebel:calebel@localhost:5432/calebel
set CORS_ORIGINS=http://localhost:3005
npm run db:migrate
npm run dev
```
Runs at `http://localhost:4000`.

### Postgres
```
docker compose up -d
```

## What’s Next to Build

### 1) File upload handling (required)
- Proof of payment + recalibration uploads are **placeholder URLs**
- Implement image upload storage (local or S3) and validation

### 2) Email verification / OTP
- Needed to verify WVSU emails before status becomes “waiting”

### 3) Consent gate logic in UI
- Only unlock chat when both users consent
- If one declines, show Cancelled screen + recalibrate/end choices

### 4) Recalibration flow
- Backend: create `/api/recalibrate` endpoint
- Frontend: add form for PHP 20 proof upload

### 5) Reveal result screen
- Pull actual reveal data (full disclosure vs anonymous)
- Use backend response to show identity or meetup instructions

### 6) Admin matching trigger
- Scheduler or manual job trigger for `/api/match`

## Data / Session Handling
The frontend currently stores:
- `calebelUserId` in localStorage after registration
- `calebelMatchId` in localStorage after match fetch

You may want to replace this with proper auth/session logic later.

## Notes / Constraints
- Chat limits enforced: **25 messages/user**, **150 chars/message**
- Profanity filter: simple blocked word list (backend)
- Matching constraints: >= 3 shared interests + preference filters

