import { Card, CardContent } from "@/components/ui/card";

export function SummaryCard({
  completedCount,
  scheduledCount,
  completionPercentage,
  longestCurrentStreak,
}: {
  completedCount: number;
  scheduledCount: number;
  completionPercentage: number;
  longestCurrentStreak: number;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="grid grid-cols-3 gap-3 py-1">
        <div>
          <p className="text-2xl font-semibold">
            {completedCount}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {scheduledCount}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">Habits today</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{completionPercentage}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{longestCurrentStreak}</p>
          <p className="text-xs text-muted-foreground">
            Day{longestCurrentStreak === 1 ? "" : "s"} — longest streak
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
