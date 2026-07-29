"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createSticker,
  getStickersForHabit,
  initialStickerFormState,
} from "@/lib/stickers/service";
import { FieldLabel, FieldError } from "@/components/maker/field-label";
import type { Habit, NfcSticker } from "@/types/domain";

export function NewStickerCard({
  habits,
  onCreated,
}: {
  habits: Habit[];
  onCreated: (sticker: NfcSticker) => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createSticker,
    initialStickerFormState
  );
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [room, setRoom] = useState("");

  // Derived rather than synced via effect: falls back to the first habit
  // whenever there's no explicit user selection yet, or the previously
  // selected habit disappeared (e.g. archived) — no extra render/effect
  // needed to keep it in sync as `habits` changes.
  const habitId =
    selectedHabitId && habits.some((h) => h.id === selectedHabitId)
      ? selectedHabitId
      : (habits[0]?.id ?? "");

  const selectedHabit = habits.find((h) => h.id === habitId);
  // The mockup has no "sticker name" field — only Habit + Room — so one is
  // derived automatically to satisfy the (unchanged) required schema field.
  const derivedStickerName = room.trim() || selectedHabit?.name || "Sticker";

  useEffect(() => {
    if (!state.success || !habitId) return;

    let cancelled = false;
    getStickersForHabit(habitId).then((stickers) => {
      if (cancelled || stickers.length === 0) return;
      const latest = stickers.reduce((a, b) =>
        a.createdAt > b.createdAt ? a : b
      );
      onCreated(latest);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="hb-card-shadow mb-3.5 rounded-hb-card bg-hb-card p-[18px]">
      <form action={formAction}>
        {state.formError ? (
          <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.formError}
          </p>
        ) : null}

        <input type="hidden" name="stickerName" value={derivedStickerName} />

        <FieldLabel htmlFor="mk-habit">Habit</FieldLabel>
        <select
          id="mk-habit"
          name="habitId"
          value={habitId}
          onChange={(e) => setSelectedHabitId(e.target.value)}
          className="hb-field mb-3.5 appearance-none"
        >
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.icon} {habit.name}
            </option>
          ))}
        </select>
        {state.errors.habitId ? <FieldError message={state.errors.habitId[0]} /> : null}

        <FieldLabel htmlFor="mk-room">Room (optional)</FieldLabel>
        <input
          id="mk-room"
          name="room"
          placeholder="CR"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="hb-field mb-3.5"
        />
        {state.errors.room ? <FieldError message={state.errors.room[0]} /> : null}

        <button type="submit" disabled={isPending} className="hb-gen-btn">
          {isPending ? "Generating…" : "Generate sticker link"}
        </button>
      </form>
    </div>
  );
}
