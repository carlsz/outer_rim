"use client";

interface Props {
  huntId: string;
  userId: string;
  hunterName: string;
}

export default function HunterTrailCard({ huntId, userId, hunterName }: Props) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/crawl/${huntId}/${userId}`
      : "";

  function handleShare() {
    if (!shareUrl) return;
    if (navigator.share) {
      navigator.share({
        title: `${hunterName}'s Outer Rim Trail Card`,
        url: shareUrl,
      }).catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw err;
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="h-12 rounded-[5px] border border-gold text-gold text-[14px] font-semibold tracking-wide hover:bg-gold/10 transition-colors"
    >
      Share trail card
    </button>
  );
}
