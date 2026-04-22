"use client";

import { useState, useRef, useEffect } from "react";
import { TacoSpot } from "@/lib/types";
import { ClueTerminal } from "./ClueTerminal";
import { SCRAMBLE_CHARS, scrambleReveal } from "@/lib/scramble";

interface StopCardProps {
  spot: TacoSpot;
  stopNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  isLocked?: boolean;
  clue?: string;
  isLoadingClue?: boolean;
  alreadyDecoded?: boolean;
  onDecoded?: () => void;
  onClaim?: () => void;
  claimLoading?: boolean;
  claimError?: string | null;
}

const SPICE_DOTS = ["·", "·", "·", "·", "·"];

function mapsUrl(spot: TacoSpot) {
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
}

export function StopCard({
  spot,
  stopNumber,
  isActive,
  isCompleted,
  isLocked,
  clue,
  isLoadingClue,
  alreadyDecoded,
  onDecoded,
  onClaim,
  claimLoading,
  claimError,
}: StopCardProps) {
  const shortAddr = spot.address.split(",")[0];

  const [expanded, setExpanded] = useState(false);
  const [decoded, setDecoded] = useState(alreadyDecoded ?? false);
  const [transmissionReady, setTransmissionReady] = useState(alreadyDecoded ?? false);
  const [displayName, setDisplayName] = useState(alreadyDecoded ? spot.name : "");
  const [displayAddr, setDisplayAddr] = useState(alreadyDecoded ? shortAddr : "");
  const [revealFlash, setRevealFlash] = useState(false);
  const decodeRef = useRef(false);

  // Scramble-reveal the name/address once the clue typewriter finishes
  useEffect(() => {
    if (!transmissionReady || alreadyDecoded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName(spot.name.replace(/[^ ]/g, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayAddr(shortAddr.replace(/[^ ]/g, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]));
    let namesDone = false;
    let addrDone = false;
    let flashTimer: ReturnType<typeof setTimeout>;
    const checkBothDone = () => {
      if (namesDone && addrDone) {
        setRevealFlash(true);
        flashTimer = setTimeout(() => setRevealFlash(false), 700);
      }
    };
    scrambleReveal(spot.name, setDisplayName, () => { namesDone = true; checkBothDone(); });
    const addrTimer = setTimeout(() => {
      scrambleReveal(shortAddr, setDisplayAddr, () => { addrDone = true; checkBothDone(); });
    }, 120);
    return () => { clearTimeout(addrTimer); clearTimeout(flashTimer); };
  }, [transmissionReady]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDecode(e: React.MouseEvent) {
    e.stopPropagation();
    if (decodeRef.current) return;
    decodeRef.current = true;
    setDecoded(true);
    onDecoded?.();
  }

  const borderColor = isActive && decoded ? "border-cyan" : isActive ? "border-gold" : isCompleted ? "border-success" : "border-border";
  const cardClass = `rounded-[5px] border bg-surface p-4 ${borderColor} ${
    isLocked ? "opacity-80" : isCompleted ? "opacity-60" : ""
  } ${isActive && !decoded ? "pulse-ring" : ""}`;

  if (isLocked) {
    return (
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] tracking-[0.2em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Stop {String(stopNumber).padStart(2, "0")}
            </span>
            <span
              className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted"
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
              className="text-[12px] tracking-[0.2em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Stop {String(stopNumber).padStart(2, "0")}
            </span>
            {isCompleted && (
              <span className="text-[12px] tracking-[0.15em] uppercase text-success" style={{ fontFamily: "var(--font-mono)" }}>✓ Complete</span>
            )}
            {isActive && (
              <span
                className="text-[12px] tracking-[0.15em] uppercase text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                active
              </span>
            )}
          </div>

          {/* SW alias */}
          <h2
            className="text-[16px] md:text-[18px] font-bold text-foreground leading-snug"
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
              className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Spice
            </span>
            <span
              className="text-[12px] text-foreground-muted transition-transform duration-200"
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
        {'"'}{spot.tagline}{'"'}
      </p>

      {/* Clue terminal — active stop only, always visible */}
      {isActive && (
        <ClueTerminal
          clue={clue ?? null}
          loading={isLoadingClue ?? false}
          decoded={decoded}
          onTransmissionDecoded={() => setTransmissionReady(true)}
        />
      )}

      {/* Decode interaction — collapses smoothly after click */}
      {isActive && (
        <div
          className="grid transition-all duration-300 ease-out"
          style={{ gridTemplateRows: decoded ? "0fr" : "1fr" }}
        >
          <div className="overflow-hidden">
            <button
              onClick={handleDecode}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-[3px] text-[12px] tracking-[0.2em] uppercase hover:opacity-80 active:opacity-60"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--accent-gold)",
                border: "1px solid var(--border-strong)",
                background: "var(--surface-elevated)",
                opacity: decoded ? 0 : 1,
                transition: "opacity 0.2s ease-out",
              }}
            >
              <span>⟶</span>
              <span>Decode Transmission</span>
            </button>
          </div>
        </div>
      )}

      {/* Revealed identity after decode — waits for clue typewriter to finish */}
      {isActive && decoded && transmissionReady && (
        <div
          className="mt-3 pt-3 flex flex-col gap-3 transition-all duration-[400ms] ease-out animate-fade-in-up"
          style={{ borderTop: "1px solid var(--border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <p
              className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted mb-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Identity confirmed
            </p>
            <p
              className="text-[14px] font-semibold leading-snug transition-colors duration-500"
              style={{
                fontFamily: "var(--font-mono)",
                color: revealFlash ? "var(--accent-cyan)" : "var(--foreground)",
              }}
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

      {/* Claim button — only after transmission is decoded and identity revealed */}
      {isActive && onClaim && decoded && transmissionReady && (
        <div
          className="mt-3 flex flex-col gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClaim}
            disabled={claimLoading}
            className="w-full py-2.5 rounded-[3px] text-[12px] tracking-[0.2em] uppercase font-medium transition-opacity disabled:opacity-50 active:opacity-70"
            style={{
              fontFamily: "var(--font-mono)",
              backgroundColor: "transparent",
              border: "1px solid var(--accent-cyan)",
              color: "var(--accent-cyan)",
            }}
          >
            {claimLoading ? "Verifying location…" : "✓ I'm here — Claim this stop"}
          </button>
          {claimError && (
            <p className="text-[12px] text-center" style={{ fontFamily: "var(--font-mono)", color: "#ef4444" }}>
              {claimError}
            </p>
          )}
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
                  className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted mb-1"
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
                    className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted mb-1"
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
