"use client";

import { use, useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ArrowBigRightDash, Info, Trophy } from "lucide-react";

import { db } from "@/lib/firebase";
import { getIdToken } from "@/lib/auth";
import { Hunt, TacoSpot } from "@/lib/types";
import tacoSpots from "@/tacoSpots.json";
import { HuntMap } from "./HuntMap";
import { StopCard } from "./StopCard";
import { InfoModal } from "./InfoModal";
import { RebelBypassModal } from "./RebelBypassModal";
import HunterName from "@/components/HunterName";
import { LeaderboardSheet } from "@/components/LeaderboardSheet";
import { useHunterAuth } from "@/hooks/useHunterAuth";

const ALL_SPOTS: TacoSpot[] = tacoSpots as TacoSpot[];
const spotById = Object.fromEntries(ALL_SPOTS.map((s) => [s.id, s]));
const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

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
  const [forceAdvancing, setForceAdvancing] = useState(false);
  const [bypassOpen, setBypassOpen] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccessSpotId, setClaimSuccessSpotId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const decodedSpots = useRef<Set<string>>(new Set());
  const requestedClues = useRef<Set<string>>(new Set());
  const activeCardRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const { uid, participant, loading: authLoading, needsName } = useHunterAuth(id);

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

  // Scroll to active stop on first load
  useEffect(() => {
    if (!hunt || hasScrolled.current) return;
    hasScrolled.current = true;
    setTimeout(() => {
      activeCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, [hunt]);

  // Fetch and cache clue for the hunter's current active stop
  useEffect(() => {
    if (!hunt || !uid) return;
    const activeIndex = participant
      ? participant.claimedSpots.length
      : 0;
    const activeSpotId = hunt.stops[activeIndex];
    if (!activeSpotId) return;
    if (hunt.clues?.[activeSpotId]) return;
    if (requestedClues.current.has(activeSpotId)) return;

    requestedClues.current.add(activeSpotId);
    const spot = spotById[activeSpotId];
    if (!spot) return;

    setClueLoading(true);
    const fetchClue = async () => {
      try {
        const token = await getIdToken();
        const r = await fetch("/api/clue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ huntId: id, spotId: activeSpotId }),
        });
        if (!r.ok) throw new Error(`/api/clue ${r.status}`);
      } catch (err) {
        console.error("[clue] fetch error:", err);
      } finally {
        setClueLoading(false);
      }
    };
    fetchClue();
  }, [hunt, id, participant?.claimedSpots.length, uid]);

  async function claimStop(spotId: string) {
    if (!uid || claimLoading) return;
    setClaimLoading(true);
    setClaimError(null);

    try {
      const token = await getIdToken();

      let lat: number | undefined;
      let lng: number | undefined;

      if (!isDev) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 0,
            enableHighAccuracy: true,
          });
        }).catch((err: GeolocationPositionError) => {
          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            throw new Error("Location access denied — enable in browser settings");
          }
          throw new Error("GPS timed out — try again");
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      const res = await fetch("/api/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ huntId: id, spotId, lat, lng }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Claim failed");
      }

      setClaimSuccessSpotId(spotId);
      setTimeout(() => setClaimSuccessSpotId(null), 3000);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaimLoading(false);
    }
  }

  async function forceAdvance() {
    if (!hunt || forceAdvancing || !uid) return;
    const activeSpotId = hunt.stops[hunterActiveIndex];
    if (!activeSpotId) return;
    setForceAdvancing(true);
    try {
      const token = await getIdToken();
      await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ huntId: id, spotId: activeSpotId }),
      });
    } finally {
      setForceAdvancing(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 gap-4">
        <p
          className="text-[12px] tracking-[0.2em] uppercase text-imperial"
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

  if (!hunt || authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p
          className="text-[12px] tracking-[0.2em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Loading mission data…
        </p>
      </div>
    );
  }

  // Per-hunter stop states — fall back to 0 if no participant yet (all stops visible from start)
  const hunterClaimedCount = participant?.claimedSpots.length ?? 0;
  const hunterActiveIndex = participant ? hunterClaimedCount : 0;
  const hunterActiveSpotId = hunt.stops[hunterActiveIndex] ?? null;
  const hunterComplete = participant
    ? participant.claimedSpots.length >= hunt.stops.length
    : hunt.status === "complete";

  const allSpots = hunt.stops.map((sid) => spotById[sid]).filter(Boolean) as TacoSpot[];

  // Active stop first, then upcoming locked stops, then completed stops at the bottom
  const sortedSpots = (() => {
    const indexed = allSpots.map((spot, i) => ({ spot, originalIndex: i }));
    const active = indexed.filter(({ spot }) => spot.id === hunterActiveSpotId && !hunterComplete);
    const locked = indexed.filter(({ spot }) => {
      const claimed = participant ? participant.claimedSpots.includes(spot.id) : false;
      return spot.id !== hunterActiveSpotId && !claimed;
    });
    const completed = indexed.filter(({ spot }) => {
      const claimed = participant ? participant.claimedSpots.includes(spot.id) : false;
      return claimed;
    });
    return [...active, ...locked, ...completed];
  })();

  // Map shows all stops so hunters can navigate; active pin is hunter's current target
  const mapVisibleSpots = participant
    ? (allSpots)
    : hunt.stops.slice(0, hunt.unlockedCount).map((sid) => spotById[sid]).filter(Boolean) as TacoSpot[];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {needsName && uid && (
        <HunterName
          uid={uid}
          huntId={id}
          onJoined={() => {
            // participant doc created — useHunterAuth onSnapshot will fire and update state
          }}
        />
      )}

      {/* Header */}
      <header
        className="flex items-center justify-between px-4 md:px-8 py-2 shrink-0"
        style={{ background: "var(--surface)", borderBottom: "1px solid rgba(77,184,200,0.25)" }}
      >
        <Link href="/">
          <Image
            src="/images/taco.png"
            alt="Outer Rim"
            width={36}
            height={36}
            style={{ mixBlendMode: "screen" }}
          />
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLeaderboard((x) => !x)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground-muted hover:text-gold transition-colors"
            aria-label="Leaderboard"
          >
            <Trophy size={16} />
          </button>
          {isDev && !hunterComplete && (
            <button
              onClick={() => setBypassOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
              aria-label="Rebel bypass"
              style={{ color: "var(--accent-imperial, #ef4444)" }}
            >
              <ArrowBigRightDash size={18} />
            </button>
          )}
          <button
            onClick={() => setInfoOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
            aria-label="How to play"
          >
            <Info size={16} />
          </button>
        </div>
      </header>

      <RebelBypassModal
        open={bypassOpen}
        onClose={() => setBypassOpen(false)}
        onAdvance={forceAdvance}
        advancing={forceAdvancing}
        currentStop={hunterActiveIndex + 1}
        totalStops={hunt.stops.length}
      />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Claim success toast */}
      {claimSuccessSpotId && (() => {
        const claimedSpot = allSpots.find(s => s.id === claimSuccessSpotId);
        const stopNum = hunt.stops.indexOf(claimSuccessSpotId) + 1;
        return (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-fade-in-up px-5 py-3 rounded-[5px] flex items-center gap-3 pointer-events-none"
            style={{
              background: "#12151a",
              border: "1px solid rgba(74,222,128,0.4)",
              boxShadow: "0 0 20px rgba(74,222,128,0.15)",
              minWidth: "240px",
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            <span style={{ color: "#4ade80", fontSize: 18, lineHeight: 1 }}>✓</span>
            <div>
              <p
                className="text-[12px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-mono)", color: "#4ade80" }}
              >
                Stop {String(stopNum).padStart(2, "0")} confirmed
              </p>
              {claimedSpot && (
                <p
                  className="text-[13px] text-foreground leading-snug mt-0.5"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {claimedSpot.swAlias}
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Hunter complete banner */}
      {hunterComplete && participant && (
        <div className="px-4 py-3 border-b border-success/40 bg-success/5 flex items-center gap-3">
          <span className="text-success text-lg">✓</span>
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] tracking-[0.15em] uppercase text-success"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Kessel Run complete
            </p>
            <Link
              href={`/crawl/${id}/${uid}`}
              className="text-[12px] text-gold underline"
            >
              View your trail card →
            </Link>
          </div>
        </div>
      )}

      {/* Map */}
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{
          height: mapExpanded ? "70vh" : "clamp(200px, 40vw, 320px)",
          transition: "height 0.4s ease-out",
        }}
      >
        <HuntMap spots={mapVisibleSpots} activeSpotId={hunterActiveSpotId} />
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-[100] bg-gradient-to-t from-background to-transparent" />
        <button
          onClick={() => setMapExpanded((x) => !x)}
          className="absolute bottom-3 left-3 z-[101] flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] text-[12px] tracking-[0.15em] uppercase transition-opacity hover:opacity-90 active:opacity-70"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(10,11,13,0.72)",
            color: "var(--accent-gold)",
            border: "1px solid var(--border-strong)",
            backdropFilter: "blur(6px)",
          }}
        >
          {mapExpanded ? "↙ collapse" : "↗ expand"}
        </button>
      </div>

      <LeaderboardSheet
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        huntId={id}
        totalStops={hunt.stops.length}
        currentUid={uid}
      />

      {/* Stop list */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-3">
        <div className="max-w-[480px] md:max-w-[580px] mx-auto flex flex-col gap-2">
          {sortedSpots.map(({ spot, originalIndex }) => {
            const isHunterClaimed = participant
              ? participant.claimedSpots.includes(spot.id)
              : originalIndex < hunt.unlockedCount;
            const isHunterActive = spot.id === hunterActiveSpotId && !hunterComplete;
            const isCompleted = isHunterClaimed && !isHunterActive;
            const isLocked = !isHunterClaimed && !isHunterActive;

            const canClaim = isHunterActive && !!participant;

            return (
              <div key={spot.id} ref={isHunterActive ? activeCardRef : undefined}>
                <StopCard
                  spot={spot}
                  stopNumber={originalIndex + 1}
                  isActive={isHunterActive}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  clue={hunt.clues?.[spot.id]}
                  isLoadingClue={isHunterActive && clueLoading}
                  alreadyDecoded={decodedSpots.current.has(spot.id)}
                  onDecoded={() => { decodedSpots.current.add(spot.id); }}
                  onClaim={canClaim ? () => claimStop(spot.id) : undefined}
                  claimLoading={claimLoading}
                  claimError={isHunterActive ? claimError : null}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
