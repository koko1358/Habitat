"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { habitAccentColor } from "@/lib/design-tokens";
import { setStickerActive, stickerUrl } from "@/lib/stickers/service";
import { getLocalDateString } from "@/lib/timezone";
import { useAppOrigin } from "@/hooks/use-app-origin";
import { RenameStickerDialog } from "@/components/stickers/rename-sticker-dialog";
import { RegenerateTokenDialog } from "@/components/stickers/regenerate-token-dialog";
import { DeleteStickerDialog } from "@/components/stickers/delete-sticker-dialog";
import { QrCodeDialog } from "@/components/stickers/qr-code-dialog";
import type { Habit, NfcSticker } from "@/types/domain";

function tapStatusLabel(sticker: NfcSticker, timezone: string): string {
  if (!sticker.lastTappedAt) return "Not tapped yet";
  const today = getLocalDateString(new Date(), timezone);
  const tappedDate = getLocalDateString(new Date(sticker.lastTappedAt), timezone);
  return tappedDate === today ? "Tapped today" : "Not tapped today";
}

/** Ported from taphabit:design.html's `.sticker-list-item`, with real per-sticker data and management actions. */
export function StickerListItem({
  sticker,
  habit,
  timezone,
}: {
  sticker: NfcSticker;
  habit: Habit | undefined;
  timezone: string;
}) {
  const [isPending, startTransition] = useTransition();
  const accent = habit ? habitAccentColor(habit.id) : "#94a3b8";
  const origin = useAppOrigin();
  const url = stickerUrl(origin, sticker.token);

  function toggleActive() {
    startTransition(async () => {
      await setStickerActive(sticker.id, !sticker.active);
      toast.success(sticker.active ? "Sticker deactivated" : "Sticker activated");
    });
  }

  return (
    <li className="hb-list-item-shadow mb-2.5 rounded-[20px] bg-hb-card px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-[9px] shrink-0 rounded-full"
            style={{ background: sticker.active ? accent : "var(--hb-pip-off)" }}
          />
          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold text-hb-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              {sticker.stickerName}
            </p>
            <p className="mt-0.5 text-[10.5px] font-medium text-hb-ink-dim">
              {habit ? `${habit.icon} ${habit.name} · ` : ""}
              {sticker.active ? tapStatusLabel(sticker, timezone) : "Deactivated"}
            </p>
          </div>
        </div>
        {sticker.room ? (
          <span className="shrink-0 rounded-[9px] bg-[#f0eee6] px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.04em] text-hb-ink-dim uppercase">
            {sticker.room}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <RenameStickerDialog sticker={sticker} />
        <QrCodeDialog url={url} />
        <RegenerateTokenDialog stickerId={sticker.id} />
        <button
          type="button"
          disabled={isPending}
          onClick={toggleActive}
          className="rounded-md px-2 py-1 text-xs font-medium text-hb-ink-dim hover:bg-hb-tab-bg disabled:opacity-60"
        >
          {sticker.active ? "Deactivate" : "Activate"}
        </button>
        <DeleteStickerDialog stickerId={sticker.id} stickerName={sticker.stickerName} />
      </div>
    </li>
  );
}
