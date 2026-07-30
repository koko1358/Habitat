"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteHabit } from "@/lib/habits/service";

/**
 * The delete-habit confirmation itself, fully externally controlled (no
 * trigger rendered) so it can be opened from more than one place —
 * `DeleteHabitDialog`'s own button, and the swipe-to-delete action —
 * without duplicating the confirmation copy or the delete call.
 */
export function DeleteHabitAlert({
  habitId,
  habitName,
  open,
  onOpenChange,
}: {
  habitId: string;
  habitName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{habitName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the habit, its completion history, and
            any NFC stickers linked to it. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await deleteHabit(habitId);
                  toast.success(`Deleted "${habitName}"`);
                  onOpenChange(false);
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to delete habit"
                  );
                }
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
