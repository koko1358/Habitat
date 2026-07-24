import { db } from "@/lib/db/db";
import { backupSchema, type BackupData } from "@/lib/backup/schema";
import { downloadBackup, backupFilename } from "@/lib/backup/export";

export interface ParsedBackup {
  data: BackupData;
  habitCount: number;
  completionCount: number;
}

export function parseBackupFile(jsonText: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  const result = backupSchema.safeParse(raw);
  if (!result.success) {
    throw new Error("That file doesn't look like a TapHabit backup.");
  }

  return {
    data: result.data,
    habitCount: result.data.habits.length,
    completionCount: result.data.completions.length,
  };
}

export type ImportMode = "merge" | "replace";

export interface ImportResult {
  habitsImported: number;
  completionsImported: number;
  habitsSkipped: number;
  completionsSkipped: number;
}

export async function importBackup(
  data: BackupData,
  mode: ImportMode
): Promise<ImportResult> {
  if (mode === "replace") {
    // Safety net: always snapshot what's about to be overwritten.
    await downloadBackup(backupFilename(new Date()).replace(".json", "-before-import.json"));
  }

  return db.transaction(
    "rw",
    db.settings,
    db.habits,
    db.habitCompletions,
    async () => {
      if (mode === "replace") {
        await db.habits.clear();
        await db.habitCompletions.clear();
      }

      await db.settings.put(data.settings);

      let habitsImported = 0;
      let habitsSkipped = 0;
      for (const habit of data.habits) {
        const exists = mode === "merge" ? await db.habits.get(habit.id) : undefined;
        if (exists) {
          habitsSkipped += 1;
          continue;
        }
        await db.habits.put(habit);
        habitsImported += 1;
      }

      let completionsImported = 0;
      let completionsSkipped = 0;
      for (const completion of data.completions) {
        const exists =
          mode === "merge" ? await db.habitCompletions.get(completion.id) : undefined;
        if (exists) {
          completionsSkipped += 1;
          continue;
        }
        await db.habitCompletions.put(completion);
        completionsImported += 1;
      }

      return {
        habitsImported,
        habitsSkipped,
        completionsImported,
        completionsSkipped,
      };
    }
  );
}

export async function resetAllData(): Promise<void> {
  await db.transaction("rw", db.settings, db.habits, db.habitCompletions, async () => {
    await db.habits.clear();
    await db.habitCompletions.clear();
    await db.settings.clear();
  });
}
