"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { HabitRow } from "@/components/habits/habit-row";
import { DeleteHabitAlert } from "@/components/habits/delete-habit-alert";
import { useSwipeToReveal } from "@/hooks/use-swipe-to-reveal";
import type { Habit } from "@/types/domain";

/**
 * Wraps HabitRow with the standard mobile swipe-left-to-delete pattern.
 * The row's own explicit "Delete" button (in HabitRow) still exists too —
 * swipe only works on touch, so mouse/keyboard users need that regardless.
 * Both open the same confirmation (DeleteHabitAlert), so there's exactly
 * one delete path underneath, not two.
 */
export function SwipeableHabitRow({ habit }: { habit: Habit }) {
  const swipe = useSwipeToReveal();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: swipe.revealWidth }}
      >
        <button
          type="button"
          onClick={() => {
            setConfirmOpen(true);
            swipe.close();
          }}
          aria-label={`Delete ${habit.name}`}
          className="flex w-full flex-col items-center justify-center gap-1 bg-destructive text-xs font-medium text-destructive-foreground"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete
        </button>
      </div>

      <div
        {...swipe.handlers}
        style={{
          transform: `translateX(${swipe.translateX}px)`,
          transition: swipe.isDragging ? "none" : "transform 0.2s ease",
          touchAction: "pan-y",
        }}
      >
        <HabitRow habit={habit} />
      </div>

      <DeleteHabitAlert
        habitId={habit.id}
        habitName={habit.name}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </li>
  );
}
