"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getTodaySummary, type TodaySummary } from "@/lib/habits/today";
import type { Settings } from "@/types/domain";

export function useTodaySummary(settings: Settings | undefined): TodaySummary | undefined {
  return useLiveQuery(
    () => (settings ? getTodaySummary(settings) : undefined),
    [settings?.timezone, settings?.weekStartsOn, settings?.updatedAt]
  );
}
