"use client";

import { useState } from "react";
import { getIdToken } from "@/lib/auth";
interface Props {
  uid: string;
  huntId: string;
  onJoined: () => void;
}

export default function HunterName({ uid, huntId, onJoined }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim() || `Hunter #${uid.slice(0, 4)}`;
    setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ huntId, name: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to join");
      }

      onJoined();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{
          background: "#12151a",
          borderColor: "rgba(232,223,200,0.16)",
        }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "#c9a84c", fontFamily: "DM Sans, sans-serif" }}
        >
          Outer Rim Hunt
        </p>
        <h2
          className="text-2xl mb-6"
          style={{ color: "#e8dfc8", fontFamily: "Fraunces, serif" }}
        >
          What&rsquo;s your hunter name?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Hunter #${uid.slice(0, 4)}`}
            maxLength={32}
            className="w-full px-4 py-3 rounded text-base outline-none focus:ring-1"
            style={{
              background: "#1c2028",
              color: "#e8dfc8",
              border: "1px solid rgba(232,223,200,0.16)",
              fontFamily: "DM Sans, sans-serif",
              caretColor: "#4db8c8",
            }}
          />

          {error && (
            <p className="text-sm" style={{ color: "#ef4444", fontFamily: "DM Sans, sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-medium text-base transition-opacity disabled:opacity-50"
            style={{
              background: "#c9a84c",
              color: "#0a0b0d",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {loading ? "Joining…" : "Join the Hunt"}
          </button>
        </form>
      </div>
    </div>
  );
}
