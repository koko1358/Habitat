"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteHabitAlert } from "@/components/habits/delete-habit-alert";

/** The row's own "Delete" button + confirmation — same confirmation the swipe action uses, see delete-habit-alert.tsx. */
export function DeleteHabitDialog({
  habitId,
  habitName,
}: {
  habitId: string;
  habitName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <DeleteHabitAlert
        habitId={habitId}
        habitName={habitName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
