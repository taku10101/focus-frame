"use client";

import { useEffect, useRef } from "react";
import type { PixelData } from "@/types";

interface PixelGridProps {
  grid: PixelData[][] | null;
  gridSize: number;
  revealedCells: number[];
  newlyRevealed?: number | null;
}

export function PixelGrid({ grid, gridSize, revealedCells, newlyRevealed }: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const revealedSet = new Set(revealedCells);
    const canvasSize = canvas.width;
    const cellSize = canvasSize / gridSize;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cellIndex = y * gridSize + x;
        const cell = grid[y][x];

        if (revealedSet.has(cellIndex)) {
          ctx.fillStyle = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
        } else {
          ctx.fillStyle = "#2A2A3C";
        }

        const gap = gridSize <= 10 ? 1 : 0;
        ctx.fillRect(
          x * cellSize + gap / 2,
          y * cellSize + gap / 2,
          cellSize - gap,
          cellSize - gap,
        );

        if (cellIndex === newlyRevealed) {
          ctx.strokeStyle = "#6C5CE7";
          ctx.lineWidth = 2;
          ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
        }
      }
    }
  }, [grid, gridSize, revealedCells, newlyRevealed]);

  if (!grid) {
    return (
      <div className="mx-auto aspect-square w-full max-w-sm rounded-lg bg-[#1A1A24] animate-pulse" />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="mx-auto aspect-square w-full max-w-sm rounded-lg"
      role="img"
      aria-label={`ドット絵グリッド: ${revealedCells.length}/${gridSize * gridSize}マス開放済み`}
    />
  );
}
