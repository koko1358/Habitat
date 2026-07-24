import { format } from "date-fns";
import { parseLocalDate } from "@/lib/streaks/date-utils";
import { cn } from "@/lib/utils";
import type { DayProgress } from "@/lib/habits/today";

export function WeeklyOverview({ days }: { days: DayProgress[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Last 7 days
      </p>
      <div className="flex justify-between gap-1.5">
        {days.map((day) => {
          const date = parseLocalDate(day.date);
          const isToday = day.date === days[days.length - 1]?.date;
          return (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-xs font-medium",
                  day.scheduledCount === 0
                    ? "bg-muted text-muted-foreground/50"
                    : day.percentage >= 100
                      ? "bg-primary text-primary-foreground"
                      : day.percentage > 0
                        ? "bg-primary/25 text-foreground"
                        : "bg-muted text-muted-foreground"
                )}
              >
                {day.scheduledCount === 0 ? "–" : `${day.percentage}%`}
              </div>
              <span
                className={cn(
                  "text-[11px] text-muted-foreground",
                  isToday && "font-semibold text-foreground"
                )}
              >
                {format(date, "EEEEE")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
