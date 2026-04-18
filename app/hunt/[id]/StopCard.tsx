"use client";

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

export function StopCard({
  spot,
  stopNumber,
  isActive,
  isCompleted,
  isLocked,
  clue,
  isLoadingClue,
}: StopCardProps) {
  const cardClass = isLocked
    ? "rounded-[5px] border bg-surface p-4 border-border opacity-60"
    : isActive
    ? "rounded-[5px] border bg-surface p-4 pulse-ring border-gold"
    : isCompleted
    ? "rounded-[5px] border bg-surface p-4 border-border opacity-60"
    : "rounded-[5px] border bg-surface p-4 border-border";

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
    <div className={cardClass}>
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

          {/* Real name + address */}
          <p className="text-[13px] text-foreground-muted leading-snug">
            {spot.name} · {spot.address.split(",")[0]}
          </p>
        </div>

        {/* Spice rating */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="text-[10px] tracking-[0.15em] uppercase text-foreground-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Spice
          </span>
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

      {/* Clue terminal — active stop only */}
      {isActive && (
        <ClueTerminal clue={clue ?? null} loading={isLoadingClue ?? false} />
      )}
    </div>
  );
}
