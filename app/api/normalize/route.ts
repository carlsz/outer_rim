import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface NormalizedItem {
  name: string;
  price: number | null;
}

const SYSTEM_PROMPT = `You normalize taco menu content into structured JSON.

Return ONLY a JSON array — no markdown, no explanation. Each element must have:
  - "name": string (item name, title-cased, no price info)
  - "price": number | null (USD as float, null if not listed)

Examples of valid output:
[{"name":"Al Pastor Taco","price":3.5},{"name":"Horchata","price":null}]`;

export async function POST(req: Request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.headers.get("x-admin-key") !== adminKey) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { text, image, mediaType } = body;

  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasImage = typeof image === "string" && typeof mediaType === "string";

  if (!hasText && !hasImage) {
    return Response.json({ error: "text or image required" }, { status: 400 });
  }

  const userContent: Anthropic.MessageParam["content"] = hasImage
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: image,
          },
        },
        { type: "text", text: "Normalize this menu into JSON." },
      ]
    : `Normalize this menu text:\n\n${text!.trim()}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const raw =
      message.content[0]?.type === "text" ? message.content[0].text.trim() : "";

    if (!raw) {
      return Response.json({ error: "empty response" }, { status: 502 });
    }

    // Strip markdown code fences if the model wraps the JSON
    const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const items: NormalizedItem[] = JSON.parse(json);
    return Response.json({ items });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: "model returned invalid JSON" }, { status: 502 });
    }
    console.error("[normalize] Anthropic error:", err);
    return Response.json({ error: "normalization failed" }, { status: 500 });
  }
}
