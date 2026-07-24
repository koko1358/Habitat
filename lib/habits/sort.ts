import type { HabitWithTodayStatus } from "@/types/domain";

function statusRank(habit: HabitWithTodayStatus): number {
  if (habit.isComplete) return 2;
  if (habit.completedCount > 0) return 1;
  return 0;
}

/** Incomplete first, then partially completed, then completed — each group by reminder time. */
export function sortHabitsForDashboard(
  habits: HabitWithTodayStatus[]
): HabitWithTodayStatus[] {
  return [...habits].sort((a, b) => {
    const rankDiff = statusRank(a) - statusRank(b);
    if (rankDiff !== 0) return rankDiff;

    if (a.reminderTime && b.reminderTime) {
      return a.reminderTime.localeCompare(b.reminderTime);
    }
    if (a.reminderTime) return -1;
    if (b.reminderTime) return 1;
    return a.name.localeCompare(b.name);
  });
}
