# Design System — Outer Rim // Taco Hunt

## Product Context
- **What this is:** A Star Wars-themed taco scavenger hunt app for San Luis Obispo
- **Who it's for:** Cal Poly SLO students and SLO locals; demoing to IS + Graphic Comm audience May 5, 2026
- **Space/industry:** Location-based adventure / event app
- **Project type:** Progressive web app (mobile-first, browser-based, no install required)

## Aesthetic Direction
- **Direction:** Retro-Futuristic / Industrial-Utilitarian
- **Decoration level:** Intentional — thin rule borders, subtle scanline texture, CRT glow on accents. No gradient blobs.
- **Mood:** Like accessing a mission terminal on a ship that's been repaired twice and still works. Cinematic, not whimsical. Lived-in, not sterile.
- **Reference:** Millennium Falcon cockpit controls. The analog-digital aesthetic of the original trilogy.

## Typography
- **Display/Hero:** Fraunces (variable serif) — mission titles, stop names, trail card headers. A serif says "artifact, document, briefing." Category differentiation.
- **Body/UI:** DM Sans — labels, instructions, stop card text. Clean, readable at small sizes on dark.
- **Data/Clues:** JetBrains Mono — AI-generated clues as terminal output with typewriter animation. Makes the reveal feel like decoded intelligence.
- **Loading:** Google Fonts CDN, `display=swap`
- **Scale:**
  - xs: 11px (labels, badges, terminal meta)
  - sm: 13px (secondary body)
  - base: 15-16px (body, stop names)
  - lg: 22-28px (UI headings)
  - xl: 42-52px (display, hero)

## Color
- **Approach:** Restrained — gold as primary accent, cyan for interactive only, neutrals carry the load
- **Background:** #0a0b0d — near-black with slight warmth (not pure black)
- **Surface:** #12151a — dark navy-slate for cards and panels
- **Surface Elevated:** #1c2028 — inputs, raised cards
- **Text:** #e8dfc8 — warm parchment (not pure white, easier on dark)
- **Text Muted:** #6b7280 — secondary labels
- **Accent Gold:** #c9a84c — primary CTA, active stop highlight, trail card. Cantina warmth + achievement.
- **Hologram Cyan:** #4db8c8 — interactive elements, clue terminal, active pin glow
- **Success/Unlock:** #4ade80
- **Error/Locked:** #ef4444
- **Borders:** rgba(232,223,200,0.08) default / rgba(232,223,200,0.16) strong
- **Dark mode:** This is dark-mode-only. No light mode. The Google Maps dark style requires it; commit fully.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — outdoor use, bright sun, generous touch targets
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)
- **Border radius:** 3px (badges/inputs) → 5px (stop cards) → 8px (panels) → 16px (modal/frames)

## Layout
- **Approach:** Hybrid — grid-disciplined for app shell, creative-editorial for clue reveal + trail card
- **Mobile-first:** Design for 390px viewport, scale up
- **Map:** Full-width, 220px height minimum, overlaps into stop list with gradient fade
- **Stop list:** Scrollable below map, cards with 8px gap
- **Max content width:** 480px centered (mobile app shell)
- **Trail card:** Full-bleed editorial layout for OG image generation via satori

## Motion
- **Approach:** Intentional — every animation earns its keep
- **Clue typewriter:** 40ms per character, ease-out — the hero moment
- **Pin drop:** 300ms spring(0.4) on unlock
- **Progress fill:** 400ms ease-out on stop completion
- **Active pulse:** 2s ease-in-out infinite on current stop card and map pin
- **Screen transitions:** 150ms fade-up 8px, ease-out
- **Terminal cursor:** 1s step-end blink
- **Easing defaults:** enter(ease-out) exit(ease-in) move(ease-in-out)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-14 | Fraunces serif for display | Category differentiation — all competitors use sans-serif for everything. A serif reads as artifact, document, mission briefing. |
| 2026-04-14 | Amber/gold (#c9a84c) as primary accent | Category uses teal/orange/green. Gold = cantina warmth + reward. Nobody else is there. |
| 2026-04-14 | JetBrains Mono for AI clue text | Clues are transmissions. Typewriter reveal with monospace is the product's hero moment. Keep clues short. |
| 2026-04-14 | Dark-mode-only (no light mode) | Google Maps dark style is already in the stack. Committing fully produces a coherent visual system rather than a half-dark compromise. |
| 2026-04-14 | Intentional decoration (scanlines, glow) | Subtle scanline texture + CRT glow anchor the retro-futurist aesthetic without becoming fan art. |
