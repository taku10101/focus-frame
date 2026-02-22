export function getNextCellToReveal(revealedCells: number[], totalCells: number): number {
  const revealedSet = new Set(revealedCells);
  const unrevealed: number[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (!revealedSet.has(i)) {
      unrevealed.push(i);
    }
  }
  if (unrevealed.length === 0) {
    throw new Error("All cells already revealed");
  }
  return unrevealed[Math.floor(Math.random() * unrevealed.length)];
}
