import Anthropic from "@anthropic-ai/sdk";
import { getAdminDb } from "@/lib/firebase-admin";
import { Hunt } from "@/lib/types";

const client = new Anthropic();

export async function POST(req: Request) {
  const { huntId, spotId, swAlias, clueHint } = await req.json();

  if (!huntId || !spotId) {
    return Response.json({ error: "huntId and spotId required" }, { status: 400 });
  }
  if (!swAlias) {
    return Response.json({ error: "swAlias required" }, { status: 400 });
  }
  if (!clueHint) {
    return Response.json({ error: "clueHint required" }, { status: 400 });
  }

  // Verify the hunt exists and spotId is a real stop in it
  const db = getAdminDb();
  const huntSnap = await db.collection("hunts").doc(huntId).get();
  if (!huntSnap.exists) {
    return Response.json({ error: "hunt not found" }, { status: 404 });
  }
  const hunt = { id: huntSnap.id, ...huntSnap.data() } as Hunt;
  if (!hunt.stops.includes(spotId)) {
    return Response.json({ error: "spot not in hunt" }, { status: 403 });
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
          content: `Write a clue for this stop. Star Wars alias: "${swAlias}". Location keywords: ${clueHint}.`,
        },
      ],
    });

    const clue =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";
    if (!clue) {
      return Response.json({ error: "empty response" }, { status: 502 });
    }

    // Cache the clue server-side so no client write rule is needed
    await db.collection("hunts").doc(huntId).update({
      [`clues.${spotId}`]: clue,
    });

    return Response.json({ clue });
  } catch (err) {
    console.error("[clue] Anthropic error:", err);
    return Response.json({ error: "generation failed" }, { status: 500 });
  }
}
