import { startOfWeek } from "date-fns";
import { getActiveHabits } from "@/lib/habits/service";
import { getCompletionsForHabits } from "@/lib/completions/service";
import { isHabitScheduledForDate } from "@/lib/habits/scheduling";
import { computeHabitStreak, flexibleStats } from "@/lib/streaks/streaks";
import {
  addLocalDays,
  formatLocalDate,
  parseLocalDate,
} from "@/lib/streaks/date-utils";
import { getLocalDateString } from "@/lib/timezone";
import type { Habit, HabitCompletion, HabitWithTodayStatus, Settings } from "@/types/domain";

export interface DayProgress {
  date: string;
  scheduledCount: number;
  completedCount: number;
  percentage: number;
}

export interface TodaySummary {
  habits: HabitWithTodayStatus[];
  scheduledCount: number;
  completedCount: number;
  completionPercentage: number;
  longestCurrentStreak: number;
  today: string;
  weeklyOverview: DayProgress[];
  insight: string | null;
}

export function toWeekStartsOn(value: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return (((value % 7) + 7) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function dayProgressFor(
  habits: Habit[],
  completionsByHabit: Map<string, HabitCompletion[]>,
  date: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
): DayProgress {
  const dateObj = parseLocalDate(date);
  const weekStart = formatLocalDate(startOfWeek(dateObj, { weekStartsOn }));

  let scheduledCount = 0;
  let completedCount = 0;

  for (const habit of habits) {
    const localDates = (completionsByHabit.get(habit.id) ?? []).map(
      (c) => c.localDate
    );
    const weeklySoFar = localDates.filter(
      (d) => d >= weekStart && d <= date
    ).length;
    const scheduled = isHabitScheduledForDate(habit, dateObj, weeklySoFar);
    if (!scheduled) continue;

    scheduledCount += 1;
    const countForDay =
      habit.frequencyType === "weekly_target"
        ? weeklySoFar
        : localDates.filter((d) => d === date).length;
    if (countForDay >= habit.targetCount) {
      completedCount += 1;
    }
  }

  return {
    date,
    scheduledCount,
    completedCount,
    percentage:
      scheduledCount === 0 ? 0 : Math.round((completedCount / scheduledCount) * 100),
  };
}

export function earliestLocalDateFor(
  habit: Pick<Habit, "createdAt">,
  localDates: string[],
  timezone: string,
  today: string
): string {
  const createdLocalDate = getLocalDateString(new Date(habit.createdAt), timezone);
  return [createdLocalDate, ...localDates].sort()[0] ?? today;
}

function buildHabitStatus(
  habit: Habit,
  completions: HabitCompletion[],
  today: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  timezone: string
): HabitWithTodayStatus {
  const todayDate = parseLocalDate(today);
  const localDates = completions.map((c) => c.localDate);
  const earliest = earliestLocalDateFor(habit, localDates, timezone, today);

  const weekStart = formatLocalDate(startOfWeek(todayDate, { weekStartsOn }));
  const weeklyCompletionsSoFar = localDates.filter(
    (d) => d >= weekStart && d <= today
  ).length;

  const isScheduledToday = isHabitScheduledForDate(
    habit,
    todayDate,
    weeklyCompletionsSoFar
  );

  const completionsToday = completions.filter((c) => c.localDate === today);
  const lastCompletion = completions
    .slice()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

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

  const completedCount =
    habit.frequencyType === "weekly_target"
      ? weeklyCompletionsSoFar
      : completionsToday.length;

  // Unlimited habits have no fixed target to reach — the day counts as
  // "done" once at least one completion has landed, same as any other
  // habit that doesn't cap out at a number.
  const isComplete = habit.unlimitedPerDay
    ? completedCount >= 1
    : completedCount >= habit.targetCount;

  return {
    ...habit,
    completionsToday,
    completedCount,
    isComplete,
    isScheduledToday,
    lastCompletedAt: lastCompletion?.completedAt ?? null,
    currentStreak: streak?.current ?? null,
    flexibleActiveDays: flexible?.activeDays ?? null,
  };
}

export async function getTodaySummary(settings: Settings): Promise<TodaySummary> {
  const habits = await getActiveHabits();
  const today = getLocalDateString(new Date(), settings.timezone);
  const weekStartsOn = toWeekStartsOn(settings.weekStartsOn);

  const completionsByHabit = await getCompletionsForHabits(habits.map((h) => h.id));

  const habitStatuses = habits.map((habit) =>
    buildHabitStatus(
      habit,
      completionsByHabit.get(habit.id) ?? [],
      today,
      weekStartsOn,
      settings.timezone
    )
  );

  const scheduledToday = habitStatuses.filter((h) => h.isScheduledToday);
  const completedToday = scheduledToday.filter((h) => h.isComplete);

  const streaksOnly = habitStatuses
    .map((h) => h.currentStreak)
    .filter((n): n is number => n !== null);
  const longestCurrentStreak = streaksOnly.length ? Math.max(...streaksOnly) : 0;

  const weeklyOverview: DayProgress[] = [];
  const previousWeek: DayProgress[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addLocalDays(today, -i);
    weeklyOverview.push(
      dayProgressFor(habits, completionsByHabit, date, weekStartsOn)
    );
  }
  for (let i = 13; i >= 7; i--) {
    const date = addLocalDays(today, -i);
    previousWeek.push(
      dayProgressFor(habits, completionsByHabit, date, weekStartsOn)
    );
  }

  const insight = buildInsight(weeklyOverview, previousWeek);

  return {
    habits: habitStatuses,
    scheduledCount: scheduledToday.length,
    completedCount: completedToday.length,
    completionPercentage:
      scheduledToday.length === 0
        ? 0
        : Math.round((completedToday.length / scheduledToday.length) * 100),
    longestCurrentStreak,
    today,
    weeklyOverview,
    insight,
  };
}

function buildInsight(
  thisWeek: DayProgress[],
  previousWeek: DayProgress[]
): string | null {
  const thisWeekScheduled = thisWeek.reduce((sum, d) => sum + d.scheduledCount, 0);
  const prevWeekScheduled = previousWeek.reduce((sum, d) => sum + d.scheduledCount, 0);

  // Not enough history yet to make a meaningful comparison.
  if (thisWeekScheduled === 0 || prevWeekScheduled === 0) {
    return null;
  }

  const thisWeekCompleted = thisWeek.reduce((sum, d) => sum + d.completedCount, 0);
  const prevWeekCompleted = previousWeek.reduce(
    (sum, d) => sum + d.completedCount,
    0
  );

  const thisWeekRate = thisWeekCompleted / thisWeekScheduled;
  const prevWeekRate = prevWeekCompleted / prevWeekScheduled;

  if (prevWeekRate === 0) {
    return null;
  }

  const change = Math.round(((thisWeekRate - prevWeekRate) / prevWeekRate) * 100);

  if (change === 0) {
    return "You're completing habits at the same rate as last week.";
  }

  return change > 0
    ? `You completed ${change}% more habits this week than last week.`
    : `You completed ${Math.abs(change)}% fewer habits this week than last week.`;
}
