import { NextResponse } from "next/server";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  let uid: string;
  try {
    uid = await verifyAuthToken(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { huntId, name } = body as { huntId: string; name: string };

  if (!huntId || !name?.trim()) {
    return NextResponse.json({ error: "huntId and name are required" }, { status: 400 });
  }

  const db = getAdminDb();
  const huntRef = db.collection("hunts").doc(huntId);
  const huntSnap = await huntRef.get();
  if (!huntSnap.exists) {
    return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
  }

  const participantRef = huntRef.collection("participants").doc(uid);
  const snap = await participantRef.get();
  if (snap.exists) {
    return NextResponse.json({ uid });
  }

  await participantRef.set({
    name: name.trim(),
    claimedSpots: [],
    claimedCount: 0,
    joinedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ uid });
}
