import { db, ensureSettings } from "@/lib/db/db";
import { BACKUP_VERSION, type BackupData } from "@/lib/backup/schema";

export async function buildBackup(): Promise<BackupData> {
  const [settings, habits, completions] = await Promise.all([
    ensureSettings(),
    db.habits.toArray(),
    db.habitCompletions.toArray(),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    habits,
    completions,
  };
}

export function backupFilename(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `tap-habit-backup-${y}-${m}-${d}.json`;
}

/** Triggers a browser download of the current data as a JSON file. */
export async function downloadBackup(filename = backupFilename()): Promise<void> {
  const backup = await buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
