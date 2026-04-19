import { NextResponse } from "next/server";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { haversineDistance } from "@/lib/geo";
import tacoSpots from "@/tacoSpots.json";

const CLAIM_RADIUS_METERS = Number(process.env.CLAIM_RADIUS_METERS) || 50;
const isDev = process.env.DEV_MODE === "true";

const spotMap = new Map(
  (tacoSpots as { id: string; lat: number; lng: number }[]).map((s) => [s.id, s])
);

export async function POST(req: Request) {
  let uid: string;
  try {
    uid = await verifyAuthToken(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { huntId, spotId, lat, lng } = body as {
    huntId: string;
    spotId: string;
    lat: number;
    lng: number;
  };

  if (!huntId || !spotId) {
    return NextResponse.json({ error: "huntId and spotId are required" }, { status: 400 });
  }

  const spot = spotMap.get(spotId);
  if (!spot) {
    return NextResponse.json({ error: "Unknown spot" }, { status: 400 });
  }

  if (!isDev) {
    if (
      typeof lat !== "number" || typeof lng !== "number" ||
      !isFinite(lat) || !isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180
    ) {
      return NextResponse.json({ error: "Valid location required" }, { status: 400 });
    }
    const distance = haversineDistance(lat, lng, spot.lat, spot.lng);
    if (distance > CLAIM_RADIUS_METERS) {
      return NextResponse.json(
        { error: `Too far from stop (${Math.round(distance)}m away, max ${CLAIM_RADIUS_METERS}m)` },
        { status: 400 }
      );
    }
  }

  const db = getAdminDb();
  const huntRef = db.collection("hunts").doc(huntId);
  const participantRef = huntRef.collection("participants").doc(uid);

  try {
    await db.runTransaction(async (tx) => {
      const huntSnap = await tx.get(huntRef);
      if (!huntSnap.exists) throw new Error("Hunt not found");

      const participantSnap = await tx.get(participantRef);
      if (!participantSnap.exists) throw new Error("Participant not found — join first");

      const huntData = huntSnap.data() as { stops: string[] };
      const participantData = participantSnap.data() as { claimedSpots: string[] };

      const expectedIndex = participantData.claimedSpots.length;
      const spotIndex = huntData.stops.indexOf(spotId);

      if (spotIndex === -1) {
        throw new Error("Spot not in this hunt");
      }
      if (spotIndex !== expectedIndex) {
        throw new Error("Must claim stops in order");
      }
      if (participantData.claimedSpots.includes(spotId)) {
        throw new Error("Already claimed");
      }

      const isLastStop = spotIndex === huntData.stops.length - 1;

      tx.update(participantRef, {
        claimedSpots: FieldValue.arrayUnion(spotId),
        claimedCount: FieldValue.increment(1),
        ...(isLastStop ? { completedAt: FieldValue.serverTimestamp() } : {}),
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claim failed";
    if (message === "Hunt not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.startsWith("Participant not found")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
