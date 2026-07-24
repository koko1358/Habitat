"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { renameSticker } from "@/lib/stickers/service";
import type { NfcSticker } from "@/types/domain";

export function RenameStickerDialog({ sticker }: { sticker: NfcSticker }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const stickerName = String(formData.get("stickerName") ?? "").trim();
    const room = String(formData.get("room") ?? "").trim();

    if (!stickerName) {
      toast.error("Give the sticker a name.");
      return;
    }

    startTransition(async () => {
      await renameSticker(sticker.id, stickerName, room);
      toast.success("Sticker updated");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        Rename
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename sticker</DialogTitle>
          <DialogDescription>
            Update the name or room for this sticker.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`stickerName-${sticker.id}`}>Sticker name</Label>
            <Input
              id={`stickerName-${sticker.id}`}
              name="stickerName"
              defaultValue={sticker.stickerName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`room-${sticker.id}`}>Room (optional)</Label>
            <Input
              id={`room-${sticker.id}`}
              name="room"
              defaultValue={sticker.room}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
