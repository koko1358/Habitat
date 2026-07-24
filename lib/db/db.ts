import Dexie, { type EntityTable } from "dexie";
import type { Habit, HabitCompletion, NfcSticker, Settings } from "@/types/domain";

export class TapHabitDB extends Dexie {
  settings!: EntityTable<Settings, "id">;
  habits!: EntityTable<Habit, "id">;
  habitCompletions!: EntityTable<HabitCompletion, "id">;
  nfcStickers!: EntityTable<NfcSticker, "id">;

  constructor() {
    super("taphabit");

    this.version(1).stores({
      settings: "id",
      habits: "id, category, createdAt",
      // `deletedAt` is usually null, which isn't a valid IndexedDB key, so it
      // isn't indexed — active/soft-deleted filtering happens in JS instead.
      habitCompletions:
        "id, habitId, completedAt, localDate, source, [habitId+localDate]",
    });

    // v2 adds NFC sticker management. Dexie only needs the tables that are
    // new or changed here — settings/habits/habitCompletions carry over
    // unchanged from v1 automatically.
    // `active` isn't indexed for the same reason as `deletedAt` above
    // (booleans aren't reliable IndexedDB keys) — filtered in JS instead.
    this.version(2).stores({
      nfcStickers: "id, habitId, &token, createdAt",
    });
  }
}

// A single shared instance — IndexedDB is only available in the browser, so
// this must never be imported from a Server Component. Every page that uses
// it is a Client Component ("use client").
export const db = new TapHabitDB();

export const SETTINGS_ID = "local" as const;

export const DEFAULT_TIMEZONE = "Asia/Manila";

export async function ensureSettings(): Promise<Settings> {
  const existing = await db.settings.get(SETTINGS_ID);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: Settings = {
    id: SETTINGS_ID,
    displayName: "",
    timezone: DEFAULT_TIMEZONE,
    weekStartsOn: 0,
    theme: "system",
    confirmBeforeDelete: true,
    createdAt: now,
    updatedAt: now,
  };
  await db.settings.add(created);
  return created;
}
