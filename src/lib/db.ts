import Dexie, { type Table } from "dexie";
import { INITIAL_ARTWORKS } from "@/data/artworks";
import type { Artwork, Challenge, Session, UserSettings } from "@/types";

export class FocusFrameDB extends Dexie {
  artworks!: Table<Artwork>;
  challenges!: Table<Challenge>;
  sessions!: Table<Session>;
  settings!: Table<UserSettings>;

  constructor() {
    super("FocusFrameDB");

    this.version(1).stores({
      artworks: "id, artist, era, *genre",
      challenges: "id, artworkId, status, startedAt",
      sessions: "id, challengeId, completedAt",
      settings: "key",
    });
  }
}

export const db = new FocusFrameDB();

db.on("populate", async () => {
  await db.artworks.bulkAdd(INITIAL_ARTWORKS);
  await db.settings.add({
    key: "user_settings",
    timerDuration: 1500,
    breakDuration: 300,
    defaultGridSize: 8,
    notificationEnabled: true,
    theme: "system",
  });
});
