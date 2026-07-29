import { habitAccentColor, heatColor } from "@/lib/design-tokens";
import { FlameIcon } from "@/components/shared/flame-icon";
import type { HabitStreakSummary } from "@/lib/habits/summary";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function streakCount(summary: HabitStreakSummary): number {
  if (summary.habit.frequencyType === "flexible") {
    return summary.flexibleActiveDays ?? 0;
  }
  return summary.currentStreak ?? 0;
}

/** Ported from taphabit:design.html's `.sum-card` (Summary tab, 2-week heatmap per habit). */
export function SummaryHeatCard({
  summary,
  heatmap,
}: {
  summary: HabitStreakSummary;
  heatmap: number[];
}) {
  const { habit } = summary;
  const accent = habitAccentColor(habit.id);

  return (
    <div className="hb-card-shadow mb-3 rounded-hb-card bg-hb-card px-[18px] pt-[18px] pb-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-[16.5px] font-semibold text-hb-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span className="text-base">{habit.icon}</span>
          {habit.name}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-hb-ink-dim">
          <FlameIcon color={accent} className="size-3" />
          {streakCount(summary)}
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label, i) => (
          <span
            key={i}
            className="text-center text-[9.5px] font-bold text-hb-ink-faint"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5" style={{ gridAutoRows: "26px" }}>
        {heatmap.map((fraction, i) => (
          <div
            key={i}
            className="rounded-[7px]"
            style={{ background: heatColor(fraction, accent) }}
          />
        ))}
      </div>
    </div>
  );
}
