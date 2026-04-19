import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getFrauncesFont } from "@/lib/fonts";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") ?? "The Kessel Run";
  const subtitle = searchParams.get("subtitle") ?? "Outer Rim // Taco Hunt";
  const stops = searchParams.getAll("stop");
  const hunter = searchParams.get("hunter") ?? "Rebel Scout";
  const date = searchParams.get("date") ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  let fontData: ArrayBuffer;
  try {
    fontData = await getFrauncesFont();
  } catch (err) {
    console.error("[og] Font fetch failed:", err);
    return new NextResponse("Font unavailable", { status: 503 });
  }

  const medalBuffer = fs.readFileSync(path.join(process.cwd(), "public/images/medal.png"));
  const medalSrc = `data:image/png;base64,${medalBuffer.toString("base64")}`;

  const svg = await satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "1200px",
        height: "630px",
        background: "#0a0b0d",
        padding: "48px",
        fontFamily: "Fraunces",
        position: "relative",
      }}
    >
      {/* Scanline overlay effect via repeating gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Border frame */}
      <div
        style={{
          position: "absolute",
          inset: "24px",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: "8px",
          display: "flex",
        }}
      />

      {/* Main content row */}
      <div style={{ display: "flex", flexDirection: "row", flex: 1, gap: "56px", alignItems: "stretch" }}>

        {/* Left: title+subtitle, stops grid, footer info */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Top block: title + subtitle grouped */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: "84px",
                fontWeight: 700,
                color: "#e8dfc8",
                lineHeight: 1.0,
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: "36px",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#c9a84c",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom block: stops anchored to bottom */}
          {stops.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
              <div
                style={{
                  fontFamily: "Fraunces",
                  fontSize: "14px",
                  color: "#4db8c8",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                STOPS COMPLETED
              </div>
              {/* Two-column grid */}
              <div style={{ display: "flex", flexDirection: "row", gap: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {stops.slice(0, Math.ceil(stops.length / 2)).map((stop, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#c9a84c",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontFamily: "Fraunces",
                          fontSize: "20px",
                          color: "#e8dfc8",
                          fontWeight: 400,
                        }}
                      >
                        {stop}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {stops.slice(Math.ceil(stops.length / 2)).map((stop, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#c9a84c",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontFamily: "Fraunces",
                          fontSize: "20px",
                          color: "#e8dfc8",
                          fontWeight: 400,
                        }}
                      >
                        {stop}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: medal + hunter name grouped top, meta bottom */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={medalSrc} width={312} height={312} alt="" />
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: "26px",
                color: "#e8dfc8",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {hunter}
            </div>
          </div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: "13px",
              color: "#6b7280",
              letterSpacing: "0.05em",
              textAlign: "center",
            }}
          >
            {`slotacohunt.com · San Luis Obispo, CA · ${date}`}
          </div>
        </div>

      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Fraunces",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();

  return new NextResponse(Buffer.from(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
