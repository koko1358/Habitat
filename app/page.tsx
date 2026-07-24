"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useSettings } from "@/hooks/use-settings";
import { useTodaySummary } from "@/hooks/use-today";
import { sortHabitsForDashboard } from "@/lib/habits/sort";
import { parseLocalDate } from "@/lib/streaks/date-utils";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { WeeklyOverview } from "@/components/dashboard/weekly-overview";
import { InsightCard } from "@/components/dashboard/insight-card";
import { HabitCard } from "@/components/dashboard/habit-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TodayPageSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function TodayPage() {
  const settings = useSettings();
  const summary = useTodaySummary(settings);

  if (!settings || !summary) {
    return <TodayPageSkeleton />;
  }

  const todayDate = parseLocalDate(summary.today);
  const hour = new Date().getHours();
  const scheduledHabits = summary.habits.filter((h) => h.isScheduledToday);
  const sortedHabits = sortHabitsForDashboard(scheduledHabits);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {greeting(hour)}
          {settings.displayName ? `, ${settings.displayName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {format(todayDate, "EEEE, MMMM d")}
        </p>
      </div>

      <SummaryCard
        completedCount={summary.completedCount}
        scheduledCount={summary.scheduledCount}
        completionPercentage={summary.completionPercentage}
        longestCurrentStreak={summary.longestCurrentStreak}
      />

      <WeeklyOverview days={summary.weeklyOverview} />

      {summary.insight ? <InsightCard insight={summary.insight} /> : null}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Today&apos;s Habits</h2>
        {sortedHabits.length === 0 ? (
          <EmptyState
            title={
              summary.habits.length === 0
                ? "No habits yet"
                : "Nothing scheduled today"
            }
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
        ) : (
          <ul className="space-y-3">
            {sortedHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} timezone={settings.timezone} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
