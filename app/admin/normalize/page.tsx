"use client";

import { useRef, useState } from "react";
import type { NormalizedItem } from "@/app/api/normalize/route";

type Mode = "text" | "photo";

interface ImagePayload {
  base64: string;
  mediaType: string;
  preview: string;
}

export default function NormalizePage() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [image, setImage] = useState<ImagePayload | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NormalizedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [prefix, base64] = dataUrl.split(",");
      const mediaType = prefix.replace("data:", "").replace(";base64", "");
      setImage({ base64, mediaType, preview: dataUrl });
      setItems(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleNormalize() {
    setLoading(true);
    setItems(null);
    setError(null);

    const body =
      mode === "photo" && image
        ? { image: image.base64, mediaType: image.mediaType }
        : { text };

    try {
      const res = await fetch("/api/normalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_KEY ?? "",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "normalization failed");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !loading && (mode === "text" ? text.trim().length > 0 : image !== null);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono text-foreground-muted tracking-widest uppercase mb-1">
          Admin // AI Tools
        </p>
        <h1
          className="text-3xl text-foreground"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Menu Normalizer
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Paste raw menu text or upload a photo — Claude extracts structured
          item data.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="flex mb-6 border rounded-md overflow-hidden"
        style={{ borderColor: "var(--border-strong)" }}
      >
        {(["text", "photo"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setItems(null);
              setError(null);
            }}
            className="flex-1 py-2 text-xs font-mono tracking-widest uppercase transition-colors"
            style={{
              background: mode === m ? "var(--accent-gold)" : "var(--surface)",
              color: mode === m ? "#0a0b0d" : "var(--foreground-muted)",
            }}
          >
            {m === "text" ? "✦ Text" : "⬡ Photo"}
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === "text" ? (
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setItems(null);
            setError(null);
          }}
          placeholder={"Al Pastor $3.50\nCarnitas Taco $4\nHorchata\nChips & Salsa 2.75"}
          rows={8}
          className="w-full rounded-md p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1"
          style={{
            background: "var(--surface-elevated)",
            color: "var(--foreground)",
            border: "1px solid var(--border-strong)",
            caretColor: "var(--accent-gold)",
            // @ts-expect-error custom prop
            "--tw-ring-color": "var(--accent-gold)",
          }}
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) loadFile(file);
          }}
          className="relative rounded-md cursor-pointer overflow-hidden transition-all"
          style={{
            border: `2px dashed ${dragging ? "var(--accent-gold)" : "var(--border-strong)"}`,
            background: dragging ? "rgba(201,168,76,0.05)" : "var(--surface-elevated)",
            minHeight: "200px",
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.preview}
              alt="Menu preview"
              className="w-full object-contain max-h-72"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-2 select-none">
              <span className="text-3xl opacity-40">⬡</span>
              <p className="text-sm text-foreground-muted">
                Drop a menu photo or click to browse
              </p>
              <p className="text-xs text-foreground-muted opacity-60">
                JPG, PNG, WEBP
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
          {image && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setItems(null);
                setError(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute top-2 right-2 text-xs font-mono px-2 py-1 rounded"
              style={{
                background: "rgba(10,11,13,0.8)",
                color: "var(--foreground-muted)",
                border: "1px solid var(--border-strong)",
              }}
            >
              ✕ clear
            </button>
          )}
        </div>
      )}

      {/* Normalize button */}
      <button
        onClick={handleNormalize}
        disabled={!canSubmit}
        className="mt-4 w-full py-3 rounded-md text-sm font-mono tracking-widest uppercase transition-opacity"
        style={{
          background: canSubmit ? "var(--accent-gold)" : "var(--surface-elevated)",
          color: canSubmit ? "#0a0b0d" : "var(--foreground-muted)",
          opacity: loading ? 0.7 : 1,
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        {loading ? (
          <span>
            Decoding transmission
            <span className="cursor-blink">_</span>
          </span>
        ) : (
          "⟶ Normalize"
        )}
      </button>

      {/* Error */}
      {error && (
        <p
          className="mt-4 text-sm font-mono px-4 py-3 rounded-md"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "var(--accent-red)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          ✕ {error}
        </p>
      )}

      {/* Results table */}
      {items && items.length > 0 && (
        <div
          className="mt-6 rounded-md overflow-hidden"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          <div
            className="px-4 py-2 flex items-center gap-2"
            style={{ background: "var(--surface)" }}
          >
            <span
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--accent-gold)" }}
            >
              ✦ {items.length} items decoded
            </span>
          </div>
          <table className="w-full font-mono text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  className="text-left px-4 py-2 text-xs tracking-widest uppercase"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Item
                </th>
                <th
                  className="text-right px-4 py-2 text-xs tracking-widest uppercase"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < items.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)",
                  }}
                >
                  <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                    {item.name}
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{
                      color:
                        item.price !== null
                          ? "var(--accent-gold)"
                          : "var(--foreground-muted)",
                    }}
                  >
                    {item.price !== null ? `$${item.price.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
