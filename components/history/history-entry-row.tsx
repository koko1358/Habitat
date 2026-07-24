"use client";

import { useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { softDeleteCompletion } from "@/lib/completions/service";
import { getLocalTimeString } from "@/lib/timezone";
import type { HistoryEntry } from "@/types/domain";

const SOURCE_LABELS: Record<HistoryEntry["completion"]["source"], string> = {
  manual: "Manual",
  nfc: "NFC tap",
  shortcut: "Shortcut",
  imported: "Imported",
};

export function HistoryEntryRow({
  entry,
  timezone,
  confirmBeforeDelete,
}: {
  entry: HistoryEntry;
  timezone: string;
  confirmBeforeDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function performDelete() {
    startTransition(async () => {
      try {
        await softDeleteCompletion(entry.completion.id);
        toast.success(`Removed ${entry.habit.name} completion`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't delete completion"
        );
      }
    });
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <span className="text-xl leading-none">{entry.habit.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entry.habit.name}</p>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>
            {getLocalTimeString(new Date(entry.completion.completedAt), timezone)}
          </span>
          <span aria-hidden>·</span>
          <Badge variant="secondary" className="font-normal">
            {SOURCE_LABELS[entry.completion.source]}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        disabled={isPending}
        onClick={() => (confirmBeforeDelete ? setConfirmOpen(true) : performDelete())}
      >
        Delete
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this completion?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the {entry.habit.name} completion from{" "}
              {getLocalTimeString(new Date(entry.completion.completedAt), timezone)}
              . It will no longer count toward streaks or analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
