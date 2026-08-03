import { z } from "zod";

export const BACKUP_VERSION = 1;

const habitBackupSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.string(),
  frequencyType: z.enum(["daily", "weekdays", "weekly_target", "flexible"]),
  targetCount: z.number().int().min(1),
  selectedWeekdays: z.array(z.number().int().min(0).max(6)),
  allowMultiplePerDay: z.boolean(),
  allowOvershoot: z.boolean().default(true),
  unlimitedPerDay: z.boolean().default(false),
  reminderTime: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const completionBackupSchema = z.object({
  id: z.string().min(1),
  habitId: z.string().min(1),
  completedAt: z.string(),
  localDate: z.string(),
  source: z.enum(["manual", "nfc", "shortcut", "imported"]),
  deletedAt: z.string().nullable(),
});

const settingsBackupSchema = z.object({
  id: z.literal("local"),
  displayName: z.string(),
  timezone: z.string(),
  weekStartsOn: z.number().int().min(0).max(1),
  theme: z.enum(["light", "dark", "system"]),
  confirmBeforeDelete: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupSchema = z.object({
  version: z.number().int(),
  exportedAt: z.string(),
  settings: settingsBackupSchema,
  habits: z.array(habitBackupSchema),
  completions: z.array(completionBackupSchema),
});

export type BackupData = z.infer<typeof backupSchema>;
