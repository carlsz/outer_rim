import { NextRequest, NextResponse } from "next/server";
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

  const svg = await satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        background: "#0a0b0d",
        padding: "64px",
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

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: "13px",
            color: "#c9a84c",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          OUTER RIM // TACO HUNT
        </div>
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: "13px",
            color: "#6b7280",
            letterSpacing: "0.1em",
          }}
        >
          SAN LUIS OBISPO
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "Fraunces",
          fontSize: "80px",
          fontWeight: 700,
          color: "#e8dfc8",
          lineHeight: 1.0,
          marginBottom: "16px",
          maxWidth: "800px",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "Fraunces",
          fontSize: "22px",
          fontWeight: 400,
          fontStyle: "italic",
          color: "#c9a84c",
          marginBottom: "40px",
        }}
      >
        {subtitle}
      </div>

      {/* Stop list */}
      {stops.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "auto",
          }}
        >
          {stops.slice(0, 5).map((stop, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#c9a84c",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: "Fraunces",
                  fontSize: "18px",
                  color: "#e8dfc8",
                  fontWeight: 400,
                }}
              >
                {stop}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "1px solid rgba(201,168,76,0.15)",
          paddingTop: "20px",
          marginTop: "32px",
        }}
      >
        <div
          style={{
            fontFamily: "Fraunces",
            fontSize: "16px",
            color: "#c9a84c",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          KESSEL RUN COMPLETE
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: "15px",
              color: "#e8dfc8",
              fontWeight: 700,
            }}
          >
            {hunter}
          </div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            {date}
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
