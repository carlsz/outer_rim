# OUTER RIM // TACO HUNT
Target Build Date: May 5, 2026 (Revenge of the 5th)<br/>
Status: Taco Scavenger Hunt App<br/>
Domain: [slotacohunt.com](https://slotacohunt.com)

## Brief
This app is a creative exploration of AI-native development, designed as a live demonstration for a talk I’m giving on May 5th at my alma mater, Cal Poly SLO. The experience ties together 2 different themes of [Cinco de Mayo](https://en.wikipedia.org/wiki/Cinco_de_Mayo) and [Revenge of the Fifth](https://en.wikipedia.org/wiki/Star_Wars_Day). By gamifying a local taco scavenger hunt through the lens of a Star Wars "Outer Rim" mission, the project serves as a practical testing ground for modern engineering workflows. It specifically showcases a production-ready CI/CD pipeline using GitHub Actions, containerized deployment to Google Cloud Run, and the integration of AI agents (like Claude and Garry Tan’s [gstack](https://github.com/garrytan/gstack)) to handle everything from automated riddle generation to UI audits, proving how developers can leverage these tools to rapidly build and iterate on interactive, real-world experiences.

## Key Features
+ Themed Scavenger Hunt: Players hunt for real-world taco spots in San Luis Obispo that have been given Star Wars-inspired aliases (e.g., local restaurants disguised as "cantinas").
+ Clue System: Uses a "Clue Generator" (powered by Claude/AI) to write riddle-style clues for each location. Players "decode transmissions" to reveal their next stop.
+ Location & Token Verification: Progress is tracked via proximity scans at physical locations. 
+ Interactive Map: A custom dark-themed Google Map that pins the active stop and expands/collapses for navigation
+ Sharable Trail Cards: Generates a shareable "proof of completion" (using satori) once a player finishes the "Kessel Run" of taco joints
+ Real-time Leaderboard: A real-time ranked list of "hunters" based on stops claimed

## Core Demo Loops
+ The Clue Generator: Claude writes a riddle-style clue for each taco stop based on its hint keywords, revealed after the player decodes the transmission.
+ The Decode Flow: Players tap "Decode Transmission" to trigger the clue typewriter; once complete, the stop identity scramble-reveals with a cyan flash.
+ The Trail Card: satori renders a shareable OG image listing completed stops — the proof you survived the outer rim.
+ The Navigator Unlock: Human-in-the-loop approval via a token-gated URL to reveal the next stop on the map.
+ The Map: Full-width dark-style Google Map with expand/collapse (tap ↗ to grow to 70vh), pinned to active stop.
+ The Leaderboard: Real-time ranked list of hunters by stops claimed, surfaced as a bottom sheet. Full-page view at `/hunt/[id]/leaderboard`.

## Technical Stack
+ Framework: React/Next.js (Tailwind CSS)
+ Data Source: tacoSpots.json (real SLO taco spots with Star Wars aliases)
+ Orchestration Layer: gstack / Claude Code
+ Verification Logic: Token-gated Navigator Unlock for revealing the next stop
+ Deployment: Cloud Run

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
