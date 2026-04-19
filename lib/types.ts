export interface TacoSpot {
  id: string;
  name: string;
  swAlias: string;
  address: string;
  lat: number;
  lng: number;
  spiceRating: 1 | 2 | 3 | 4 | 5;
  tagline: string;
  clueHint?: string;
}

export interface Hunt {
  id: string;
  /** Ordered tacoSpot IDs — array index = stop number */
  stops: string[];
  /** stops[0..unlockedCount-1] are visible on the map */
  unlockedCount: number;
  /** Index of the stop currently awaiting unlock, or null */
  pendingStop: number | null;
  /** UUID that grants approve access via /hunt/[id]/unlock?token=... */
  navigatorToken: string | null;
  status: "active" | "complete";
  trailCardUrl?: string;
  /** AI-generated clues keyed by tacoSpot ID — cached after first generation */
  clues?: Record<string, string>;
  /** Structural shape shared by firebase/firestore and firebase-admin Timestamp */
  createdAt: { seconds: number; nanoseconds: number } | Date;
}

export interface Participant {
  name: string;
  claimedSpots: string[];
  claimedCount: number;
  joinedAt: { seconds: number; nanoseconds: number };
  completedAt?: { seconds: number; nanoseconds: number };
}

export interface SerializedParticipant {
  name: string;
  claimedSpots: string[];
  claimedCount: number;
  joinedAt: number;
  completedAt?: number;
}
