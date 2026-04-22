# Design System — Outer Rim // Taco Hunt

## Product Context
- **What this is:** A Star Wars Clone Wars-themed taco scavenger hunt app for San Luis Obispo
- **Who it's for:** Cal Poly SLO students and SLO locals; demoing to IS + Graphic Comm audience May 5, 2026
- **Space/industry:** Location-based adventure / event app
- **Project type:** Progressive web app (mobile-first, browser-based, no install required)

## Memorable Thing
> "I'm late to a briefing that already started."

Not wonder. Not excitement. Controlled urgency. The UI presents active mission data as if the system has been running and the player just connected. No welcome screen. No lobby.

## Aesthetic Direction
- **Direction:** Retro-Futurist / Republic Tactical Terminal
- **Decoration level:** Intentional — grid lines, subtle holographic glow on active elements, cyan scanline tint. No warm CRT nostalgia. No gold decoration.
- **Mood:** A stolen Republic military datapad broadcasting mid-operation. Every element is functional. The mission is already in progress.
- **Temperature shift:** Clone Wars era, not Original Trilogy. The Millennium Falcon cockpit becomes a Jedi war room holocron. Cool blue precision replaces scavenged warmth.

## Typography
- **Display / Mission:** Fraunces (variable serif) — mission stop names, trail card headers, hunt title. Used once per screen. The only warmth in the system — makes each name feel like a proper noun, not a style.
- **Tactical / System:** JetBrains Mono — owns the entire information layer: ALL labels, system status, coordinates, distances, clue text, timestamps, button copy, nav labels. If it's a data point → Mono. This is the voice of the terminal.
- **Body / Prose:** DM Sans — paragraph-length instructional text only. Onboarding, help modals, trail card description. Barely appears during the actual hunt.
- **Loading:** Google Fonts CDN, `display=swap`
- **Rules:**
  - All system labels: ALL CAPS + `letter-spacing: 0.2em` in JetBrains Mono
  - `font-variant-numeric: tabular-nums` everywhere distances or counts appear
  - No title case in the tactical layer
- **Scale:**
  - xs: 9–10px (system labels, badges, terminal meta)
  - sm: 11–12px (button copy, secondary data, clue text)
  - base: 13–15px (body, stop names secondary)
  - lg: 17–20px (stop names in Fraunces)
  - xl: 36–56px (display, hero)

## Color

### The Key Shift
The background moves from neutral near-black to deep navy-black. Cyan feels structural and native — not applied on top of a warm surface. Gold becomes rare and meaningful: earned, not decorative.

### Palette
- **Background (Void Blue):** `#04070f` — not pure black; pulled toward deep navy. Cyan feels native, not floating.
- **Surface (Tactical Dark):** `#060d1a` — cards, panels, stop cards
- **Surface Elevated:** `#0a1628` — inputs, raised elements, modals
- **Grid Structural:** `#1a3a4a` — border base color; the skeleton of the UI reads cyan, not warm
- **Text (Holo White):** `#d4ecf0` — slightly blue-tinted; not stark white
- **Text Muted (Faded Signal):** `#5a8a9a` — secondary labels, metadata, addresses
- **Hologram Cyan:** `#4db8c8` — PRIMARY accent. Labels, active states, borders, CTAs, map pins, interactive elements.
- **Signal Blue:** `#7dd4e0` — hover/press states, glow amplification, selected elements, pulsing rings
- **Republic Gold:** `#c9a84c` — ACHIEVEMENT ONLY. Appears exactly 3× per session: stop claimed, hunt complete, trail card earned. Nowhere else. Not labels, not nav, not buttons.
- **Imperial Red:** `#c84d4d` — locked stops, failed geo-checks, error states
- **Borders:**
  - Default: `rgba(77, 184, 200, 0.12)`
  - Strong: `rgba(77, 184, 200, 0.25)`
  - Active/focus: `var(--accent-cyan)` at full opacity
- **Dark mode:** Dark-mode only. No light mode. Google Maps dark style requires it; commit fully.

### Gold Discipline
Gold is not a theme. Gold is a reward signal. The moment it appears — stop claimed, hunt complete — it should feel earned. Scarcity makes it land. Audit the codebase: remove gold from any use that isn't a direct player achievement.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — outdoor use, bright sun, generous touch targets (min 44×44px)
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)
- **Border radius:** 3px (badges/inputs/buttons) → 5px (stop cards) → 8px (panels) → 16px (modal/frames)

