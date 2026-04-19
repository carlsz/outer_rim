"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { scrambleReveal } from "@/lib/scramble";

type Stage = "hero" | "scrambling" | "typing" | "boot-terminal" | "brief" | "typing-brief" | "cta";

const SUBTITLE = "The Kessel Run, SLO edition.";
const BRIEF =
  "Eight real taco spots hidden across San Luis Obispo, each disguised as a Star Wars cantina. Unlock stops one by one. Earn your trail card. Achieve leaderboard glory. All in celebration of Cinco de Mayo and Revenge of the Fifth.";

export default function Home() {
  const [bootLine1, setBootLine1] = useState(false);
  const [bootLine2, setBootLine2] = useState(false);
  const [bootLine3, setBootLine3] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroTitle, setHeroTitle] = useState("\u00a0");
  const [heroTitleFlash, setHeroTitleFlash] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [briefText, setBriefText] = useState("");
  const [briefDone, setBriefDone] = useState(false);
  const [stage, setStage] = useState<Stage>("hero");

  useEffect(() => {
    // Hero appears immediately — no boot overlay
    const tHero = setTimeout(() => setHeroVisible(true), 50);

    const tScramble = setTimeout(() => {
      setStage("scrambling");
      scrambleReveal("Outer Rim", setHeroTitle, () => {
        setHeroTitleFlash(true);
        setTimeout(() => setHeroTitleFlash(false), 500);

        setTimeout(() => {
          setStage("typing");
          let i = 0;
          const subtitleId = setInterval(() => {
            i++;
            setSubtitle(SUBTITLE.slice(0, i));
            if (i >= SUBTITLE.length) {
              clearInterval(subtitleId);
              setTimeout(() => {
                // Terminal appears and runs boot sequence
                setStage("boot-terminal");
                setTimeout(() => setBootLine1(true), 300);
                setTimeout(() => setBootLine2(true), 700);
                setTimeout(() => setBootLine3(true), 1100);
                setTimeout(() => {
                  // Cross-fade to mission parameters
                  setStage("brief");
                  setTimeout(() => {
                    setStage("typing-brief");
                    let j = 0;
                    const briefId = setInterval(() => {
                      j++;
                      setBriefText(BRIEF.slice(0, j));
                      if (j >= BRIEF.length) {
                        clearInterval(briefId);
                        setBriefDone(true);
                        setTimeout(() => setStage("cta"), 300);
                      }
                    }, 18);
                  }, 150);
                }, 1700);
              }, 200);
            }
          }, 40);
        }, 150);
      });
    }, 150);

    return () => {
      clearTimeout(tHero);
      clearTimeout(tScramble);
    };
  }, []);

  const terminalVisible = stage === "boot-terminal" || stage === "brief" || stage === "typing-brief" || stage === "cta";
  const showBootContent = stage === "boot-terminal";
  const showMissionContent = stage === "brief" || stage === "typing-brief" || stage === "cta";

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center px-6 relative overflow-hidden">
      {/* Hero */}
      <div
        className="w-full max-w-[480px] md:max-w-[580px] flex flex-col items-center gap-8 text-center transition-all duration-500"
        style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {/* Holopuck + title as one visual unit */}
        <div className="flex flex-col items-center gap-4">
          <div className="hologram-pulse" style={{ animation: "hologram-pulse 3s ease-in-out infinite" }}>
            <Image
              src="/images/holopuck-taco.png"
              alt="Holographic taco"
              width={220}
              height={220}
              priority
              className="w-[220px] h-[220px] md:w-[280px] md:h-[280px]"
              style={{ mixBlendMode: "screen" }}
            />
          </div>

          {/* Hero title + subtitle */}
          <div className="flex flex-col gap-3 items-center">
            <h1
              className="text-[52px] md:text-[64px] leading-none font-bold transition-colors duration-500"
              style={{
                fontFamily: "Fraunces, serif",
                color: heroTitleFlash ? "var(--accent-cyan)" : "var(--foreground)",
              }}
            >
              {heroTitle}
            </h1>
            <p
              className="text-[18px] font-light italic text-gold"
              style={{ fontFamily: "Fraunces, serif", minHeight: "1.4em" }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Terminal — boot sequence then mission parameters */}
        <div
          className="w-full rounded-[3px] border bg-background px-4 py-4 text-left transition-all duration-400"
          style={{
            borderColor: "var(--border-strong)",
            fontFamily: "var(--font-mono)",
            opacity: terminalVisible ? 1 : 0,
            transform: terminalVisible ? "translateY(0)" : "translateY(4px)",
          }}
        >
          {/* Boot lines */}
          {showBootContent && (
            <div className="flex flex-col gap-2">
              <p
                className="text-[12px] tracking-[0.2em] uppercase transition-all duration-200"
                style={{
                  color: "var(--accent-gold)",
                  opacity: bootLine1 ? 1 : 0,
                  transform: bootLine1 ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                ⟶ Establishing secure channel...
              </p>
              <p
                className="text-[12px] tracking-[0.2em] uppercase transition-all duration-200"
                style={{
                  color: "var(--accent-gold)",
                  opacity: bootLine2 ? 1 : 0,
                  transform: bootLine2 ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                ⟶ Signal acquired
              </p>
              <p
                className="text-[12px] tracking-[0.2em] uppercase transition-all duration-200"
                style={{
                  color: "var(--accent-cyan)",
                  opacity: bootLine3 ? 1 : 0,
                  transform: bootLine3 ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                ⟶ Channel secure · Outer Rim Division
              </p>
            </div>
          )}

          {/* Mission parameters */}
          {showMissionContent && (
            <>
              <p
                className="text-[12px] tracking-[0.2em] uppercase mb-3"
                style={{ color: "var(--accent-cyan)" }}
              >
                Mission Parameters
              </p>
              <p className="text-[13px] leading-relaxed text-foreground-muted">
                {briefText}
                {!briefDone && stage === "typing-brief" && (
                  <span className="inline-block w-[7px] h-[13px] bg-cyan ml-[2px] align-middle cursor-blink" />
                )}
              </p>

              {/* CTA */}
              <div
                className="w-full mt-4 transition-all duration-300"
                style={{
                  opacity: stage === "cta" ? 1 : 0,
                  transform: stage === "cta" ? "translateY(0)" : "translateY(4px)",
                }}
              >
                <Link
                  href="/hunt/may5-2026"
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-[3px] text-[12px] font-medium tracking-[0.25em] uppercase transition-opacity hover:opacity-90 active:opacity-80"
                  style={{
                    fontFamily: "var(--font-mono)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--accent-cyan)",
                    color: "var(--accent-cyan)",
                  }}
                >
                  <span>⟶</span>
                  <span>Initiate Sequence</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="w-full flex flex-col gap-4 transition-opacity duration-400"
          style={{ opacity: stage === "cta" ? 1 : 0 }}
        >
          <p
            className="text-[12px] tracking-[0.15em] uppercase text-foreground-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            San Luis Obispo, CA · May 5, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
