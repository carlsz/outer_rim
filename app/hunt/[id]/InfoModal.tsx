"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Decode the transmission",
    body: "Each stop hides a Star Wars–themed clue pointing to a real taco spot in SLO. Tap to decode it.",
  },
  {
    n: "02",
    title: "Get to the location",
    body: "Follow the clue to the spot. Use the map or tap Get Directions on the stop card.",
  },
  {
    n: "03",
    title: "Claim the stop",
    body: "Once you're there, tap Claim This Stop. Your location is verified automatically.",
  },
  {
    n: "04",
    title: "Earn your trail card",
    body: "Finish all eight stops and unlock your collectible Outer Rim trail card.",
  },
];

export function InfoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
        className={`relative w-full bg-surface rounded-t-2xl px-6 pt-6 pb-10 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[22px] font-bold text-foreground leading-none"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <ol className="flex flex-col gap-5">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-4 items-start">
              <span
                className="text-[12px] tracking-[0.2em] text-cyan shrink-0 pt-[3px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {step.n}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-[14px] font-semibold text-foreground leading-snug">
                  {step.title}
                </p>
                <p className="text-[13px] text-foreground-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Bottom label */}
        <p
          className="mt-8 text-[12px] tracking-[0.2em] uppercase text-foreground-muted text-center"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Outer Rim // SLO · May 5, 2026
        </p>
      </div>
    </div>
  );
}
