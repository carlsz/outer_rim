"use client";

import { use, useEffect, useState, Suspense } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { Hunt } from "@/lib/types";
import tacoSpots from "@/tacoSpots.json";
import { TacoSpot } from "@/lib/types";

const spotById = Object.fromEntries(
  (tacoSpots as TacoSpot[]).map((s) => [s.id, s])
);

function UnlockContent({ huntId }: { huntId: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [acting, setActing] = useState(false);
  const [result, setResult] = useState<"approved" | "denied" | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "hunts", huntId), (snap) => {
      if (snap.exists()) setHunt({ id: snap.id, ...snap.data() } as Hunt);
    });
    return unsub;
  }, [huntId]);

  async function approve() {
    if (!hunt) return;
    setActing(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ huntId, token, action: "approve" }),
      });
      if (!res.ok) {
        console.error("[unlock] approve failed", await res.json());
        return;
      }
      setResult("approved");
    } finally {
      setActing(false);
    }
  }

  async function deny() {
    if (!hunt) return;
    setActing(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ huntId, token, action: "deny" }),
      });
      if (!res.ok) {
        console.error("[unlock] deny failed", await res.json());
        return;
      }
      setResult("denied");
    } finally {
      setActing(false);
    }
  }

  if (!hunt) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (result === "approved") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl text-success">✓</span>
        <p
          className="text-[11px] tracking-[0.2em] uppercase text-success"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Clearance granted
        </p>
        <p className="text-[14px] text-foreground-muted">
          The next stop is now visible on the hunters&apos; map.
        </p>
        <Link href={`/hunt/${huntId}`} className="text-[13px] text-gold underline">
          Back to hunt
        </Link>
      </div>
    );
  }

  if (result === "denied") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-4xl text-imperial">✕</span>
        <p
          className="text-[11px] tracking-[0.2em] uppercase text-imperial"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Request denied
        </p>
        <p className="text-[14px] text-foreground-muted">
          The unlock request was cleared. Stop remains locked.
        </p>
        <Link href={`/hunt/${huntId}`} className="text-[13px] text-gold underline">
          Back to hunt
        </Link>
      </div>
    );
  }

  // No pending unlock
  if (hunt.pendingStop === null) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div
          className="w-16 h-16 rounded-full border-2 border-foreground-muted flex items-center justify-center"
        >
          <span className="text-3xl text-foreground-muted">⊙</span>
        </div>
        <div>
          <p
            className="text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            No pending request
          </p>
          <p className="text-[14px] text-foreground-muted max-w-[260px]">
            Awaiting navigator clearance request…
          </p>
        </div>
      </div>
    );
  }

  const pendingSpot = spotById[hunt.stops[hunt.pendingStop]];
  const isAuthorized = token && token === hunt.navigatorToken;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Imperial pulse ring */}
      <div
        className="w-20 h-20 rounded-full border-2 border-imperial flex items-center justify-center"
        style={{
          animation: "pulse-ring 1.5s ease-in-out infinite",
          boxShadow: "0 0 0 0 rgba(239,68,68,0.6)",
        }}
      >
        <span className="text-3xl text-imperial">⚠</span>
      </div>

      <div>
        <p
          className="text-[11px] tracking-[0.2em] uppercase text-imperial mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Imperial clearance required
        </p>
        {pendingSpot && (
          <p className="text-[16px] font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            {pendingSpot.swAlias}
          </p>
        )}
        <p className="text-[13px] text-foreground-muted mt-1">
          Hunters are requesting access to the next stop.
        </p>
      </div>

      {isAuthorized ? (
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button
            onClick={approve}
            disabled={acting}
            className="h-12 rounded-[5px] bg-success text-background text-[14px] font-semibold tracking-wide disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {acting ? "Processing…" : "Grant clearance"}
          </button>
          <button
            onClick={deny}
            disabled={acting}
            className="h-12 rounded-[5px] border border-imperial text-imperial text-[14px] font-semibold tracking-wide disabled:opacity-50 transition-opacity hover:bg-imperial/10"
          >
            Deny
          </button>
        </div>
      ) : (
        <p
          className="text-[12px] text-foreground-muted italic"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Navigator access required to approve.
        </p>
      )}
    </div>
  );
}

export default function UnlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link href={`/hunt/${id}`}>
          <span
            className="text-[11px] tracking-[0.2em] uppercase text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← Hunt
          </span>
        </Link>
        <span
          className="text-[11px] tracking-[0.15em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Navigator Unlock
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center px-6">
        <Suspense fallback={<div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />}>
          <UnlockContent huntId={id} />
        </Suspense>
      </div>
    </div>
  );
}
