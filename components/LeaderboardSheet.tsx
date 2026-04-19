"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import Leaderboard from "./Leaderboard";

interface Props {
  open: boolean;
  onClose: () => void;
  huntId: string;
  totalStops: number;
  currentUid?: string | null;
}

export function LeaderboardSheet({ open, onClose, huntId, totalStops, currentUid }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full md:max-w-[580px] md:mx-auto md:rounded-2xl bg-surface rounded-t-2xl px-6 pt-8 pb-10 transition-transform duration-300 ease-out max-h-[70vh] flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h2
            className="text-[22px] font-bold text-foreground leading-none"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Leaderboard
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={`/hunt/${huntId}/leaderboard`}
              className="text-[12px] tracking-[0.12em] uppercase"
              style={{ color: "var(--foreground-muted)", fontFamily: "var(--font-mono)" }}
              onClick={onClose}
            >
              full view →
            </Link>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-foreground-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1">
          <Leaderboard huntId={huntId} totalStops={totalStops} currentUid={currentUid} />
        </div>
      </div>
    </div>
  );
}
