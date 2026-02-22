export interface PixelData {
  r: number;
  g: number;
  b: number;
}

export interface Artwork {
  id: string;
  artist: string;
  artistEn: string;
  genre: string[];
  era: string;
  title: string;
  titleEn: string;
  imagePath: string;
  sourceUrl: string;
  minGrid: number;
  year: number;
}

export interface Challenge {
  id: string;
  artworkId: string;
  gridSize: number;
  revealedCells: number[];
  totalCells: number;
  status: "active" | "completed" | "abandoned";
  startedAt: number;
  completedAt?: number;
  sessionCount: number;
}

export interface Session {
  id: string;
  challengeId: string;
  startedAt: number;
  completedAt: number;
  duration: number;
  cellIndex: number;
}

export interface UserSettings {
  key: string;
  timerDuration: number;
  breakDuration: number;
  defaultGridSize: number;
  notificationEnabled: boolean;
  theme: "light" | "dark" | "system";
}
