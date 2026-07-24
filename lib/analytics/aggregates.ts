import { format, startOfMonth, startOfWeek } from "date-fns";
import { getActiveHabits } from "@/lib/habits/service";
import { getCompletionsForHabits } from "@/lib/completions/service";
import { dayProgressFor, earliestLocalDateFor, toWeekStartsOn } from "@/lib/habits/today";
import { computeHabitStreak } from "@/lib/streaks/streaks";
import { addLocalDays, formatLocalDate, parseLocalDate } from "@/lib/streaks/date-utils";
import { getLocalDateString } from "@/lib/timezone";
import type { Habit, HabitCompletion, Settings } from "@/types/domain";

export interface DailyActivity {
  date: string;
  label: string;
  completions: number;
  scheduledHabits: number;
  completedHabits: number;
}

export interface HourlyActivity {
  hour: number;
  completions: number;
}

export interface HabitRate {
  habitId: string;
  name: string;
  icon: string;
  rate: number;
  scheduledCount: number;
  completedCount: number;
}

export interface AnalyticsData {
  last7DaysRate: number;
  last30DaysRate: number;
  totalThisWeek: number;
  totalThisMonth: number;
  longestCurrentStreak: number;
  mostConsistentHabit: HabitRate | null;
  mostMissedHabit: HabitRate | null;
  dailyActivity: DailyActivity[];
  hourlyActivity: HourlyActivity[];
  habitRates: HabitRate[];
}

export async function getAnalyticsData(settings: Settings): Promise<AnalyticsData> {
  const habits = await getActiveHabits();
  const today = getLocalDateString(new Date(), settings.timezone);
  const weekStartsOn = toWeekStartsOn(settings.weekStartsOn);

  const completionsByHabit = await getCompletionsForHabits(habits.map((h) => h.id));
  const allCompletions = Array.from(completionsByHabit.values()).flat();

  const dailyActivity = buildDailyActivity(
    habits,
    completionsByHabit,
    today,
    weekStartsOn,
    30
  );
  const last7 = dailyActivity.slice(-7);
  const last30 = dailyActivity;

  const last7DaysRate = rateFromDays(last7);
  const last30DaysRate = rateFromDays(last30);

  const weekStart = formatLocalDate(startOfWeek(parseLocalDate(today), { weekStartsOn }));
  const monthStart = formatLocalDate(startOfMonth(parseLocalDate(today)));

  const totalThisWeek = allCompletions.filter(
    (c) => c.localDate >= weekStart && c.localDate <= today
  ).length;
  const totalThisMonth = allCompletions.filter(
    (c) => c.localDate >= monthStart && c.localDate <= today
  ).length;

  const longestCurrentStreak = habits.reduce((max, habit) => {
    const localDates = (completionsByHabit.get(habit.id) ?? []).map((c) => c.localDate);
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
    return Math.max(max, streak?.current ?? 0);
  }, 0);

  const habitRates = buildHabitRates(habits, completionsByHabit, today, weekStartsOn, 30);
  const ranked = habitRates.filter((h) => h.scheduledCount >= 3);
  const mostConsistentHabit =
    ranked.length > 0
      ? ranked.reduce((best, h) => (h.rate > best.rate ? h : best))
      : null;
  const mostMissedHabit =
    ranked.length > 0
      ? ranked.reduce((worst, h) => (h.rate < worst.rate ? h : worst))
      : null;

  const hourlyActivity = buildHourlyActivity(allCompletions, settings.timezone);

  return {
    last7DaysRate,
    last30DaysRate,
    totalThisWeek,
    totalThisMonth,
    longestCurrentStreak,
    mostConsistentHabit,
    mostMissedHabit,
    dailyActivity,
    hourlyActivity,
    habitRates,
  };
}

function rateFromDays(days: DailyActivity[]): number {
  const scheduled = days.reduce((sum, d) => sum + d.scheduledHabits, 0);
  const completed = days.reduce((sum, d) => sum + d.completedHabits, 0);
  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

function buildDailyActivity(
  habits: Habit[],
  completionsByHabit: Map<string, HabitCompletion[]>,
  today: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  days: number
): DailyActivity[] {
  const result: DailyActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addLocalDays(today, -i);
    const progress = dayProgressFor(habits, completionsByHabit, date, weekStartsOn);
    const completions = Array.from(completionsByHabit.values())
      .flat()
      .filter((c) => c.localDate === date).length;
    result.push({
      date,
      label: format(parseLocalDate(date), "EEE"),
      completions,
      scheduledHabits: progress.scheduledCount,
      completedHabits: progress.completedCount,
    });
  }
  return result;
}

function buildHabitRates(
  habits: Habit[],
  completionsByHabit: Map<string, HabitCompletion[]>,
  today: string,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  days: number
): HabitRate[] {
  return habits
    .filter((h) => h.frequencyType !== "flexible")
    .map((habit) => {
      let scheduledCount = 0;
      let completedCount = 0;
      for (let i = days - 1; i >= 0; i--) {
        const date = addLocalDays(today, -i);
        const progress = dayProgressFor([habit], completionsByHabit, date, weekStartsOn);
        scheduledCount += progress.scheduledCount;
        completedCount += progress.completedCount;
      }
      return {
        habitId: habit.id,
        name: habit.name,
        icon: habit.icon,
        scheduledCount,
        completedCount,
        rate: scheduledCount === 0 ? 0 : Math.round((completedCount / scheduledCount) * 100),
      };
    });
}

function buildHourlyActivity(
  completions: HabitCompletion[],
  timezone: string
): HourlyActivity[] {
  const counts = new Array(24).fill(0);
  for (const completion of completions) {
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(new Date(completion.completedAt));
    const hour = Number.parseInt(hourStr, 10) % 24;
    counts[hour] += 1;
  }
  return counts.map((completions, hour) => ({ hour, completions }));
}
