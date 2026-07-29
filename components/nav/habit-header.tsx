"use client";

import { format } from "date-fns";
import { useSettings } from "@/hooks/use-settings";
import { useTodaySummary } from "@/hooks/use-today";
import { parseLocalDate } from "@/lib/streaks/date-utils";

/** The shared "Habits" title + "X of Y done today" subtitle from taphabit:design.html's `.header`. */
export function HabitHeader() {
  const settings = useSettings();
  const summary = useTodaySummary(settings);

  return (
    <div className="pt-2 pb-1">
      <div
        className="mb-2 text-[30px] font-bold text-hb-ink"
        style={{ letterSpacing: "-0.03em" }}
      >
        Habits
      </div>
      <div className="text-[13px] font-semibold text-hb-ink-dim">
        {summary ? (
          <>
            {format(parseLocalDate(summary.today), "EEE, MMM d")}
            {" · "}
            <b className="font-bold text-hb-ink">
              {summary.completedCount} of {summary.scheduledCount}
            </b>{" "}
            done today
          </>
        ) : (
          format(new Date(), "EEE, MMM d")
        )}
      </div>
    </div>
  );
}
