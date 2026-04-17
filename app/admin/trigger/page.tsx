"use client";

import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";
import { Hunt } from "@/lib/types";

export default function AdminTriggerPage() {
  const [huntId, setHuntId] = useState("may5-2026");
  const [loading, setLoading] = useState(false);
  const [navigatorUrl, setNavigatorUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function trigger() {
    setLoading(true);
    setError(null);
    setNavigatorUrl(null);
    try {
      const huntRef = doc(db, "hunts", huntId);
      const snap = await getDoc(huntRef);
      if (!snap.exists()) {
        setError(`Hunt "${huntId}" not found in Firestore. Run npm run seed first.`);
        return;
      }

      const hunt = { id: snap.id, ...snap.data() } as Hunt;

      if (hunt.status === "complete") {
        setError("Hunt is already complete.");
        return;
      }

      if (hunt.pendingStop !== null) {
        setError("A navigator unlock is already pending.");
        return;
      }

      const token = uuidv4();
      const pendingStop = hunt.unlockedCount;

      if (pendingStop >= hunt.stops.length) {
        setError("All stops are already unlocked.");
        return;
      }

      await updateDoc(huntRef, { pendingStop, navigatorToken: token });

      const origin = window.location.origin;
      setNavigatorUrl(`${origin}/hunt/${huntId}/unlock?token=${token}`);
    } catch (err) {
      console.error(err);
      setError("Firestore write failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center px-6">
      <div className="w-full max-w-[420px] flex flex-col gap-6">
        <div>
          <p
            className="text-[11px] tracking-[0.2em] uppercase text-imperial mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Admin · Imperial Trigger
          </p>
          <h1
            className="text-[28px] font-bold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Navigator Unlock
          </h1>
          <p className="text-[13px] text-foreground-muted mt-1">
            Generates a token-gated URL to approve the next stop unlock. Open
            on your phone before the demo.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-[11px] tracking-[0.15em] uppercase text-foreground-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Hunt ID
          </label>
          <input
            type="text"
            value={huntId}
            onChange={(e) => setHuntId(e.target.value)}
            className="h-10 rounded-[3px] border border-border-strong bg-surface-elevated px-3 text-[14px] text-foreground focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <button
          onClick={trigger}
          disabled={loading}
          className="h-12 rounded-[5px] bg-gold text-background text-[14px] font-semibold tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {loading ? "Triggering…" : "Trigger unlock request"}
        </button>

        {error && (
          <div className="rounded-[3px] border border-imperial/40 bg-imperial/5 px-4 py-3">
            <p className="text-[13px] text-imperial">{error}</p>
          </div>
        )}

        {navigatorUrl && (
          <div className="rounded-[5px] border border-success/40 bg-success/5 px-4 py-4 flex flex-col gap-3">
            <p
              className="text-[11px] tracking-[0.2em] uppercase text-success"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Navigator URL generated
            </p>
            <p className="text-[12px] text-foreground-muted">
              Open this on your phone before the demo. The approve/deny buttons
              only appear with this token.
            </p>
            <div
              className="rounded-[3px] border border-border bg-background px-3 py-2 break-all"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <p className="text-[12px] text-cyan">{navigatorUrl}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(navigatorUrl)}
              className="h-9 rounded-[3px] border border-border text-[12px] text-foreground-muted hover:border-gold hover:text-gold transition-colors"
            >
              Copy to clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
