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

    const unsub = onSnapshot(q, (snap) => {
      setEntries(
        snap.docs.map((d) => ({
          uid: d.id,
          participant: d.data() as Participant,
        }))
      );
    });

    return unsub;
  }, [huntId]);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-center py-4" style={{ color: "#6b7280", fontFamily: "DM Sans, sans-serif" }}>
        No hunters yet — be the first!
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry, i) => {
        const isMe = entry.uid === currentUid;
        const pct = totalStops > 0 ? (entry.participant.claimedCount / totalStops) * 100 : 0;

        return (
          <li
            key={entry.uid}
            className="rounded px-3 py-2"
            style={{
              background: isMe ? "rgba(201,168,76,0.12)" : "#1c2028",
              border: isMe ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(232,223,200,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm font-medium"
                style={{ color: isMe ? "#c9a84c" : "#e8dfc8", fontFamily: "DM Sans, sans-serif" }}
              >
                #{i + 1} {entry.participant.name}
                {isMe && <span className="ml-2 text-xs opacity-70">(you)</span>}
              </span>
              <span
                className="text-xs"
                style={{ color: "#6b7280", fontFamily: "DM Sans, sans-serif" }}
              >
                {entry.participant.claimedCount}/{totalStops}
              </span>
            </div>

            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(232,223,200,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: entry.participant.completedAt ? "#4ade80" : "#c9a84c",
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
