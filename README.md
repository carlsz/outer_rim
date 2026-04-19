# OUTER RIM // TACO HUNT
Target Build Date: May 5, 2026 (Revenge of the 5th)<br/>
Status: Taco Scavenger Hunt App<br/>
Domain: [slotacohunt.com](https://slotacohunt.com)

## Vision
Hunt down the best tacos in San Luis Obispo — each stop disguised as a Star Wars cantina. Scan a QR code to unlock your next clue, collect all stops, and earn a shareable trail card proving you made the Kessel Run of SLO taco joints.

## Technical Stack
+ Framework: React/Next.js (Tailwind CSS)
+ Data Source: tacoSpots.json (real SLO taco spots with Star Wars aliases)
+ Orchestration Layer: gstack / Claude Code
+ Verification Logic: Token-gated Navigator Unlock for revealing the next stop
+ Deployment: Cloud Run

## Core Demo Loops
+ The Clue Generator: Claude writes a riddle-style clue for each taco stop based on its hint keywords, revealed after the player decodes the transmission.
+ The Decode Flow: Players tap "Decode Transmission" to trigger the clue typewriter; once complete, the stop identity scramble-reveals with a cyan flash.
+ The Trail Card: satori renders a shareable OG image listing completed stops — the proof you survived the outer rim.
+ The Navigator Unlock: Human-in-the-loop approval via a token-gated URL to reveal the next stop on the map.
+ The Map: Full-width dark-style Google Map with expand/collapse (tap ↗ to grow to 70vh), pinned to active stop.
+ The Leaderboard: Real-time ranked list of hunters by stops claimed, surfaced as a bottom sheet. Full-page view at `/hunt/[id]/leaderboard`.

## Dev Setup

```bash
cp .env.local.example .env.local   # fill in all values
npm install
npm run seed    # seed Firestore with tacoSpots.json — requires FIREBASE_ADMIN_CREDENTIAL
npm run dev     # http://localhost:3000
```

**Required env vars** (see `.env.local.example`):
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `FIREBASE_ADMIN_CREDENTIAL` — base64-encoded service account JSON (seed script + admin trigger)
- `ANTHROPIC_API_KEY` — clue generator
- `NEXT_PUBLIC_DEV_MODE=true` — shows force-advance button in UI (omit in production)
- `DEV_MODE=true` — bypasses geo check server-side (omit in production)

## Agent Skills

Workflows are powered by [gstack](https://github.com/garrytan/gstack). Install once:

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

Key skills: `/review` (pre-push), `/ship` (PR + deploy), `/qa` (visual testing), `/investigate` (debug), `/design-review` (UI audit).
