"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "unauthorized" | "unconfigured">(
    "loading"
  );
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      const currentUid = user?.uid ?? null;
      setUid(currentUid);
      if (!ADMIN_UID) {
        setStatus("unconfigured");
      } else if (currentUid === ADMIN_UID) {
        setStatus("ok");
      } else {
        setStatus("unauthorized");
      }
    });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p
          className="text-[12px] tracking-[0.2em] uppercase text-imperial"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          NEXT_PUBLIC_ADMIN_UID not configured
        </p>
        <p className="text-[13px] text-foreground-muted">Your current uid:</p>
        <code
          className="text-gold px-3 py-1 rounded text-[13px]"
          style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}
        >
          {uid ?? "not authenticated — visit /hunt/may5-2026 first"}
        </code>
        <p className="text-[12px] text-foreground-muted text-center max-w-[380px]">
          Add <code className="text-gold">NEXT_PUBLIC_ADMIN_UID={uid}</code> and{" "}
          <code className="text-gold">ADMIN_UID={uid}</code> to .env.local and restart.
        </p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p
          className="text-[12px] tracking-[0.2em] uppercase text-imperial"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Unauthorized
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
