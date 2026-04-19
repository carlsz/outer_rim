"use client";

import { use, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { Hunt, TacoSpot } from "@/lib/types";
import tacoSpots from "@/tacoSpots.json";

const spotById = Object.fromEntries(
  (tacoSpots as TacoSpot[]).map((s) => [s.id, s])
);

export default function CrawlPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [hunt, setHunt] = useState<Hunt | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "hunts", id), (snap) => {
      if (snap.exists()) setHunt({ id: snap.id, ...snap.data() } as Hunt);
    });
    return unsub;
  }, [id]);

  if (!hunt) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedSpots = hunt.stops
    .slice(0, hunt.unlockedCount)
    .map((sid) => spotById[sid])
    .filter(Boolean) as TacoSpot[];

  // Build OG image URL
  const ogParams = new URLSearchParams({
    title: "The Kessel Run",
    subtitle: "Outer Rim // Taco Hunt",
    hunter: "Rebel Scout",
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  });
  completedSpots.slice(0, 5).forEach((s) => ogParams.append("stop", s.swAlias));
  const ogUrl = `/api/og?${ogParams.toString()}`;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/crawl/${id}`
      : "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <Link href={`/hunt/${id}`}>
          <span
            className="text-[12px] tracking-[0.2em] uppercase text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Hunt
          </span>
        </Link>
        <span
          className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Trail Card
        </span>
      </header>

      <div className="flex-1 px-4 py-8 flex flex-col gap-6 max-w-[480px] mx-auto w-full">
        {/* Trail card image */}
        <div className="rounded-[8px] overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogUrl}
            alt="Trail card"
            className="w-full h-auto block"
            style={{ aspectRatio: "1200/630" }}
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          {hunt.status === "complete" ? (
            <p
              className="text-[12px] tracking-[0.2em] uppercase text-success"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ✓ Kessel Run complete
            </p>
          ) : (
            <p
              className="text-[12px] tracking-[0.2em] uppercase text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Hunt in progress
            </p>
          )}
          <p className="text-[22px] font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            {completedSpots.length} of {hunt.stops.length} stops
          </p>
        </div>

        {/* Stop list */}
        <div className="flex flex-col gap-2">
          {completedSpots.map((spot, i) => (
            <div
              key={spot.id}
              className="flex items-center gap-3 px-3 py-2 rounded-[3px] border border-border bg-surface"
            >
              <span
                className="text-[12px] text-foreground-muted shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[14px] text-foreground flex-1" style={{ fontFamily: "Fraunces, serif" }}>
                {spot.swAlias}
              </span>
              <span className="text-success text-[12px]">✓</span>
            </div>
          ))}
        </div>

        {/* Share */}
        {shareUrl && (
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Outer Rim Taco Hunt", url: shareUrl });
              } else {
                navigator.clipboard.writeText(shareUrl);
              }
            }}
            className="h-12 rounded-[5px] border border-gold text-gold text-[14px] font-semibold tracking-wide hover:bg-gold/10 transition-colors"
          >
            Share trail card
          </button>
        )}
      </div>
    </div>
  );
}
