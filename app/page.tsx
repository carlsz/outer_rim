import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center px-6">
      <div className="w-full max-w-[480px] flex flex-col items-center gap-8 text-center">
        {/* Eyebrow */}
        <p
          className="text-[11px] tracking-[0.25em] uppercase text-gold font-mono"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Outer Rim // SLO
        </p>

        {/* Hero title */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-[52px] leading-none font-bold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Taco Hunt
          </h1>
          <p
            className="text-[18px] font-light italic text-gold"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            The Kessel Run, SLO edition.
          </p>
        </div>

        {/* Description */}
        <p className="text-[15px] leading-relaxed text-foreground-muted max-w-[340px]">
          Eight real taco spots hidden across San Luis Obispo, each disguised as
          a Star Wars cantina. Unlock stops one by one. Earn your trail card.
        </p>

        {/* CTA */}
        <Link
          href="/hunt/may5-2026"
          className="w-full flex items-center justify-center h-12 rounded-[5px] text-[14px] font-semibold tracking-wide text-background bg-gold transition-opacity hover:opacity-90 active:opacity-80"
        >
          Begin the Hunt
        </Link>

        {/* Divider */}
        <div className="w-full border-t border-border" />

        {/* Footer label */}
        <p
          className="text-[11px] tracking-[0.15em] uppercase text-foreground-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          San Luis Obispo · May 5, 2026
        </p>
      </div>
    </div>
  );
}
