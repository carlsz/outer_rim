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
  // IE9 UA causes Google Fonts to return WOFF 1.0 — satori does not support WOFF2.
  // Simple wght@700 URL avoids variable-font axes that old UAs don't understand.
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Fraunces:wght@700&display=block",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
      },
      signal: AbortSignal.timeout(5000),
    }
  ).then((r) => {
    if (!r.ok) throw new Error(`Google Fonts CSS fetch failed: ${r.status}`);
    return r.text();
  });

  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) {
    throw new Error("Could not find Fraunces 700 font URL in Google Fonts CSS");
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
