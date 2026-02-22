"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Artwork, Challenge } from "@/types";

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    (async () => {
      const c = await db.challenges.get(id);
      if (c) {
        setChallenge(c);
        const a = await db.artworks.get(c.artworkId);
        setArtwork(a ?? null);
      }
    })();
  }, [id]);

  if (!challenge || !artwork) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F0F13]">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const totalMinutes = challenge.sessionCount * 25;

  return (
    <div className="min-h-screen bg-[#0F0F13] px-4 pb-20 pt-4">
      <Link href="/collection" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">
        ← コレクションに戻る
      </Link>

      <div className="mx-auto mb-6 aspect-square max-w-sm rounded-lg bg-[#1A1A24]" />

      <div className="rounded-lg bg-[#1A1A24] p-4">
        <h1 className="mb-1 text-2xl font-bold text-white">{artwork.title}</h1>
        <p className="mb-4 text-gray-400">{artwork.titleEn}</p>

        <div className="space-y-2 text-sm">
          <p className="text-gray-300">🎨 作者: {artwork.artist}</p>
          <p className="text-gray-300">🖼 ジャンル: {artwork.genre.join("・")}</p>
          <p className="text-gray-300">
            📅 完成日:{" "}
            {challenge.completedAt
              ? new Date(challenge.completedAt).toLocaleDateString("ja-JP")
              : "-"}
          </p>
          <p className="text-gray-300">
            ⏱ セッション: {challenge.sessionCount}回 ({totalMinutes}分)
          </p>
          <p className="text-gray-300">
            🔲 マス数: {challenge.gridSize}×{challenge.gridSize}
          </p>
        </div>
      </div>
    </div>
  );
}
