"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface RebelBypassModalProps {
  open: boolean;
  onClose: () => void;
  onAdvance: () => Promise<void>;
  advancing: boolean;
  currentStop: number;
  totalStops: number;
}

export function RebelBypassModal({
  open,
  onClose,
  onAdvance,
  advancing,
  currentStop,
  totalStops,
}: RebelBypassModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleAdvance() {
    try {
      await onAdvance();
    } finally {
      onClose();
    }
  }

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
        style={{ borderTop: "1px dashed var(--accent-imperial, #ef4444)" }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <p
            className="text-[9px] tracking-[0.25em] uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "var(--accent-imperial, #ef4444)" }}
          >
            ▒ Rebel Bypass // Dev Only
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          className="text-[22px] font-bold text-foreground leading-none mb-1"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Force Advance
        </h2>
        <p
          className="text-[12px] text-foreground-muted mb-6"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Stop {String(currentStop).padStart(2, "0")} → {String(currentStop + 1).padStart(2, "0")} of {String(totalStops).padStart(2, "0")}
        </p>

        <button
          onClick={handleAdvance}
          disabled={advancing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[3px] text-[12px] tracking-[0.2em] uppercase transition-opacity hover:opacity-80 active:opacity-60 disabled:opacity-40 disabled:cursor-default"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--accent-imperial, #ef4444)",
            border: "1px solid var(--accent-imperial, #ef4444)",
            background: "var(--surface-elevated)",
          }}
        >
          <span>{advancing ? "⟳" : "⟶"}</span>
          <span>{advancing ? "Advancing…" : "Force Advance"}</span>
        </button>
      </div>
    </div>
  );
}
