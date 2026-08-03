"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  createHabitCompletion,
  undoLatestHabitCompletion,
} from "@/lib/completions/service";
import { habitAccentColor } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { FlameIcon } from "@/components/shared/flame-icon";
import { MiniHeat } from "@/components/dashboard/mini-heat";
import type { HabitWithTodayStatus } from "@/types/domain";

function streakCount(habit: HabitWithTodayStatus): number {
  if (habit.frequencyType === "flexible") {
    return habit.flexibleActiveDays ?? 0;
  }
  return habit.currentStreak ?? 0;
}

export function HabitCard({
  habit,
  timezone,
  heatmap,
}: {
  habit: HabitWithTodayStatus;
  timezone: string;
  /** Chronological (oldest first) completion fractions for the mini-heatmap. */
  heatmap: number[];
}) {
  const [isPending, startTransition] = useTransition();
  const accent = habitAccentColor(habit.id);

  function complete() {
    startTransition(async () => {
      try {
        await createHabitCompletion({ habitId: habit.id, timezone, source: "manual" });
        toast.success(`${habit.icon} ${habit.name} completed`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't complete habit"
        );
      }
    });
  }

  function undo() {
    startTransition(async () => {
      try {
        await undoLatestHabitCompletion(habit.id, timezone);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't undo completion"
        );
      }
    });
  }

  return (
    <li className="hb-card-shadow mb-3 rounded-hb-card bg-hb-card px-[18px] pt-[18px] pb-4">
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-[16px] font-semibold text-hb-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span className="text-base">{habit.icon}</span>
          {habit.name}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-hb-ink-dim">
          <FlameIcon color={accent} className="size-3" />
          {streakCount(habit)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {habit.unlimitedPerDay ? (
          <RunningTotal
            habit={habit}
            accent={accent}
            disabled={isPending}
            onComplete={complete}
            onUndo={undo}
          />
        ) : habit.targetCount > 1 ? (
          <PipRow habit={habit} accent={accent} disabled={isPending} onComplete={complete} onUndo={undo} />
        ) : (
          <CheckButton
            done={habit.isComplete}
            accent={accent}
            disabled={isPending}
            onClick={habit.isComplete ? undo : complete}
          />
        )}
        <MiniHeat fractions={heatmap} accent={accent} />
      </div>
    </li>
  );
}

function CheckButton({
  done,
  accent,
  disabled,
  onClick,
}: {
  done: boolean;
  accent: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={done}
      aria-label={done ? "Mark incomplete" : "Mark complete"}
      className="flex size-[42px] shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60"
      style={{ background: done ? accent : "var(--hb-check-off)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[17px]" aria-hidden>
        <path
          d="M5 13l4 4L19 7"
          stroke={done ? "#fff" : "rgba(28,29,26,0.28)"}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function RunningTotal({
  habit,
  accent,
  disabled,
  onComplete,
  onUndo,
}: {
  habit: HabitWithTodayStatus;
  accent: string;
  disabled: boolean;
  onComplete: () => void;
  onUndo: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onComplete}
        aria-label="Log another completion"
        className="flex h-[42px] items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
        style={{ background: accent }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-[15px]" aria-hidden>
          <path
            d="M12 5v14M5 12h14"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
        {habit.completedCount} today
      </button>
      {habit.completedCount > 0 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onUndo}
          className="text-xs font-medium text-hb-ink-dim underline decoration-dotted underline-offset-2 disabled:opacity-60"
        >
          Undo
        </button>
      ) : null}
    </div>
  );
}

function PipRow({
  habit,
  accent,
  disabled,
  onComplete,
  onUndo,
}: {
  habit: HabitWithTodayStatus;
  accent: string;
  disabled: boolean;
  onComplete: () => void;
  onUndo: () => void;
}) {
  return (
    <div className="flex max-w-[150px] flex-wrap gap-1.5">
      {Array.from({ length: habit.targetCount }, (_, i) => {
        const filled = i < habit.completedCount;
        // Tap an empty pip to log a completion; tap the most recent filled
        // pip to undo it — same "one tap, one completion" idea as the
        // check circle, just per-pip for multi-target habits.
        const isLastFilled = filled && i === habit.completedCount - 1;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={filled ? (isLastFilled ? onUndo : undefined) : onComplete}
            aria-label={filled ? `Completion ${i + 1}` : `Log completion ${i + 1}`}
            className={cn(
              "size-[18px] shrink-0 rounded-full transition-transform",
              !filled && "cursor-pointer active:scale-90",
              filled && !isLastFilled && "cursor-default"
            )}
            style={{ background: filled ? accent : "var(--hb-pip-off)" }}
          />
        );
      })}
    </div>
  );
}
