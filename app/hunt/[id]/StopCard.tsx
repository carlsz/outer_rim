"use client";

import { useState, useRef } from "react";
import { TacoSpot } from "@/lib/types";
import { ClueTerminal } from "./ClueTerminal";

interface StopCardProps {
  spot: TacoSpot;
  stopNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  isLocked?: boolean;
  clue?: string;
  isLoadingClue?: boolean;
}

const SPICE_DOTS = ["·", "·", "·", "·", "·"];
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%▓░▒";

function mapsUrl(spot: TacoSpot) {
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
}

function scrambleReveal(
  target: string,
  setter: (s: string) => void,
  onDone?: () => void
) {
  const len = target.length;
  let frame = 0;
  const totalFrames = len * 3;
  const id = setInterval(() => {
    frame++;
    const locked = Math.floor(frame / 3);
    const display = target
      .split("")
      .map((ch, i) => {
        if (i < locked) return ch;
        if (ch === " " || ch === "·" || ch === ",") return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join("");
    setter(display);
    if (locked >= len) {
      clearInterval(id);
      setter(target);
      onDone?.();
    }
  }, 35);
}

export function StopCard({
  spot,
  stopNumber,
  isActive,
  isCompleted,
  isLocked,
  clue,
  isLoadingClue,
}: StopCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayAddr, setDisplayAddr] = useState("");
  const decodeRef = useRef(false);

  const shortAddr = spot.address.split(",")[0];

  function handleDecode(e: React.MouseEvent) {
    e.stopPropagation();
    if (decodeRef.current) return;
    decodeRef.current = true;
    setDecoding(true);
    setDisplayName(spot.name.replace(/[^ ]/g, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]));
    setDisplayAddr(shortAddr.replace(/[^ ]/g, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]));

    let namesDone = false;
    let addrDone = false;
    const checkBothDone = () => {
      if (namesDone && addrDone) {
        setDecoding(false);
        setDecoded(true);
      }
    };
    scrambleReveal(spot.name, setDisplayName, () => { namesDone = true; checkBothDone(); });
    setTimeout(() => {
      scrambleReveal(shortAddr, setDisplayAddr, () => { addrDone = true; checkBothDone(); });
    }, 120);
  }

  const borderColor = isActive ? "border-gold" : "border-border";
  const cardClass = `rounded-[5px] border bg-surface p-4 ${borderColor} ${
    isLocked ? "opacity-80" : isCompleted ? "opacity-60" : ""
  } ${isActive && !decoded ? "pulse-ring" : ""}`;

  if (isLocked) {
    return (
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] tracking-[0.2em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Stop {String(stopNumber).padStart(2, "0")}
            </span>
            <span
              className="text-[11px] tracking-[0.15em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ▪ locked
            </span>
          </div>
          <span className="text-[12px] text-foreground-muted opacity-50" style={{ fontFamily: "var(--font-mono)" }}>⊘</span>
        </div>
        <p
          className="mt-1 text-[14px] text-foreground-muted leading-snug"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {spot.swAlias}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${cardClass} cursor-pointer select-none`}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Stop label row */}
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] tracking-[0.2em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Stop {String(stopNumber).padStart(2, "0")}
            </span>
            {isCompleted && (
              <span className="text-[11px] text-success">✓ complete</span>
            )}
            {isActive && (
              <span
                className="text-[11px] tracking-[0.15em] uppercase text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                active
              </span>
            )}
          </div>

          {/* SW alias */}
          <h2
            className="text-[16px] font-bold text-foreground leading-snug"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {spot.swAlias}
          </h2>

          {/* Real name + short address — hidden on active until decoded */}
          {!isActive && (
            <p className="text-[13px] text-foreground-muted leading-snug">
              {spot.name} · {shortAddr}
            </p>
          )}
        </div>

        {/* Spice rating + chevron */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Spice
            </span>
            <span
              className="text-[11px] text-foreground-muted transition-transform duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                display: "inline-block",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ›
            </span>
          </div>
          <div className="flex gap-0.5">
            {SPICE_DOTS.map((_, i) => (
              <span
                key={i}
                className={`text-[14px] ${
                  i < spot.spiceRating ? "text-gold" : "text-foreground-muted opacity-30"
                }`}
              >
                ●
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p
        className="mt-2 text-[12px] italic text-foreground-muted"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        "{spot.tagline}"
      </p>

      {/* Clue terminal — active stop only, always visible */}
      {isActive && (
        <ClueTerminal clue={clue ?? null} loading={isLoadingClue ?? false} />
      )}

      {/* Decode interaction — active stop only */}
      {isActive && !decoded && (
        <button
          onClick={handleDecode}
          disabled={decoding}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-[3px] text-[11px] tracking-[0.2em] uppercase transition-opacity hover:opacity-80 active:opacity-60 disabled:cursor-default"
          style={{
            fontFamily: "var(--font-mono)",
            color: decoding ? "var(--accent-cyan)" : "var(--accent-gold)",
            border: `1px solid ${decoding ? "var(--accent-cyan)" : "var(--border-strong)"}`,
            background: "var(--surface-elevated)",
          }}
        >
          {decoding ? (
            <>
              <span className="animate-pulse">▒</span>
              <span>Decoding…</span>
            </>
          ) : (
            <>
              <span>⟶</span>
              <span>Decode Transmission</span>
            </>
          )}
        </button>
      )}

      {/* Revealed identity after decode */}
      {isActive && decoded && (
        <div
          className="mt-3 pt-3 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <p
              className="text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Identity confirmed
            </p>
            <p
              className="text-[14px] font-semibold text-foreground leading-snug"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {displayName}
            </p>
            <p
              className="text-[12px] text-foreground-muted mt-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {displayAddr}
            </p>
          </div>
          <a
            href={mapsUrl(spot)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-mono tracking-widest uppercase px-3 py-2 rounded-[3px] text-center transition-opacity hover:opacity-80"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--accent-gold)",
              border: "1px solid var(--border-strong)",
            }}
          >
            ⟶ Get Directions
          </a>
        </div>
      )}

      {/* Expandable details — non-active stops */}
      {!isActive && (
        <div
          className="grid transition-all duration-200 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div
              className="mt-3 pt-3 flex flex-col gap-3"
              style={{ borderTop: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full address */}
              <div>
                <p
                  className="text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Location
                </p>
                <p className="text-[13px] text-foreground">{spot.address}</p>
              </div>

              {/* Cached clue for completed stops */}
              {isCompleted && clue && (
                <div>
                  <p
                    className="text-[10px] tracking-[0.15em] uppercase text-foreground-muted mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Transmission
                  </p>
                  <p
                    className="text-[12px] text-cyan leading-relaxed"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {clue}
                  </p>
                </div>
              )}

              {/* Directions link */}
              <a
                href={mapsUrl(spot)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-mono tracking-widest uppercase px-3 py-2 rounded-[3px] text-center transition-opacity hover:opacity-80"
                style={{
                  background: "var(--surface-elevated)",
                  color: "var(--accent-gold)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                ⟶ Get Directions
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
