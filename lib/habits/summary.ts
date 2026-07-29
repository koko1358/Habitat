import { getActiveHabits } from "@/lib/habits/service";
import { getCompletionsForHabits } from "@/lib/completions/service";
import { earliestLocalDateFor, toWeekStartsOn } from "@/lib/habits/today";
import { computeHabitStreak, flexibleStats } from "@/lib/streaks/streaks";
import { getLocalDateString } from "@/lib/timezone";
import type { Habit, Settings } from "@/types/domain";

export interface HabitStreakSummary {
  habit: Habit;
  /** Null for flexible habits, which don't have a missed-day streak concept. */
  currentStreak: number | null;
  /** Only populated for flexible habits. */
  flexibleActiveDays: number | null;
}

/**
 * Streak info for every active habit, unfiltered by today's schedule —
 * unlike `getTodaySummary` (lib/habits/today.ts), which only includes
 * habits scheduled for today. The Summary screen shows every habit
 * unconditionally, matching taphabit:design.html's Summary tab.
 */
export async function getHabitStreakSummaries(
  settings: Settings
): Promise<HabitStreakSummary[]> {
  const habits = await getActiveHabits();
  const today = getLocalDateString(new Date(), settings.timezone);
  const weekStartsOn = toWeekStartsOn(settings.weekStartsOn);
  const completionsByHabit = await getCompletionsForHabits(habits.map((h) => h.id));

  return habits.map((habit) => {
    const localDates = (completionsByHabit.get(habit.id) ?? []).map(
      (c) => c.localDate
    );
    const earliest = earliestLocalDateFor(habit, localDates, settings.timezone, today);

    const streak = computeHabitStreak({
      frequencyType: habit.frequencyType,
      selectedWeekdays: habit.selectedWeekdays,
      targetCount: habit.targetCount,
      completionDates: localDates,
      today,
      earliest,
      weekStartsOn,
    });

    const flexible =
      habit.frequencyType === "flexible"
        ? flexibleStats(localDates, today, earliest, weekStartsOn)
        : null;

    return {
      habit,
      currentStreak: streak?.current ?? null,
      flexibleActiveDays: flexible?.activeDays ?? null,
    };
  });
}
