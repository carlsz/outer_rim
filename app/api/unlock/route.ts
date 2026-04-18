import { getAdminDb, admin } from "@/lib/firebase-admin";
import { Hunt } from "@/lib/types";

type Action = "approve" | "deny" | "force";

export async function POST(req: Request) {
  const { huntId, token, action } = (await req.json()) as {
    huntId: string;
    token?: string;
    action: Action;
  };

  if (!huntId || !action) {
    return Response.json({ error: "huntId and action required" }, { status: 400 });
  }

  // force-advance is dev-only
  if (action === "force" && process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const db = getAdminDb();
  const huntRef = db.collection("hunts").doc(huntId);
  const snap = await huntRef.get();

  if (!snap.exists) {
    return Response.json({ error: "hunt not found" }, { status: 404 });
  }

  const hunt = { id: snap.id, ...snap.data() } as Hunt;

  if (action === "approve" || action === "deny") {
    if (!token) {
      return Response.json({ error: "token required" }, { status: 400 });
    }
    if (token !== hunt.navigatorToken) {
      return Response.json({ error: "invalid token" }, { status: 401 });
    }
    if (hunt.pendingStop === null) {
      return Response.json({ error: "no pending unlock" }, { status: 409 });
    }
  }

  if (action === "approve" || action === "force") {
    const isLastStop = hunt.unlockedCount >= hunt.stops.length;
    await huntRef.update({
      unlockedCount: admin.firestore.FieldValue.increment(1),
      pendingStop: null,
      navigatorToken: null,
      ...(isLastStop ? { status: "complete" } : {}),
    });
    return Response.json({ ok: true });
  }

  if (action === "deny") {
    await huntRef.update({
      pendingStop: null,
      navigatorToken: null,
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "invalid action" }, { status: 400 });
}
