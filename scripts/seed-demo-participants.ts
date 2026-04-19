/**
 * Seed demo participants for the May 5 classroom presentation.
 * Creates 4 named hunters at different progress stages so the leaderboard
 * is populated when the presenter opens the app for the audience.
 *
 * Run: npm run seed:demo
 *
 * Requires FIREBASE_ADMIN_CREDENTIAL in .env.local.
 */
import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

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
const HUNT_ID = "may5-2026";

const DEMO_HUNTERS = [
  { uid: "demo-hunter-1", name: "Boba Fett", claimedCount: 5 },
  { uid: "demo-hunter-2", name: "Rey Skywalker", claimedCount: 3 },
  { uid: "demo-hunter-3", name: "Grogu's Pilot", claimedCount: 1 },
  { uid: "demo-hunter-4", name: "Imperial Cadet", claimedCount: 0 },
];

async function seedDemoParticipants() {
  const huntSnap = await db.collection("hunts").doc(HUNT_ID).get();
  if (!huntSnap.exists) {
    console.error(`Hunt '${HUNT_ID}' not found. Run npm run seed first.`);
    process.exit(1);
  }

  const hunt = huntSnap.data() as { stops: string[] };
  const batch = db.batch();
  const now = admin.firestore.Timestamp.now();

  for (const hunter of DEMO_HUNTERS) {
    const claimedSpots = hunt.stops.slice(0, hunter.claimedCount);
    const isComplete = hunter.claimedCount >= hunt.stops.length;

    const ref = db
      .collection("hunts")
      .doc(HUNT_ID)
      .collection("participants")
      .doc(hunter.uid);

    batch.set(ref, {
      name: hunter.name,
      claimedSpots,
      claimedCount: hunter.claimedCount,
      joinedAt: now,
      ...(isComplete ? { completedAt: now } : {}),
    });

    console.log(`  ${hunter.name}: ${hunter.claimedCount} stops claimed`);
  }

  await batch.commit();
  console.log(`\n✓ Seeded ${DEMO_HUNTERS.length} demo participants for hunt '${HUNT_ID}'`);
  process.exit(0);
}

seedDemoParticipants().catch((err) => {
  console.error(err);
  process.exit(1);
});
