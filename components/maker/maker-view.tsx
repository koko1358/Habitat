"use client";

import { useMemo, useState } from "react";
import { NewHabitCard } from "@/components/maker/new-habit-card";
import { NewStickerCard } from "@/components/maker/new-sticker-card";
import { StickerPreview } from "@/components/maker/sticker-preview";
import { StickerListItem } from "@/components/maker/sticker-list-item";
import { EmptyState } from "@/components/shared/empty-state";
import type { Habit, NfcSticker } from "@/types/domain";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="mt-5 mb-2.5 text-[12px] font-bold tracking-[0.09em] text-hb-ink-faint uppercase first:mt-0">
      {children}
    </p>
  );
}

export function MakerView({
  habits,
  stickers,
  timezone,
}: {
  habits: Habit[];
  stickers: NfcSticker[];
  timezone: string;
}) {
  const [previewSticker, setPreviewSticker] = useState<NfcSticker | null>(null);
  const habitsById = useMemo(() => new Map(habits.map((h) => [h.id, h])), [habits]);
  const activeHabits = useMemo(() => habits.filter((h) => h.isActive), [habits]);

  return (
    <div>
      <Eyebrow>New habit</Eyebrow>
      <NewHabitCard />

      <Eyebrow>New sticker</Eyebrow>
      {activeHabits.length > 0 ? (
        <NewStickerCard habits={activeHabits} onCreated={setPreviewSticker} />
      ) : (
        <EmptyState
          icon="🏷️"
          title="Create a habit first"
          description="Add a habit above, then come back to generate its sticker link."
        />
      )}

      {previewSticker ? (
        <StickerPreview
          sticker={previewSticker}
          habit={habitsById.get(previewSticker.habitId)}
        />
      ) : null}

      <Eyebrow>Your stickers</Eyebrow>
      {stickers.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No stickers yet"
          description="Generate one above to get a link you can write to a physical NFC tag."
        />
      ) : (
        <ul>
          {stickers.map((sticker) => (
            <StickerListItem
              key={sticker.id}
              sticker={sticker}
              habit={habitsById.get(sticker.habitId)}
              timezone={timezone}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
