"use client";

import Link from "next/link";
import { useSettings } from "@/hooks/use-settings";
import { useTodaySummary } from "@/hooks/use-today";
import { useHabitHeatmaps } from "@/hooks/use-habit-heatmaps";
import { sortHabitsForDashboard } from "@/lib/habits/sort";
import { HabitCard } from "@/components/dashboard/habit-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TodayPageSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";

export default function TodayPage() {
  const settings = useSettings();
  const summary = useTodaySummary(settings);
  const heatmaps = useHabitHeatmaps(summary?.habits, settings);

  if (!settings || !summary || !heatmaps) {
    return <TodayPageSkeleton />;
  }

  const scheduledHabits = summary.habits.filter((h) => h.isScheduledToday);
  const sortedHabits = sortHabitsForDashboard(scheduledHabits);

  if (sortedHabits.length === 0) {
    return (
      <EmptyState
        title={summary.habits.length === 0 ? "No habits yet" : "Nothing scheduled today"}
        description={
          summary.habits.length === 0
            ? "Create your first habit to see it here."
            : "Enjoy the day off — nothing is scheduled for today."
        }
        action={
          summary.habits.length === 0 ? (
            <Button size="sm" render={<Link href="/habits" />}>
              Create a habit
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <ul>
      {sortedHabits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          timezone={settings.timezone}
          heatmap={heatmaps.get(habit.id) ?? []}
        />
      ))}
    </ul>
  );
}
