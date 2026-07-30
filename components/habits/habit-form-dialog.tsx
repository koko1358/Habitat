"use client";

import { useState, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HabitForm } from "@/components/habits/habit-form";
import { HabitStickerPanel } from "@/components/habits/habit-sticker-panel";
import { getHabitById } from "@/lib/habits/service";
import type { Habit } from "@/types/domain";
import type { HabitFormState } from "@/lib/habits/service";

export function HabitFormDialog({
  habit,
  action,
  trigger,
}: {
  habit?: Habit;
  action: (
    state: HabitFormState,
    formData: FormData
  ) => Promise<HabitFormState>;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Only set for a fresh *create* (habit prop absent) — presence of this
  // is what advances the dialog to the sticker step instead of closing.
  const [createdHabitId, setCreatedHabitId] = useState<string | null>(null);
  const createdHabit = useLiveQuery(
    () => (createdHabitId ? getHabitById(createdHabitId) : undefined),
    [createdHabitId]
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset once the dialog has fully closed, so reopening it starts
      // fresh at step 1 rather than remembering the last habit created.
      setCreatedHabitId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {createdHabitId ? (
          <>
            <DialogHeader>
              <DialogTitle>Add an NFC sticker?</DialogTitle>
              <DialogDescription>
                Generate a tap link for this habit now, or skip and do it
                later from the habit&apos;s row.
              </DialogDescription>
            </DialogHeader>
            {createdHabit ? (
              <HabitStickerPanel
                habit={createdHabit}
                justCreated
                onDone={() => handleOpenChange(false)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{habit ? "Edit habit" : "New habit"}</DialogTitle>
              <DialogDescription>
                {habit
                  ? "Update the details for this habit."
                  : "Set up a habit to track on your Today dashboard."}
              </DialogDescription>
            </DialogHeader>
            <HabitForm
              habit={habit}
              action={action}
              onSuccess={(createdId) => {
                if (!habit && createdId) {
                  // Fresh create: advance to the sticker step instead of
                  // closing — this is what makes habit + sticker one
                  // continuous flow rather than two separate screens.
                  setCreatedHabitId(createdId);
                } else {
                  handleOpenChange(false);
                }
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
