"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChallenge } from "@/hooks/useChallenge";
import { db } from "@/lib/db";
import type { Artwork } from "@/types";

export default function SelectPage() {
  const router = useRouter();
  const { startChallenge } = useChallenge();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(8);

  useEffect(() => {
    db.artworks.toArray().then(setArtworks);
  }, []);

  const artists = useMemo(() => [...new Set(artworks.map((a) => a.artist))], [artworks]);
  const genres = useMemo(() => [...new Set(artworks.flatMap((a) => a.genre))], [artworks]);
  const eras = useMemo(() => [...new Set(artworks.map((a) => a.era))], [artworks]);

  const filtered = useMemo(() => {
    return artworks.filter((a) => {
      if (selectedArtist && a.artist !== selectedArtist) return false;
      if (selectedGenre && !a.genre.includes(selectedGenre)) return false;
      if (selectedEra && a.era !== selectedEra) return false;
      return true;
    });
  }, [artworks, selectedArtist, selectedGenre, selectedEra]);

  const handleStart = useCallback(async () => {
    if (filtered.length === 0) return;
    const artwork = filtered[Math.floor(Math.random() * filtered.length)];
    await startChallenge(artwork.id, gridSize);
    router.push("/");
  }, [filtered, gridSize, startChallenge, router]);

  return (
    <div className="min-h-screen bg-[#0F0F13] px-4 pb-20 pt-4">
      <h1 className="mb-6 text-xl font-bold text-white">🎨 絵を選ぶ</h1>

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-400">作者</h2>
        <div className="flex flex-wrap gap-2">
          {artists.map((artist) => (
            <button
              type="button"
              key={artist}
              onClick={() => setSelectedArtist(selectedArtist === artist ? null : artist)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                selectedArtist === artist
                  ? "bg-violet-600 text-white"
                  : "bg-[#1A1A24] text-gray-300 hover:bg-[#252533]"
              }`}
            >
              {artist}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-400">ジャンル</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              type="button"
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                selectedGenre === genre
                  ? "bg-violet-600 text-white"
                  : "bg-[#1A1A24] text-gray-300 hover:bg-[#252533]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-400">時代</h2>
        <div className="flex flex-wrap gap-2">
          {eras.map((era) => (
            <button
              type="button"
              key={era}
              onClick={() => setSelectedEra(selectedEra === era ? null : era)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                selectedEra === era
                  ? "bg-violet-600 text-white"
                  : "bg-[#1A1A24] text-gray-300 hover:bg-[#252533]"
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-400">マス数</h2>
        <div className="flex gap-3">
          {[5, 8, 10].map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => setGridSize(size)}
              className={`flex-1 rounded-lg py-3 text-center transition ${
                gridSize === size
                  ? "border-2 border-violet-500 bg-[#1A1A24] text-white"
                  : "border border-gray-700 bg-[#1A1A24] text-gray-400 hover:border-gray-500"
              }`}
            >
              <div className="text-lg font-bold">
                {size}×{size}
              </div>
              <div className="text-xs text-gray-500">{size * size}マス</div>
            </button>
          ))}
        </div>
      </section>

      <div className="rounded-lg bg-[#1A1A24] p-4 text-center">
        <p className="text-sm text-gray-400">
          条件に合う作品: <span className="text-white">{filtered.length}点</span>
        </p>
        <p className="mt-1 text-xs text-gray-600">何の絵かはお楽しみ 🎁</p>
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={filtered.length === 0}
        className="mt-4 w-full rounded-full bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🎲 ランダムに1枚選ぶ
      </button>
    </div>
  );
}
