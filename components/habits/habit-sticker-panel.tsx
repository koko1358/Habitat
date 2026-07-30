"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createSticker, initialStickerFormState, stickerUrl } from "@/lib/stickers/service";
import { useStickersForHabit } from "@/hooks/use-stickers-for-habit";
import { useAppOrigin } from "@/hooks/use-app-origin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RenameStickerDialog } from "@/components/stickers/rename-sticker-dialog";
import { RegenerateTokenDialog } from "@/components/stickers/regenerate-token-dialog";
import { DeleteStickerDialog } from "@/components/stickers/delete-sticker-dialog";
import { QrCodeDialog } from "@/components/stickers/qr-code-dialog";
import type { Habit, NfcSticker } from "@/types/domain";

/**
 * Create/view/manage a habit's NFC sticker(s) — the single place sticker
 * links get generated now (see FUTURE_NFC.md). Used two ways:
 *  - as the second step of the "New habit" dialog, right after creation
 *  - as a standalone dialog opened from an existing habit's row
 */
export function HabitStickerPanel({
  habit,
  justCreated = false,
  onDone,
}: {
  habit: Habit;
  justCreated?: boolean;
  onDone: () => void;
}) {
  const stickers = useStickersForHabit(habit.id);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-4">
      {justCreated ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {habit.icon} “{habit.name}” created. Want an NFC sticker for it?
        </p>
      ) : null}

      {stickers === undefined ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {stickers.length > 0 ? (
            <ul className="space-y-2">
              {stickers.map((sticker) => (
                <StickerRow key={sticker.id} sticker={sticker} />
              ))}
            </ul>
          ) : null}

          {stickers.length === 0 && !showCreateForm ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateForm(true)}
            >
              Generate a sticker link
            </Button>
          ) : null}

          {showCreateForm || stickers.length === 0 ? (
            <NewStickerForm
              habit={habit}
              onCreated={() => setShowCreateForm(false)}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowCreateForm(true)}
            >
              + Add another sticker
            </Button>
          )}
        </>
      )}

      <Button className="w-full" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}

function StickerRow({ sticker }: { sticker: NfcSticker }) {
  const origin = useAppOrigin();
  const url = stickerUrl(origin, sticker.token);

  async function handleCopy() {
    console.log("[TapHabit:sticker] copying url=%o token=%o", url, sticker.token);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <li className="rounded-xl border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{sticker.stickerName}</p>
          {sticker.room ? (
            <p className="text-xs text-muted-foreground">{sticker.room}</p>
          ) : null}
        </div>
        {!sticker.active ? (
          <Badge variant="secondary" className="shrink-0">
            Inactive
          </Badge>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 block w-full truncate rounded-lg bg-muted px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent"
      >
        {url}
      </button>
      <div className="mt-2 flex flex-wrap gap-1">
        <RenameStickerDialog sticker={sticker} />
        <QrCodeDialog url={url} />
        <RegenerateTokenDialog stickerId={sticker.id} />
        <DeleteStickerDialog stickerId={sticker.id} stickerName={sticker.stickerName} />
      </div>
    </li>
  );
}

function NewStickerForm({
  habit,
  onCreated,
}: {
  habit: Habit;
  onCreated: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    createSticker,
    initialStickerFormState
  );
  const [room, setRoom] = useState("");
  const derivedStickerName = room.trim() || habit.name;

  // Depends on the whole `state` object — a fresh reference every dispatch
  // — not `state.success` (a boolean). Two consecutive successful
  // submissions both resolve to `success: true`; a boolean dependency
  // sees no change between them and silently skips this effect the second
  // time. That's the exact bug that caused a stale/previous sticker's link
  // to keep showing after generating more than one in a row.
  useEffect(() => {
    if (state.success) {
      console.log(
        "[TapHabit:sticker] creation confirmed for habitId=%o — closing create form",
        habit.id
      );
      onCreated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={(formData) => {
        console.log(
          "[TapHabit:sticker] submitting habitId=%o stickerName=%o room=%o",
          habit.id,
          derivedStickerName,
          room
        );
        return formAction(formData);
      }}
      className="space-y-3 rounded-xl border border-dashed border-border p-3"
    >
      <input type="hidden" name="habitId" value={habit.id} />
      <input type="hidden" name="stickerName" value={derivedStickerName} />

      {state.formError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="sticker-room">Room (optional)</Label>
        <Input
          id="sticker-room"
          name="room"
          placeholder="e.g. Bathroom"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Generating…" : "Generate sticker link"}
      </Button>
    </form>
  );
}
