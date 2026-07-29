import { EmptyState } from "@/components/shared/empty-state";
import { SummaryHeatCard } from "@/components/summary/summary-heat-card";
import type { HabitStreakSummary } from "@/lib/habits/summary";
import type { HeatmapsByHabit } from "@/hooks/use-habit-heatmaps";

/** The Summary tab's content — one `.sum-card` per active habit. */
export function SummaryView({
  summaries,
  heatmaps,
}: {
  summaries: HabitStreakSummary[];
  heatmaps: HeatmapsByHabit;
}) {
  if (summaries.length === 0) {
    return (
      <EmptyState
        title="No habits yet"
        description="Create a habit to see its 2-week history here."
      />
    );
  }

  return (
    <div>
      <p className="mb-3 text-[12px] font-bold tracking-[0.09em] text-hb-ink-faint uppercase">
        Last 2 weeks
      </p>
      {summaries.map((summary) => (
        <SummaryHeatCard
          key={summary.habit.id}
          summary={summary}
          heatmap={heatmaps.get(summary.habit.id) ?? []}
        />
      ))}
    </div>
  );
}