## Layout
- **Approach:** Hybrid — grid-disciplined for app shell, editorial for clue reveal + trail card
- **Mobile-first:** Design for 390px viewport, scale up
- **Map:** Full-width, 220px height minimum; compressed to ~120px in default view with expand toggle
- **Stop list:** Scrollable below map, cards with 8px gap
- **Max content width:** 480px centered (mobile app shell)
- **Trail card:** Full-bleed editorial layout for OG image generation via satori

## Motion
- **Approach:** Intentional — every animation earns its keep
- **Clue typewriter:** 40ms per character, ease-out — the hero moment of the product
- **Pin drop:** 300ms spring(0.4) on unlock
- **Active pin pulse:** 2s ease-in-out infinite — cyan glow breathing
- **Screen transitions:** 150ms fade-up 8px, ease-out
- **Terminal cursor:** 1s step-end blink
- **Border fade (landing terminal):** 400ms ease-out — gray to cyan as CTA appears
- **Easing defaults:** enter(ease-out) exit(ease-in) move(ease-in-out)

## Landing Page

The landing page is the first frame of the transmission. Sequential animation, ~4s before CTA is interactive. Intentional.

### Boot Sequence (0ms → 1400ms)
Three lines in JetBrains Mono, uppercase, sequential:
- `⟶ ESTABLISHING SECURE CHANNEL...` (gold)
- `⟶ SIGNAL ACQUIRED` (gold)
- `⟶ CHANNEL SECURE · OUTER RIM DIVISION` (cyan)

### Hero Reveal (~1700ms → 2500ms)
- "Outer Rim" scramble-reveals via `lib/scramble.ts`
- On title complete: brief cyan flash, then return to `var(--text)`
- Subtitle typewriters in at 40ms/char in Fraunces italic gold

### Mission Brief Terminal (~2700ms → 3200ms)
- Border starts at `var(--border-strong)` (warm gray), fades to `var(--accent-cyan)` as CTA appears
- Header: "MISSION PARAMETERS" in cyan
- Body: DM Sans, text-muted

### CTA (~3700ms)
- Copy: "⟶ INITIATE SEQUENCE"
- Style: transparent bg, `1px solid var(--accent-cyan)`, cyan text, JetBrains Mono

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-14 | Fraunces serif for display | Category differentiation — all competitors use sans-serif. A serif reads as artifact, mission briefing. |
| 2026-04-14 | Amber/gold (#c9a84c) as primary accent | Category uses teal/orange/green. Gold = cantina warmth + reward. |
| 2026-04-14 | JetBrains Mono for AI clue text | Clues are transmissions. Typewriter reveal with monospace is the product's hero moment. |
| 2026-04-14 | Dark-mode-only | Google Maps dark style + coherent visual system. No half-dark compromise. |
| 2026-04-14 | Intentional decoration (scanlines, glow) | Subtle scanline texture + CRT glow anchor the retro-futurist aesthetic. |
| 2026-04-19 | Mission terminal boot sequence on landing | Landing page is the first frame of the transmission. 1.4s boot stall is intentional. |
| 2026-04-19 | "INITIATE SEQUENCE" CTA copy | Coherence: entire landing is framed as receiving a mission. "Begin the Hunt" breaks the frame. |
| 2026-04-19 | Mission brief terminal replaces prose | Parameters > paragraph. Terminal format puts users inside the world. |
| 2026-04-21 | Shift background to Void Blue (#04070f) | Clone Wars pivot. Deep navy-black makes cyan feel structural and native, not applied. |
| 2026-04-21 | Gold discipline — achievement only | Gold appears 3× per session: stop claimed, hunt complete, trail card. Scarcity makes it feel earned. |
| 2026-04-21 | JetBrains Mono expands to own tactical layer | One voice in the field. All labels, distances, status in Mono. Reduces font-switching noise during play. |
| 2026-04-21 | Borders shift to cyan-tinted (rgba 77,184,200) | Structural skeleton reads cool blue. Completes the temperature shift from warm OT to cool Clone Wars. |
| 2026-04-21 | Signal Blue (#7dd4e0) added for hover/glow states | Hover and press states need a lighter cyan variant to feel responsive without blowing out the primary accent. |
| 2026-04-21 | Fraunces demoted to mission title only | The only warmth in the system — used once per screen so it reads as a proper noun, not a style choice. |
