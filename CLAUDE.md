# Outer Rim // Cantina Crawler

Star Wars-themed pub crawl app for San Luis Obispo. Live demo: Cal Poly SLO, May 5, 2026.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Google Maps JavaScript API (dark style)
- Cloud Firestore (cantinas, routes, checkpoints)
- satori (Node runtime) for OG image generation
- GitHub Actions → Artifact Registry → Cloud Run (min-instances=1)
- Claude API (Anthropic SDK) for menu normalizer

## Design Doc

Full architecture, Firestore schemas, demo flow, and required CI secrets:
`~/.gstack/projects/carlsz-outer_rim/carlsz-main-design-20260414-184957.md`

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
