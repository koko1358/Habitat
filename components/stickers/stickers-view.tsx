"use client";

import { useMemo } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { StickerFormDialog } from "@/components/stickers/sticker-form-dialog";
import { StickerCard } from "@/components/stickers/sticker-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Habit, NfcSticker } from "@/types/domain";

export function StickersView({
  stickers,
  habits,
}: {
  stickers: NfcSticker[];
  habits: Habit[];
}) {
  const habitsById = useMemo(
    () => new Map(habits.map((h) => [h.id, h])),
    [habits]
  );
  const activeHabits = useMemo(() => habits.filter((h) => h.isActive), [habits]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Stickers</h1>
        {activeHabits.length > 0 ? (
          <StickerFormDialog
            habits={activeHabits}
            trigger={
              <DialogTrigger render={<Button size="sm" />}>
                <PlusIcon />
                New Sticker
              </DialogTrigger>
            }
          />
        ) : null}
      </div>

      {activeHabits.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Create a habit first"
          description="Stickers link a physical NFC tag to a habit — you'll need at least one active habit before creating one."
        />
      ) : stickers.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No stickers yet"
          description="Create a sticker to generate a tap link you can write to a physical NFC tag."
        />
      ) : (
        <ul className="space-y-2">
          {stickers.map((sticker) => (
            <StickerCard
              key={sticker.id}
              sticker={sticker}
              habit={habitsById.get(sticker.habitId)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
