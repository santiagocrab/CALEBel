# CALEBel UI/UX Style Guide

This document is a design blueprint for a premium, university-run Valentine experience. It balances warmth with clarity, romance with restraint, and fun with trust.

## 1) World-class UI/UX style guide

### Brand tone
- Premium, elegant, emotionally warm.
- Playful but respectful; never childish.
- Minimalist, with one primary action per screen.

### Color system (Salmverse)
Use the Salmverse palette with strict intent:
- `Wine Rose` #850E35 — base background.
- `Rose Pink` #EE6983 — primary CTAs and emotion.
- `Blush Pink` #FFC4C4 — dividers, accents, soft emphasis.
- `Ivory Cream` #FFF5E4 — cards and surfaces.

### Typography
- **Headings**: Playfair Display — elegant, academic, romantic.
- **Body**: Inter — clean, highly readable.
- **System text**: JetBrains Mono — counters, IDs only.

### Layout & spacing
- Mobile-first with kiosk-friendly spacing.
- Card radius: 16–20px.
- Generous negative space.
- Content width: 960–1120px for main panels.

### Motion
- Subtle fade + slide on entry.
- Soft glow on primary actions.
- Microfeedback on hover and focus.
- No bouncing, no heavy effects.

## 2) Page-by-page layout breakdown

### Landing Page
**Goal**: Build desire and trust.
- Hero with short, emotional headline.
- Primary CTA: “Find Your Match”.
- Secondary CTA: “How It Works”.
- Thin gold separators and soft gradient background.
- Three “trust pillars” cards: verification, matching logic, private chat.

### Registration Flow (Stepper)
**Goal**: Make answering questions feel effortless.
- One primary question per step.
- Progress indicator top-right.
- Large tap targets.
- Microcopy that feels human.
- Clear “Continue” always visible.

### Match / Waiting
**Goal**: Anticipation, not boredom.
- Minimal “Matching…” animation with soft dots.
- Reassuring copy.
- When matched: emotional highlight + single CTA “Start Chat”.

### Chat
**Goal**: Intentional, calm conversation.
- Clean bubbles, soft differentiation.
- Counters for messages and characters.
- Gentle warning near limits.
- End-state card: “This conversation has reached its limit…”

## 3) Component design rationale

- **Buttons**: Primary (rose) for focus, secondary (gold outline) for alternatives, ghost for low priority. Ensures one primary action.
- **Cards**: Rounded, soft borders with subtle elevation for calm depth.
- **Progress**: Reassuring rather than urgent; simple gold label + rose fill.
- **Badges**: Small context labels for status and metadata.
- **Alerts**: Soft, non-alarming tone to keep experience safe.
- **Chat bubbles**: Neutral and warm; “me” side subtly tinted.
- **Counters**: JetBrains Mono for precise, system-like clarity.

## 4) Tailwind theme configuration

```
colors:
  midnight: #850E35
  champagne: #FFC4C4
  rose: #EE6983
  ivory: #FFF5E4
borderRadius:
  soft: 16px
  card: 20px
```

## 5) UX rationale

- **Emotion-first**: Warm palette, romantic serif headings, calm copy to reduce anxiety.
- **Extreme simplicity**: One primary action per screen, linear flow, clear CTA.
- **Delightful interactions**: Subtle motion reinforces progress and rewards interaction.
- **Trust & safety**: Verified email, explicit privacy choices, no pressure language.

## 6) Accessibility & usability

- High contrast text on midnight background.
- Large tap targets and spacing for touch.
- All actions accessible via keyboard.
- Clear hierarchy and readable typography.
- Inclusive SOGIE-SC options with “Prefer not to say”.
