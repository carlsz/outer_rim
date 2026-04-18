"use client";

import { useEffect, useState } from "react";

interface ClueTerminalProps {
  clue: string | null;
  loading: boolean;
  decoded: boolean;
  onTransmissionDecoded?: () => void;
}

export function ClueTerminal({ clue, loading, decoded, onTransmissionDecoded }: ClueTerminalProps) {
  const [displayed, setDisplayed] = useState("");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!clue || !decoded) return;
    setDisplayed("");
    setAnimating(true);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(clue.slice(0, i));
      if (i >= clue.length) {
        clearInterval(id);
        setAnimating(false);
        onTransmissionDecoded?.();
      }
    }, 40);
    return () => clearInterval(id);
  }, [clue, decoded]);

  const label = !decoded
    ? "Intercepted Transmission"
    : loading
      ? "Intercepting transmission…"
      : animating
        ? "Decoding transmission…"
        : "Transmission decoded";

  const labelColor = decoded ? "var(--accent-cyan)" : "var(--accent-gold)";

  return (
    <div
      className="rounded-[3px] border border-border bg-background px-4 py-3 mt-3"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <p
        className="text-[11px] tracking-[0.2em] uppercase mb-2 transition-colors duration-300"
        style={{ color: labelColor }}
      >
        {label}
      </p>

      {!decoded && (
        <p className="text-[13px] text-foreground-muted opacity-40 tracking-widest">
          [ SIGNAL ENCRYPTED ]
        </p>
      )}

      {decoded && loading && (
        <p className="text-[13px] text-foreground-muted">
          <span className="inline-block w-2 h-3 bg-cyan mr-1 cursor-blink" />
          Intercepting…
        </p>
      )}

      {decoded && !loading && clue && (
        <p className="text-[13px] leading-relaxed text-foreground">
          {displayed}
          {animating && (
            <span className="inline-block w-[7px] h-[13px] bg-cyan ml-[2px] cursor-blink align-middle" />
          )}
        </p>
      )}
    </div>
  );
}
