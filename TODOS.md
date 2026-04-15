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

## UX polish (post-demo)

- **Stop card tap-to-expand** — Stop cards are currently static display units (stop number, name, address, spice rating, clue). Post-demo, hunters will want to tap a stop to see full details inline (expanded address, clue text, link to Google Maps directions). Cards should expand/collapse. Currently no tap behavior is specified — engineers should treat cards as non-interactive in the demo build.
  **Why:** Static cards are fine for a demo where the presenter controls the flow. For a real hunt, users will tap cards expecting interaction. The absence of behavior reads as a bug.
  **Depends on:** Hunt page shipped.

## Infrastructure

- **Google Maps API key domain restriction** — Restrict the Maps key to the Cloud Run domain in GCP Console.
  Must happen before May 5 demo. Do NOT restrict during dev (blocks localhost).

- **Firestore rules deploy** — Deploy `firestore.rules` before Cloud Run goes live.
  Currently the rules file exists but must be deployed via `firebase deploy --only firestore:rules`.
