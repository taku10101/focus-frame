"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Artwork, Challenge } from "@/types";

interface CollectionItem {
  challenge: Challenge;
  artwork: Artwork;
}

export default function CollectionPage() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const challenges = await db.challenges
        .where("status")
        .equals("completed")
        .reverse()
        .sortBy("completedAt");
      const results: CollectionItem[] = [];
      for (const challenge of challenges) {
        const artwork = await db.artworks.get(challenge.artworkId);
        if (artwork) {
          results.push({ challenge, artwork });
        }
      }
      setItems(results);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F13] px-4 pb-20 pt-4">
      <h1 className="mb-6 text-xl font-bold text-white">📚 コレクション</h1>

      {isLoading ? (
        <p className="text-center text-gray-400">読み込み中...</p>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="mb-4">まだ完成した作品はありません</p>
          <Link href="/select" className="text-violet-400 underline hover:text-violet-300">
            最初の絵を選ぶ →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(({ challenge, artwork }) => (
            <Link
              key={challenge.id}
              href={`/collection/${challenge.id}`}
              className="rounded-lg bg-[#1A1A24] p-3 transition hover:bg-[#252533]"
            >
              <div className="mb-2 aspect-square rounded bg-[#252533]" />
              <p className="text-sm font-semibold text-white">{artwork.title}</p>
              <p className="text-xs text-gray-500">{artwork.artist}</p>
              <p className="text-xs text-gray-600">
                {challenge.gridSize}×{challenge.gridSize} 完成
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
