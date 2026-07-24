export type HabitFrequencyType = "daily" | "weekdays" | "weekly_target" | "flexible";

/** Only "manual" is produced today; the rest are reserved for the future NFC/Shortcuts flow. See FUTURE_NFC.md. */
export type CompletionSource = "manual" | "nfc" | "shortcut" | "imported";

export type ThemePreference = "light" | "dark" | "system";

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  frequencyType: HabitFrequencyType;
  targetCount: number;
  selectedWeekdays: number[];
  allowMultiplePerDay: boolean;
  /** Whether completions beyond `targetCount` in a day are accepted. */
  allowOvershoot: boolean;
  reminderTime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  localDate: string;
  source: CompletionSource;
  deletedAt: string | null;
}

/** A habit joined with its completion state for a single local day. */
export interface HabitWithTodayStatus extends Habit {
  completionsToday: HabitCompletion[];
  /** Progress toward `targetCount` — today's count normally, this week's for weekly_target habits. */
  completedCount: number;
  isComplete: boolean;
  isScheduledToday: boolean;
  lastCompletedAt: string | null;
  /** Null for flexible habits, which don't have a missed-day streak concept. */
  currentStreak: number | null;
  /** Only populated for flexible habits. */
  flexibleActiveDays: number | null;
}

export interface HistoryEntry {
  completion: HabitCompletion;
  habit: Pick<Habit, "id" | "name" | "icon" | "category" | "isActive">;
}

export interface NfcSticker {
  id: string;
  habitId: string;
  stickerName: string;
  room: string;
  /** Secure random token embedded in the tap URL (`/tap/[token]`). */
  token: string;
  createdAt: string;
  updatedAt: string;
  lastTappedAt: string | null;
  active: boolean;
}

export interface Settings {
  id: "local";
  displayName: string;
  timezone: string;
  weekStartsOn: number;
  theme: ThemePreference;
  confirmBeforeDelete: boolean;
  createdAt: string;
  updatedAt: string;
}
