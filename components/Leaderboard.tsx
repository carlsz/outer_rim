"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Participant } from "@/lib/types";

interface LeaderboardEntry {
  uid: string;
  participant: Participant;
}

interface Props {
  huntId: string;
  totalStops: number;
  currentUid?: string | null;
}

export default function Leaderboard({ huntId, totalStops, currentUid }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "hunts", huntId, "participants"),
      orderBy("claimedCount", "desc"),
      orderBy("joinedAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ uid: d.id, participant: d.data() as Participant })));
    });
  }, [huntId]);

  if (entries.length === 0) {
    return (
      <p
        className="text-[12px] tracking-[0.15em] uppercase text-center py-6 text-foreground-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        No hunters yet — be the first
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry, i) => {
        const isMe = entry.uid === currentUid;
        const complete = !!entry.participant.completedAt;
        const pct = totalStops > 0 ? (entry.participant.claimedCount / totalStops) * 100 : 0;

        return (
          <li
            key={entry.uid}
            className="rounded-[3px] px-3 py-2.5 flex flex-col gap-2"
            style={{
              background: isMe ? "rgba(77,184,200,0.06)" : "var(--surface)",
              border: isMe
                ? "1px solid rgba(77,184,200,0.35)"
                : "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Rank + name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="text-[11px] shrink-0 tabular-nums"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: isMe ? "var(--accent-cyan)" : "var(--foreground-muted)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-[13px] truncate"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: isMe ? "var(--accent-cyan)" : "var(--foreground)",
                    fontWeight: isMe ? 500 : 400,
                  }}
                >
                  {entry.participant.name}
                  {isMe && (
                    <span
                      className="ml-2 text-[10px] tracking-[0.15em] uppercase opacity-60"
                    >
                      you
                    </span>
                  )}
                </span>
              </div>

              {/* Count + complete badge */}
              <div className="flex items-center gap-2 shrink-0">
                {complete && (
                  <span
                    className="text-[10px] tracking-[0.12em] uppercase"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--accent-gold)" }}
                  >
                    ✓
                  </span>
                )}
                <span
                  className="text-[11px] tabular-nums"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: complete ? "var(--accent-gold)" : "var(--foreground-muted)",
                  }}
                >
                  {entry.participant.claimedCount}/{totalStops}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-[2px] rounded-full overflow-hidden"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: complete ? "var(--accent-gold)" : "var(--accent-cyan)",
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
