"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { HabitStickerDialog } from "@/components/habits/habit-sticker-dialog";
import { DeleteHabitDialog } from "@/components/habits/delete-habit-dialog";
import { setHabitActive, updateHabit } from "@/lib/habits/service";
import type { Habit } from "@/types/domain";

const FREQUENCY_SUMMARY: Record<Habit["frequencyType"], string> = {
  daily: "Every day",
  weekdays: "Specific weekdays",
  weekly_target: "times per week",
  flexible: "Flexible",
};

function frequencyLabel(habit: Habit) {
  if (habit.frequencyType === "weekly_target") {
    return `${habit.targetCount} times per week`;
  }
  return FREQUENCY_SUMMARY[habit.frequencyType];
}

export function HabitRow({ habit }: { habit: Habit }) {
  const [isPending, startTransition] = useTransition();

  function toggleArchive() {
    startTransition(async () => {
      try {
        await setHabitActive(habit.id, !habit.isActive);
        toast.success(habit.isActive ? "Habit archived" : "Habit restored");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong"
        );
      }
    });
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="text-2xl leading-none">{habit.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{habit.name}</p>
          <Badge variant="secondary" className="font-normal">
            {habit.category}
          </Badge>
        </div>
        {habit.description ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {habit.description}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          {frequencyLabel(habit)}
          {habit.frequencyType !== "weekly_target" &&
          habit.targetCount > 1
            ? ` · ${habit.targetCount}x per day`
            : ""}
          {habit.allowMultiplePerDay ? " · multiple per day" : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <HabitFormDialog
          habit={habit}
          action={updateHabit.bind(null, habit.id)}
          trigger={
            <DialogTrigger render={<Button variant="ghost" size="sm" />}>
              Edit
            </DialogTrigger>
          }
        />
        <HabitStickerDialog habit={habit} />
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={toggleArchive}
        >
          {habit.isActive ? "Archive" : "Restore"}
        </Button>
        <DeleteHabitDialog habitId={habit.id} habitName={habit.name} />
      </div>
    </div>
  );
}
