"use client";

import { use } from "react";
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import { useHunterAuth } from "@/hooks/useHunterAuth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import type { Hunt } from "@/lib/types";

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { uid } = useHunterAuth(id);
  const [hunt, setHunt] = useState<Hunt | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "hunts", id), (snap) => {
      if (snap.exists()) setHunt({ id: snap.id, ...snap.data() } as Hunt);
    });
  }, [id]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <Link href={`/hunt/${id}`}>
          <span
            className="text-[11px] tracking-[0.2em] uppercase text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Back to Hunt
          </span>
        </Link>
        <span
          className="text-[11px] tracking-[0.2em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Leaderboard
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-[480px] mx-auto">
          <h1
            className="text-2xl mb-6"
            style={{ color: "#e8dfc8", fontFamily: "Fraunces, serif" }}
          >
            Outer Rim — Hunter Rankings
          </h1>

          {hunt ? (
            <Leaderboard
              huntId={id}
              totalStops={hunt.stops.length}
              currentUid={uid}
            />
          ) : (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
