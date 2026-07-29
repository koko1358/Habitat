"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getCompletionsForHabits } from "@/lib/completions/service";
import { dailyCompletionFractions } from "@/lib/habits/heatmap";
import { getLocalDateString } from "@/lib/timezone";
import type { Habit, Settings } from "@/types/domain";

/** habitId -> chronological completion-fraction array (oldest first). */
export type HeatmapsByHabit = Map<string, number[]>;

export function useHabitHeatmaps(
  habits: Habit[] | undefined,
  settings: Settings | undefined,
  days = 14
): HeatmapsByHabit | undefined {
  return useLiveQuery(async () => {
    if (!habits || !settings) return undefined;

    const completionsByHabit = await getCompletionsForHabits(
      habits.map((h) => h.id)
    );
    const today = getLocalDateString(new Date(), settings.timezone);

    const map: HeatmapsByHabit = new Map();
    for (const habit of habits) {
      map.set(
        habit.id,
        dailyCompletionFractions(
          completionsByHabit.get(habit.id) ?? [],
          habit.targetCount,
          today,
          days
        )
      );
    }
    return map;
  }, [habits, settings?.timezone, days]);
}
