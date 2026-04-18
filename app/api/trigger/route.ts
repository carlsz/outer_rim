import { v4 as uuidv4 } from "uuid";
import { getAdminDb, admin } from "@/lib/firebase-admin";
import { Hunt } from "@/lib/types";

export async function POST(req: Request) {
  const { huntId } = await req.json();
  if (!huntId) {
    return Response.json({ error: "huntId required" }, { status: 400 });
  }

  const db = getAdminDb();
  const huntRef = db.collection("hunts").doc(huntId);
  const snap = await huntRef.get();

  if (!snap.exists) {
    return Response.json({ error: "hunt not found" }, { status: 404 });
  }

  const hunt = { id: snap.id, ...snap.data() } as Hunt;

  if (hunt.status === "complete") {
    return Response.json({ error: "hunt is already complete" }, { status: 409 });
  }
  if (hunt.pendingStop !== null) {
    return Response.json({ error: "a navigator unlock is already pending" }, { status: 409 });
  }

  const pendingStop = hunt.unlockedCount;
  if (pendingStop >= hunt.stops.length) {
    return Response.json({ error: "all stops are already unlocked" }, { status: 409 });
  }

  const token = uuidv4();
  await huntRef.update({
    pendingStop,
    navigatorToken: token,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const origin = req.headers.get("origin") ?? "";
  const navigatorUrl = `${origin}/hunt/${huntId}/unlock?token=${token}`;

  return Response.json({ navigatorUrl });
}
