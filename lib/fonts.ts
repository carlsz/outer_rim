/**
 * Module-level font cache for satori.
 *
 * Google Fonts can't be fetched at render time inside a satori Node context.
 * This module fetches Fraunces once per server instance (on first call) and
 * caches the ArrayBuffer for all subsequent /api/og requests.
 *
 * The cache lives for the lifetime of the worker process — effectively "server
 * startup" in a Cloud Run min-instances=1 deployment.
 */

let frauncesCache: Promise<ArrayBuffer> | null = null;

async function fetchFraunces(): Promise<ArrayBuffer> {
  // Hit the Google Fonts CSS API with a desktop UA so it returns a woff2 URL.
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&display=block",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(5000),
    }
  ).then((r) => {
    if (!r.ok) throw new Error(`Google Fonts CSS fetch failed: ${r.status}`);
    return r.text();
  });

  // Find the @font-face block for weight 700 normal and extract its woff2 URL.
  // Google Fonts returns multiple blocks; we must not grab the italic or wrong weight.
  const block700 = css
    .split("@font-face")
    .find((b) => b.includes("font-weight: 700") && !b.includes("font-style: italic"));

  const match = block700?.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/);
  if (!match) {
    throw new Error("Could not find Fraunces 700-normal woff2 URL in Google Fonts CSS");
  }

  const fontUrl = match[1];
  const data = await fetch(fontUrl, { signal: AbortSignal.timeout(8000) }).then((r) => {
    if (!r.ok) throw new Error(`Font file fetch failed: ${r.status} ${fontUrl}`);
    return r.arrayBuffer();
  });

  return data;
}

/**
 * Returns the Fraunces 700 font as an ArrayBuffer, fetching it once and
 * caching it for the lifetime of the server process.
 */
export function getFrauncesFont(): Promise<ArrayBuffer> {
  if (!frauncesCache) {
    frauncesCache = fetchFraunces().catch((err) => {
      // Clear on failure so the next request retries.
      frauncesCache = null;
      throw err;
    });
  }
  return frauncesCache;
}
