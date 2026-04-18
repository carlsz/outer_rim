# Outer Rim // Post-Demo TODOs

Deferred from the May 5 build. These were explicitly out of scope for the demo.

## Platform expansion

- **Multi-hunt admin dashboard** — UI to create, list, and manage multiple hunt documents.
  Firestore schema already supports multiple hunts (`hunts/{id}`); this is purely a UI + auth layer.

- **Team race / tournament mode** — Two teams race to unlock all stops. Live leaderboard.
  Requires per-team hunt docs, score calculation, and a leaderboard page. Full Approach C from the design doc.

## Mobile / offline

- **PWA manifest + service worker** — `manifest.json` + offline caching for the hunt map.
  Useful when lecture hall WiFi is unreliable. Not needed for the demo (presenter controls WiFi).

- **Real-time hunter GPS tracking** — Show each hunter's location on the map.
  Requires geolocation permission + Firestore writes per hunter. Significant privacy UX work.

## Infrastructure

- **Google Maps API key domain restriction** — Restrict the Maps key to the Cloud Run domain in GCP Console.
  Must happen before May 5 demo. Do NOT restrict during dev (blocks localhost).

- **Firestore rules deploy** — Deploy `firestore.rules` before Cloud Run goes live.
  Currently the rules file exists but must be deployed via `firebase deploy --only firestore:rules`.
