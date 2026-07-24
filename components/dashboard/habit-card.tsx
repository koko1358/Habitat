"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  createHabitCompletion,
  undoLatestHabitCompletion,
} from "@/lib/completions/service";
import { getLocalTimeString } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import type { HabitWithTodayStatus } from "@/types/domain";

function targetLabel(habit: HabitWithTodayStatus) {
  if (habit.frequencyType === "weekly_target") {
    return `${habit.completedCount} of ${habit.targetCount} this week`;
  }
  return `${habit.completedCount} of ${habit.targetCount} completed`;
}

function streakLabel(habit: HabitWithTodayStatus) {
  if (habit.frequencyType === "flexible") {
    return habit.flexibleActiveDays
      ? `${habit.flexibleActiveDays} active days`
      : "Just getting started";
  }
  if (habit.currentStreak && habit.currentStreak > 0) {
    return `${habit.currentStreak}-day streak`;
  }
  return "No streak yet";
}

export function HabitCard({
  habit,
  timezone,
}: {
  habit: HabitWithTodayStatus;
  timezone: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      try {
        await createHabitCompletion({
          habitId: habit.id,
          timezone,
          source: "manual",
        });
        toast.success(`${habit.icon} ${habit.name} completed`, {
          action: {
            label: "Undo",
            onClick: () => {
              startTransition(async () => {
                await undoLatestHabitCompletion(habit.id);
              });
            },
          },
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't complete habit"
        );
      }
    });
  }

  function handleUndo() {
    startTransition(async () => {
      try {
        await undoLatestHabitCompletion(habit.id);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't undo completion"
        );
      }
    });
  }

  const showProgress = habit.targetCount > 1;
  const lastCompletedLabel = habit.lastCompletedAt
    ? getLocalTimeString(new Date(habit.lastCompletedAt), timezone)
    : null;

  return (
    <li
      className={cn(
        "rounded-2xl border bg-card p-4 transition-colors",
        habit.isComplete ? "border-border/60 bg-card/60" : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{habit.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{habit.name}</p>
          {habit.description ? (
            <p className="truncate text-sm text-muted-foreground">
              {habit.description}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>{targetLabel(habit)}</span>
            <span aria-hidden>·</span>
            <span>{streakLabel(habit)}</span>
            {lastCompletedLabel ? (
              <>
                <span aria-hidden>·</span>
                <span>Last completed at {lastCompletedLabel}</span>
              </>
            ) : null}
          </div>
          {showProgress ? (
            <Progress
              value={Math.min(
                100,
                Math.round((habit.completedCount / habit.targetCount) * 100)
              )}
              className="mt-2"
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {habit.completedCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleUndo}
          >
            Undo
          </Button>
        ) : null}
        <Button
          size="sm"
          disabled={isPending || (habit.isComplete && !habit.allowMultiplePerDay)}
          onClick={handleComplete}
        >
          {habit.isComplete && !habit.allowMultiplePerDay
            ? "Completed"
            : habit.isComplete
              ? "Complete again"
              : "Complete"}
        </Button>
      </div>
    </li>
  );
}
