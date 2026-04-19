# Outer Rim // Post-Demo TODOs

Deferred from the May 5 build. These were explicitly out of scope for the demo.

## Platform expansion

- **Multi-hunt admin dashboard** — UI to create, list, and manage multiple hunt documents.
  Firestore schema already supports multiple hunts (`hunts/{id}`); this is purely a UI + auth layer.

- **Team race / tournament mode** — Two teams race across the hunt. Per-team scoring and leaderboard.
  Individual user leaderboard is now built (participants subcollection, real-time Leaderboard component,
  `/hunt/[id]/leaderboard` page, `/crawl/[id]/[userId]` per-hunter trail card). What remains for team mode
  is grouping hunters into teams, per-team score aggregation, and a team-vs-team leaderboard view.

## Mobile / offline

- **PWA manifest + service worker** — `manifest.json` + offline caching for the hunt map.
  Useful when lecture hall WiFi is unreliable. Not needed for the demo (presenter controls WiFi).

- **Real-time hunter GPS tracking** — Show each hunter's location on the map.
  Requires geolocation permission + Firestore writes per hunter. Significant privacy UX work.

## Infrastructure

- **Google Maps API key domain restriction** — Restrict the Maps key to the Cloud Run domain in GCP Console.
  Must happen before May 5 demo. Do NOT restrict during dev (blocks localhost).

- **Firestore rules + indexes deploy** — Deploy before Cloud Run goes live.
  Requires Firebase CLI (`npm install -g firebase-tools`), then:
  `firebase deploy --only firestore:rules,firestore:indexes`
  The composite index (claimedCount DESC + joinedAt ASC) was created via the console link from the error log but should be in the deploy for repeatability.
