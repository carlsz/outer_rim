import Anthropic from "@anthropic-ai/sdk";
import { getAdminDb, verifyAuthToken } from "@/lib/firebase-admin";
import { Hunt, TacoSpot } from "@/lib/types";
import tacoSpots from "@/tacoSpots.json";

const spotsById = Object.fromEntries(
  (tacoSpots as TacoSpot[]).map((s) => [s.id, s])
);

const client = new Anthropic();

export async function POST(req: Request) {
  let uid: string;
  try {
    uid = await verifyAuthToken(req);
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { huntId, spotId } = await req.json();

  if (!huntId || !spotId) {
    return Response.json({ error: "huntId and spotId required" }, { status: 400 });
  }

  // Look up spot server-side — never trust client-provided swAlias/clueHint in the LLM prompt
  const spot = spotsById[spotId];
  if (!spot) {
    return Response.json({ error: "spot not found" }, { status: 404 });
  }

  const db = getAdminDb();
  const huntSnap = await db.collection("hunts").doc(huntId).get();
  if (!huntSnap.exists) {
    return Response.json({ error: "hunt not found" }, { status: 404 });
  }
  const hunt = { id: huntSnap.id, ...huntSnap.data() } as Hunt;
  if (!hunt.stops.includes(spotId)) {
    return Response.json({ error: "spot not in hunt" }, { status: 403 });
  }

  // Only registered participants can generate clues
  const participantSnap = await db
    .collection("hunts").doc(huntId)
    .collection("participants").doc(uid)
    .get();
  if (!participantSnap.exists) {
    return Response.json({ error: "not a participant" }, { status: 403 });
  }

  // Return cached clue — avoids redundant Anthropic calls
  if (hunt.clues?.[spotId]) {
    return Response.json({ clue: hunt.clues[spotId] });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      system: [
        {
          type: "text",
          text: "You write riddle-style clues for a Star Wars-themed taco scavenger hunt in San Luis Obispo, CA. Each clue hints at the next stop's location without naming it directly. Keep it to 2 sentences max. Use a mysterious, galactic-transmission tone. No hashtags, no exclamation marks.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Write a clue for this stop. Star Wars alias: "${spot.swAlias}". Location keywords: ${spot.clueHint}.`,
        },
      ],
    });

    const clue =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
    if (!clue) {
      return Response.json({ error: "empty response" }, { status: 502 });
    }

    // Cache server-side so future callers hit the early-return above
    await db.collection("hunts").doc(huntId).update({
      [`clues.${spotId}`]: clue,
    });

    return Response.json({ clue });
  } catch (err) {
    console.error("[clue] Anthropic error:", err);
    return Response.json({ error: "generation failed" }, { status: 500 });
  }
}
