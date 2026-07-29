"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getHabitStreakSummaries, type HabitStreakSummary } from "@/lib/habits/summary";
import type { Settings } from "@/types/domain";

export function useHabitStreakSummaries(
  settings: Settings | undefined
): HabitStreakSummary[] | undefined {
  return useLiveQuery(
    () => (settings ? getHabitStreakSummaries(settings) : undefined),
    [settings?.timezone, settings?.weekStartsOn, settings?.updatedAt]
  );
}
