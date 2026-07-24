"use client";

import { useActionState, useEffect } from "react";
import {
  createSticker,
  initialStickerFormState,
} from "@/lib/stickers/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Habit } from "@/types/domain";

export function StickerForm({
  habits,
  onSuccess,
}: {
  habits: Habit[];
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createSticker,
    initialStickerFormState
  );

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="habitId">Habit</Label>
        <Select name="habitId">
          <SelectTrigger id="habitId" className="w-full">
            <SelectValue placeholder="Choose a habit" />
          </SelectTrigger>
          <SelectContent>
            {habits.map((habit) => (
              <SelectItem key={habit.id} value={habit.id}>
                {habit.icon} {habit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors.habitId ? (
          <p className="text-xs text-destructive">{state.errors.habitId[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stickerName">Sticker name</Label>
        <Input
          id="stickerName"
          name="stickerName"
          placeholder="Bathroom Mirror"
          required
        />
        {state.errors.stickerName ? (
          <p className="text-xs text-destructive">{state.errors.stickerName[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="room">Room (optional)</Label>
        <Input id="room" name="room" placeholder="CR" />
        {state.errors.room ? (
          <p className="text-xs text-destructive">{state.errors.room[0]}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending} className="h-11 w-full">
        {isPending ? "Creating…" : "Create sticker"}
      </Button>
    </form>
  );
}
