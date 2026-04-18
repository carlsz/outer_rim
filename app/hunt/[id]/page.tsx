"use client";

import { use, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { Info } from "lucide-react";
import { db } from "@/lib/firebase";
import { Hunt, TacoSpot } from "@/lib/types";
import tacoSpots from "@/tacoSpots.json";
import { HuntMap } from "./HuntMap";
import { StopCard } from "./StopCard";
import { InfoModal } from "./InfoModal";

const ALL_SPOTS: TacoSpot[] = tacoSpots as TacoSpot[];
const spotById = Object.fromEntries(ALL_SPOTS.map((s) => [s.id, s]));

export default function HuntPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [clueLoading, setClueLoading] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  // Track which spot IDs we've already requested a clue for to avoid duplicate fetches
  const requestedClues = useRef<Set<string>>(new Set());

  // Real-time hunt listener
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "hunts", id),
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        setHunt({ id: snap.id, ...snap.data() } as Hunt);
      },
      (err) => {
        console.error("[hunt] Firestore error:", err);
        setNotFound(true);
      }
    );
    return unsub;
  }, [id]);

  // Fetch and cache clue whenever a new stop is unlocked
  useEffect(() => {
    if (!hunt) return;
    const activeIndex = hunt.unlockedCount - 1;
    const activeSpotId = hunt.stops[activeIndex];
    if (!activeSpotId) return;
    // Already have the clue in Firestore
    if (hunt.clues?.[activeSpotId]) return;
    // Already requested this clue in this session
    if (requestedClues.current.has(activeSpotId)) return;

    requestedClues.current.add(activeSpotId);
    const spot = spotById[activeSpotId];
    if (!spot) return;

    setClueLoading(true);
    fetch("/api/clue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        huntId: id,
        spotId: activeSpotId,
        swAlias: spot.swAlias,
        clueHint: spot.clueHint,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`/api/clue ${r.status}`);
        return r.json();
      })
      .then(async ({ clue }: { clue: string }) => {
        if (!clue) return;
        await updateDoc(doc(db, "hunts", id), {
          [`clues.${activeSpotId}`]: clue,
        });
      })
      .catch((err) => console.error("[clue] fetch error:", err))
      .finally(() => setClueLoading(false));
  }, [hunt, id]);

  if (notFound) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 gap-4">
        <p
          className="text-[11px] tracking-[0.2em] uppercase text-imperial"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Hunt not found
        </p>
        <p className="text-[13px] text-foreground-muted text-center max-w-[300px]">
          Run{" "}
          <code className="text-cyan">npm run seed</code> to initialize the hunt
          in Firestore.
        </p>
        <Link href="/" className="text-[13px] text-gold underline">
          Return to base
        </Link>
      </div>
    );
  }

  if (!hunt) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p
          className="text-[11px] tracking-[0.2em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Loading mission data…
        </p>
      </div>
    );
  }

  const unlockedSpots = hunt.stops
    .slice(0, hunt.unlockedCount)
    .map((sid) => spotById[sid])
    .filter(Boolean) as TacoSpot[];

  const allSpots = hunt.stops.map((sid) => spotById[sid]).filter(Boolean) as TacoSpot[];

  const activeSpotId = hunt.stops[hunt.unlockedCount - 1] ?? null;
  const isComplete = hunt.status === "complete";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <Link href="/">
          <span
            className="text-[11px] tracking-[0.2em] uppercase text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Outer Rim
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] tracking-[0.15em] uppercase text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {hunt.unlockedCount}/{hunt.stops.length} stops
          </span>
          <button
            onClick={() => setInfoOpen(true)}
            className="text-foreground-muted hover:text-foreground transition-colors"
            aria-label="How to play"
          >
            <Info size={16} />
          </button>
        </div>
      </header>
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Pending unlock banner */}
      {hunt.pendingStop !== null && (
        <div className="px-4 py-3 border-b border-gold/40 bg-gold/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gold pulse-ring shrink-0" />
          <div className="flex-1 min-w-0">
            <p
              className="text-[11px] tracking-[0.15em] uppercase text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Navigator unlock requested
            </p>
            <p className="text-[12px] text-foreground-muted">
              Awaiting Imperial clearance for next stop…
            </p>
          </div>
        </div>
      )}

      {/* Complete banner */}
      {isComplete && (
        <div className="px-4 py-3 border-b border-success/40 bg-success/5 flex items-center gap-3">
          <span className="text-success text-lg">✓</span>
          <div className="flex-1 min-w-0">
            <p
              className="text-[11px] tracking-[0.15em] uppercase text-success"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Kessel Run complete
            </p>
            <Link
              href={`/crawl/${id}`}
              className="text-[12px] text-gold underline"
            >
              View your trail card →
            </Link>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative w-full shrink-0 overflow-hidden" style={{ height: "40vw", minHeight: "200px", maxHeight: "320px" }}>
        <HuntMap spots={unlockedSpots} activeSpotId={activeSpotId} />
        {/* Gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-[100] bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Stop list */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2 -mt-2">
        <div className="max-w-[480px] mx-auto flex flex-col gap-2">
          {allSpots.map((spot, i) => {
            const isUnlocked = i < hunt.unlockedCount;
            const isActive = spot.id === activeSpotId && !isComplete;
            const isCompleted = isUnlocked && !isActive;
            const isLocked = !isUnlocked;
            return (
              <StopCard
                key={spot.id}
                spot={spot}
                stopNumber={i + 1}
                isActive={isActive}
                isCompleted={isCompleted}
                isLocked={isLocked}
                clue={hunt.clues?.[spot.id]}
                isLoadingClue={isActive && clueLoading}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
