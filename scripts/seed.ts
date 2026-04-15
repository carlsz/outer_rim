/**
 * Seed script: populates Firestore with tacoSpots and creates the initial hunt.
 * Run once: bun run seed  (or npx ts-node scripts/seed.ts)
 *
 * Requires FIREBASE_ADMIN_CREDENTIAL in .env.local (base64 service account JSON).
 */
import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env vars from .env.local
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {
  console.warn(".env.local not found — expecting env vars to be set externally.");
}

const credentialBase64 = process.env.FIREBASE_ADMIN_CREDENTIAL;
if (!credentialBase64) {
  console.error("FIREBASE_ADMIN_CREDENTIAL is not set.");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  Buffer.from(credentialBase64, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  const spotsRaw = readFileSync(resolve(process.cwd(), "tacoSpots.json"), "utf-8");
  const spots = JSON.parse(spotsRaw);

  // Validate no TODO coordinates
  const unverified = spots.filter((s: { lat: number; lng: number }) => s.lat === 0 || s.lng === 0);
  if (unverified.length > 0) {
    console.error(`❌ ${unverified.length} spot(s) still have lat/lng of 0. Verify coordinates first.`);
    process.exit(1);
  }

  console.log(`Seeding ${spots.length} taco spots...`);
  const batch = db.batch();

  for (const spot of spots) {
    const ref = db.collection("tacoSpots").doc(spot.id);
    batch.set(ref, spot);
  }

  await batch.commit();
  console.log("✓ tacoSpots seeded");

  // Create the initial hunt (Stop 1 unlocked, rest locked).
  // Guard: skip if the hunt already exists to avoid resetting an in-progress hunt.
  const stopIds = spots.map((s: { id: string }) => s.id);
  const huntRef = db.collection("hunts").doc("may5-2026");
  const existingHunt = await huntRef.get();
  if (existingHunt.exists) {
    console.log("⚠ Hunt 'may5-2026' already exists — skipping. Pass --force to overwrite.");
  } else {
    await huntRef.set({
      id: "may5-2026",
      stops: stopIds,
      unlockedCount: 1,
      pendingStop: null,
      navigatorToken: null,
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✓ Hunt 'may5-2026' created (Stop 1 unlocked)");
  }
  console.log("\nReady. Run the app and visit /admin/trigger to generate the navigator URL.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
