import type { PixelData } from "@/types";

export function pixelateImage(image: HTMLImageElement, gridSize: number): PixelData[][] {
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(image, 0, 0, gridSize, gridSize);
  const imageData = ctx.getImageData(0, 0, gridSize, gridSize);

  const grid: PixelData[][] = [];
  for (let y = 0; y < gridSize; y++) {
    const row: PixelData[] = [];
    for (let x = 0; x < gridSize; x++) {
      const i = (y * gridSize + x) * 4;
      row.push({
        r: imageData.data[i],
        g: imageData.data[i + 1],
        b: imageData.data[i + 2],
      });
    }
    grid.push(row);
  }
  return grid;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
