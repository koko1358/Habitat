"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HabitForm } from "@/components/habits/habit-form";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
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
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
