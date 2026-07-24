import type { Habit } from "@/types/domain";

/**
 * Determines whether a habit is scheduled to appear on a given local date.
 *
 * `weeklyCompletionsSoFar` is only relevant for `weekly_target` habits: once
 * the target is reached for the week, the habit stops being "scheduled" for
 * the remaining days (it's already done for the week).
 */
export function isHabitScheduledForDate(
  habit: Pick<
    Habit,
    "frequencyType" | "selectedWeekdays" | "targetCount"
  >,
  date: Date,
  weeklyCompletionsSoFar = 0
): boolean {
  switch (habit.frequencyType) {
    case "daily":
      return true;
    case "weekdays":
      return habit.selectedWeekdays.includes(date.getDay());
    case "weekly_target":
      return weeklyCompletionsSoFar < habit.targetCount;
    case "flexible":
      return true;
  }
}

/** Flexible habits never "fail" a scheduled day, so they're excluded from miss-based streaks. */
export function countsTowardMissableStreak(
  frequencyType: Habit["frequencyType"]
): boolean {
  return frequencyType !== "flexible";
}
