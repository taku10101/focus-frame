"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadImage, pixelateImage } from "@/lib/pixelate";
import type { PixelData } from "@/types";

export function usePixelGrid(imagePath: string | null, gridSize: number) {
  const [grid, setGrid] = useState<PixelData[][] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imagePath) return;
    loadImage(imagePath).then((img) => {
      setGrid(pixelateImage(img, gridSize));
    });
  }, [imagePath, gridSize]);

  const drawGrid = useCallback(
    (revealedCells: number[], newlyRevealed?: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !grid) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const revealedSet = new Set(revealedCells);
      const cellSize = Math.floor(canvas.width / gridSize);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const cellIndex = y * gridSize + x;
          const cell = grid[y][x];

          if (revealedSet.has(cellIndex)) {
            ctx.fillStyle = `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
          } else {
            ctx.fillStyle = "#2A2A3C";
          }
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);

          if (cellIndex === newlyRevealed) {
            ctx.strokeStyle = "#6C5CE7";
            ctx.lineWidth = 2;
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }
    },
    [grid, gridSize],
  );

  return { grid, canvasRef, drawGrid };
}
