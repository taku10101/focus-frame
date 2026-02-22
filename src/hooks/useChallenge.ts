"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { getNextCellToReveal } from "@/lib/reveal";
import type { Artwork, Challenge } from "@/types";

export function useChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadActiveChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const active = await db.challenges.where("status").equals("active").first();
      if (active) {
        setChallenge(active);
        const art = await db.artworks.get(active.artworkId);
        setArtwork(art ?? null);
      } else {
        setChallenge(null);
        setArtwork(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveChallenge();
  }, [loadActiveChallenge]);

  const startChallenge = useCallback(async (artworkId: string, gridSize: number) => {
    const id = crypto.randomUUID();
    const newChallenge: Challenge = {
      id,
      artworkId,
      gridSize,
      revealedCells: [],
      totalCells: gridSize * gridSize,
      status: "active",
      startedAt: Date.now(),
      sessionCount: 0,
    };
    await db.challenges.add(newChallenge);
    const art = await db.artworks.get(artworkId);
    setChallenge(newChallenge);
    setArtwork(art ?? null);
    return newChallenge;
  }, []);

  const revealCell = useCallback(async (): Promise<number | null> => {
    if (!challenge) return null;
    const cellIndex = getNextCellToReveal(challenge.revealedCells, challenge.totalCells);
    const updatedCells = [...challenge.revealedCells, cellIndex];
    const isCompleted = updatedCells.length >= challenge.totalCells;

    const updated: Challenge = {
      ...challenge,
      revealedCells: updatedCells,
      sessionCount: challenge.sessionCount + 1,
      status: isCompleted ? "completed" : "active",
      completedAt: isCompleted ? Date.now() : undefined,
    };

    await db.transaction("rw", [db.challenges, db.sessions], async () => {
      await db.challenges.put(updated);
      await db.sessions.add({
        id: crypto.randomUUID(),
        challengeId: challenge.id,
        startedAt: Date.now() - 25 * 60 * 1000,
        completedAt: Date.now(),
        duration: 1500,
        cellIndex,
      });
    });

    setChallenge(updated);
    return cellIndex;
  }, [challenge]);

  return {
    challenge,
    artwork,
    isLoading,
    startChallenge,
    revealCell,
    reload: loadActiveChallenge,
  };
}
