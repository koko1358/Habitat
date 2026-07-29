import { addLocalDays } from "@/lib/streaks/date-utils";
import type { HabitCompletion } from "@/types/domain";

/**
 * Chronological (oldest → newest) daily completion fraction for the last
 * `days` days, for the mini-heatmap / 2-week summary heatmap. Deliberately
 * not schedule-aware (unlike the real streak calculations in
 * lib/streaks/streaks.ts) — it's a presentation-only "how full was this day"
 * value, matching how the design mockup treats every day uniformly.
 */
export function dailyCompletionFractions(
  completions: HabitCompletion[],
  targetCount: number,
  today: string,
  days = 14
): number[] {
  const countByDate = new Map<string, number>();
  for (const completion of completions) {
    countByDate.set(
      completion.localDate,
      (countByDate.get(completion.localDate) ?? 0) + 1
    );
  }

  const fractions: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addLocalDays(today, -i);
    const count = countByDate.get(date) ?? 0;
    fractions.push(targetCount > 0 ? Math.min(1, count / targetCount) : 0);
  }
  return fractions;
}
