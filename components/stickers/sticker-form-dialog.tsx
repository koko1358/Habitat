"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StickerForm } from "@/components/stickers/sticker-form";
import type { Habit } from "@/types/domain";

export function StickerFormDialog({
  habits,
  trigger,
}: {
  habits: Habit[];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New sticker</DialogTitle>
          <DialogDescription>
            Create a link you can write to a physical NFC sticker.
          </DialogDescription>
        </DialogHeader>
        <StickerForm habits={habits} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
