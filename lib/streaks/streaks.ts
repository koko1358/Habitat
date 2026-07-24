import { addDays, addWeeks, getDay, isAfter, startOfWeek } from "date-fns";
import {
  addLocalDays,
  formatLocalDate,
  parseLocalDate,
  type LocalDateString,
} from "@/lib/streaks/date-utils";
import type { HabitFrequencyType } from "@/types/domain";

export interface StreakResult {
  /** The active streak as of `today` (leniently ignoring an incomplete today/this-week). */
  current: number;
  /** The longest streak ever achieved across the scanned history. */
  longest: number;
}

export interface FlexibleStats {
  activeDays: number;
  totalCompletions: number;
  /** Fraction (0-1) of weeks, since the earliest activity, with at least one completion. */
  weeklyConsistency: number;
}

/**
 * Computes the current + longest streak for a habit scheduled on specific
 * calendar days (daily, or specific weekdays). `isScheduled` decides which
 * days count; unscheduled days are skipped without affecting the streak.
 */
export function computeDayBasedStreak(
  completedDates: Iterable<LocalDateString>,
  isScheduled: (date: Date) => boolean,
  today: LocalDateString,
  earliest: LocalDateString
): StreakResult {
  const completed = new Set(completedDates);
  const todayDate = parseLocalDate(today);
  const earliestDate = parseLocalDate(earliest);

  if (isAfter(earliestDate, todayDate)) {
    return { current: 0, longest: 0 };
  }

  let running = 0;
  let longest = 0;
  let currentAsOfYesterday = 0;
  let cursor = earliestDate;

  while (!isAfter(cursor, todayDate)) {
    const cursorStr = formatLocalDate(cursor);
    if (isScheduled(cursor)) {
      running = completed.has(cursorStr) ? running + 1 : 0;
      longest = Math.max(longest, running);
    }
    if (cursorStr !== today) {
      currentAsOfYesterday = running;
    }
    cursor = addDays(cursor, 1);
  }

  const todayScheduled = isScheduled(todayDate);
  const todayCompleted = completed.has(today);
  const current = todayScheduled && !todayCompleted ? currentAsOfYesterday : running;

  return { current, longest };
}

export function dailyStreak(
  completedDates: Iterable<LocalDateString>,
  today: LocalDateString,
  earliest: LocalDateString
): StreakResult {
  return computeDayBasedStreak(completedDates, () => true, today, earliest);
}

export function weekdayStreak(
  completedDates: Iterable<LocalDateString>,
  selectedWeekdays: number[],
  today: LocalDateString,
  earliest: LocalDateString
): StreakResult {
  const scheduled = new Set(selectedWeekdays);
  return computeDayBasedStreak(
    completedDates,
    (date) => scheduled.has(getDay(date)),
    today,
    earliest
  );
}

/**
 * Streak for habits with a weekly completion target: a "week" counts once
 * `targetCount` completions have landed in it. Weeks before `earliest` or
 * after `today` are not considered.
 */
export function weeklyTargetStreak(
  completionDates: Iterable<LocalDateString>,
  targetCount: number,
  today: LocalDateString,
  earliest: LocalDateString,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): StreakResult {
  const weekCounts = new Map<string, number>();
  for (const dateStr of completionDates) {
    const weekKey = formatLocalDate(
      startOfWeek(parseLocalDate(dateStr), { weekStartsOn })
    );
    weekCounts.set(weekKey, (weekCounts.get(weekKey) ?? 0) + 1);
  }

  const todayDate = parseLocalDate(today);
  const earliestWeek = startOfWeek(parseLocalDate(earliest), { weekStartsOn });
  const currentWeek = startOfWeek(todayDate, { weekStartsOn });

  if (isAfter(earliestWeek, currentWeek)) {
    return { current: 0, longest: 0 };
  }

  let running = 0;
  let longest = 0;
  let currentAsOfLastWeek = 0;
  let cursor = earliestWeek;
  const currentWeekKey = formatLocalDate(currentWeek);

  while (!isAfter(cursor, currentWeek)) {
    const weekKey = formatLocalDate(cursor);
    const met = (weekCounts.get(weekKey) ?? 0) >= targetCount;
    running = met ? running + 1 : 0;
    longest = Math.max(longest, running);
    if (weekKey !== currentWeekKey) {
      currentAsOfLastWeek = running;
    }
    cursor = addWeeks(cursor, 1);
  }

  const currentWeekMet = (weekCounts.get(currentWeekKey) ?? 0) >= targetCount;
  const current = currentWeekMet ? running : currentAsOfLastWeek;

  return { current, longest };
}

/** Flexible habits don't have a "missed day" streak — just activity stats. */
export function flexibleStats(
  completionDates: Iterable<LocalDateString>,
  today: LocalDateString,
  earliest: LocalDateString,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): FlexibleStats {
  const dates = Array.from(completionDates);
  const activeDays = new Set(dates).size;
  const totalCompletions = dates.length;

  const earliestWeek = startOfWeek(parseLocalDate(earliest), { weekStartsOn });
  const currentWeek = startOfWeek(parseLocalDate(today), { weekStartsOn });
  const weeksWithActivity = new Set(
    dates.map((d) =>
      formatLocalDate(startOfWeek(parseLocalDate(d), { weekStartsOn }))
    )
  );

  let totalWeeks = 0;
  let cursor = earliestWeek;
  while (!isAfter(cursor, currentWeek)) {
    totalWeeks++;
    cursor = addWeeks(cursor, 1);
  }

  const weeklyConsistency =
    totalWeeks === 0 ? 0 : weeksWithActivity.size / totalWeeks;

  return { activeDays, totalCompletions, weeklyConsistency };
}

/**
 * Convenience entry point: dispatches to the right streak function based on
 * frequency type. Returns `null` for flexible habits (use `flexibleStats`
 * instead).
 */
export function computeHabitStreak(params: {
  frequencyType: HabitFrequencyType;
  selectedWeekdays: number[];
  targetCount: number;
  completionDates: Iterable<LocalDateString>;
  today: LocalDateString;
  earliest: LocalDateString;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}): StreakResult | null {
  const {
    frequencyType,
    selectedWeekdays,
    targetCount,
    completionDates,
    today,
    earliest,
    weekStartsOn = 0,
  } = params;

  switch (frequencyType) {
    case "daily":
      return dailyStreak(completionDates, today, earliest);
    case "weekdays":
      return weekdayStreak(completionDates, selectedWeekdays, today, earliest);
    case "weekly_target":
      return weeklyTargetStreak(
        completionDates,
        targetCount,
        today,
        earliest,
        weekStartsOn
      );
    case "flexible":
      return null;
  }
}

export function todayPlusDays(today: LocalDateString, amount: number) {
  return addLocalDays(today, amount);
}
