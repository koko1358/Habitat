"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HabitStickerPanel } from "@/components/habits/habit-sticker-panel";
import { useStickersForHabit } from "@/hooks/use-stickers-for-habit";
import type { Habit } from "@/types/domain";

/** Opens the same sticker create/manage panel used right after creating a habit, for an existing one. */
export function HabitStickerDialog({ habit }: { habit: Habit }) {
  const [open, setOpen] = useState(false);
  const stickers = useStickersForHabit(habit.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        {stickers && stickers.length > 0 ? "Sticker" : "Get sticker"}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{habit.icon} NFC sticker</DialogTitle>
          <DialogDescription>
            Manage this habit&apos;s sticker links.
          </DialogDescription>
        </DialogHeader>
        <HabitStickerPanel habit={habit} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
