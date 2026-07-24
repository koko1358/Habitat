"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getAnalyticsData, type AnalyticsData } from "@/lib/analytics/aggregates";
import type { Settings } from "@/types/domain";

export function useAnalyticsData(settings: Settings | undefined): AnalyticsData | undefined {
  return useLiveQuery(
    () => (settings ? getAnalyticsData(settings) : undefined),
    [settings?.timezone, settings?.weekStartsOn, settings?.updatedAt]
  );
}
