"use client";

import { useSettings } from "@/hooks/use-settings";
import { useActiveHabits } from "@/hooks/use-habits";
import { useHabitStreakSummaries } from "@/hooks/use-habit-streak-summaries";
import { useHabitHeatmaps } from "@/hooks/use-habit-heatmaps";
import { SummaryView } from "@/components/summary/summary-view";
import { ListPageSkeleton } from "@/components/shared/skeletons";

export default function SummaryPage() {
  const settings = useSettings();
  const habits = useActiveHabits();
  const summaries = useHabitStreakSummaries(settings);
  const heatmaps = useHabitHeatmaps(habits, settings);

  if (!settings || !summaries || !heatmaps) {
    return <ListPageSkeleton />;
  }

  return <SummaryView summaries={summaries} heatmaps={heatmaps} />;
}
