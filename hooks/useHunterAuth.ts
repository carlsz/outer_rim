"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signInAnonymously } from "@/lib/auth";
import type { Participant } from "@/lib/types";

export interface HunterAuthState {
  uid: string | null;
  participant: Participant | null;
  loading: boolean;
  needsName: boolean;
}

export function useHunterAuth(huntId: string): HunterAuthState {
  const [uid, setUid] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsName, setNeedsName] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;

    async function init() {
      try {
        const credential = await signInAnonymously();
        const { uid } = credential.user;
        if (cancelled) return;
        setUid(uid);

        const participantRef = doc(db, "hunts", huntId, "participants", uid);
        unsub = onSnapshot(participantRef, (snap) => {
          if (snap.exists()) {
            setParticipant(snap.data() as Participant);
            setNeedsName(false);
          } else {
            setParticipant(null);
            setNeedsName(true);
          }
          setLoading(false);
        });
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [huntId]);

  return { uid, participant, loading, needsName };
}
