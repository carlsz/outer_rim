import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminDb } from "@/lib/firebase-admin";
import type { SerializedParticipant } from "@/lib/types";
import tacoSpots from "@/tacoSpots.json";
import type { TacoSpot } from "@/lib/types";
import HunterTrailCard from "./HunterTrailCard";

const spotById = Object.fromEntries(
  (tacoSpots as TacoSpot[]).map((s) => [s.id, s])
);

export default async function HunterCrawlPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id: huntId, userId } = await params;

  const db = getAdminDb();

  const [huntSnap, participantSnap] = await Promise.all([
    db.collection("hunts").doc(huntId).get(),
    db.collection("hunts").doc(huntId).collection("participants").doc(userId).get(),
  ]);

  if (!huntSnap.exists || !participantSnap.exists) {
    notFound();
  }

  const huntData = huntSnap.data() as { stops: string[] };
  const p = participantSnap.data() as {
    name: string;
    claimedSpots: string[];
    claimedCount: number;
    joinedAt: FirebaseFirestore.Timestamp;
    completedAt?: FirebaseFirestore.Timestamp;
  };

  const participant: SerializedParticipant = {
    name: p.name,
    claimedSpots: p.claimedSpots,
    claimedCount: p.claimedCount,
    joinedAt: p.joinedAt.toMillis(),
    completedAt: p.completedAt?.toMillis(),
  };

  const claimedStops = p.claimedSpots
    .map((sid) => spotById[sid])
    .filter(Boolean) as TacoSpot[];

  const ogParams = new URLSearchParams({
    title: "The Kessel Run",
    subtitle: "Outer Rim // Taco Hunt",
    hunter: p.name,
    date: new Date(p.joinedAt.toMillis()).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  });
  claimedStops.slice(0, 5).forEach((s) => ogParams.append("stop", s.swAlias));
  const ogUrl = `/api/og?${ogParams.toString()}`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <Link href={`/hunt/${huntId}`}>
          <span
            className="text-[12px] tracking-[0.2em] uppercase text-cyan"
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

        {/* Hunter info */}
        <div className="flex flex-col gap-1">
          <p
            className="text-[12px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}
          >
            Hunter
          </p>
          <p className="text-[22px] font-bold text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
            {p.name}
          </p>
          {participant.completedAt ? (
            <p
              className="text-[12px] tracking-[0.2em] uppercase text-success"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ✓ Kessel Run complete · {new Date(participant.completedAt).toLocaleTimeString()}
            </p>
          ) : (
            <p
              className="text-[12px] tracking-[0.2em] uppercase text-foreground-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {participant.claimedCount} of {huntData.stops.length} stops claimed
            </p>
          )}
        </div>

        {/* Claimed stops list */}
        <div className="flex flex-col gap-2">
          {claimedStops.map((spot, i) => (
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

        {/* Share button (client component) */}
        <HunterTrailCard huntId={huntId} userId={userId} hunterName={p.name} />
      </div>
    </div>
  );
}
