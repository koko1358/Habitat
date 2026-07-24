"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { RenameStickerDialog } from "@/components/stickers/rename-sticker-dialog";
import { QrCodeDialog } from "@/components/stickers/qr-code-dialog";
import { DeleteStickerDialog } from "@/components/stickers/delete-sticker-dialog";
import { RegenerateTokenDialog } from "@/components/stickers/regenerate-token-dialog";
import { setStickerActive, stickerUrl } from "@/lib/stickers/service";
import { useAppOrigin } from "@/hooks/use-app-origin";
import type { Habit, NfcSticker } from "@/types/domain";

export function StickerCard({
  sticker,
  habit,
}: {
  sticker: NfcSticker;
  habit: Habit | undefined;
}) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const origin = useAppOrigin();
  const url = stickerUrl(origin, sticker.token);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  function toggleActive() {
    startTransition(async () => {
      await setStickerActive(sticker.id, !sticker.active);
      toast.success(sticker.active ? "Sticker deactivated" : "Sticker activated");
    });
  }

  return (
    <li
      className={`rounded-2xl border bg-card p-4 ${
        sticker.active ? "border-border" : "border-border/60 bg-card/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{sticker.stickerName}</p>
            {!sticker.active ? (
              <Badge variant="secondary" className="font-normal">
                Inactive
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {habit ? `${habit.icon} ${habit.name}` : "Habit no longer exists"}
            {sticker.room ? ` · ${sticker.room}` : ""}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 flex w-full items-center gap-1.5 truncate rounded-lg bg-muted px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent"
      >
        <CopyIcon className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{url}</span>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy Link"}
        </Button>
        <QrCodeDialog url={url} />
        <RenameStickerDialog sticker={sticker} />
        <RegenerateTokenDialog stickerId={sticker.id} />
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={toggleActive}
        >
          {sticker.active ? "Deactivate" : "Activate"}
        </Button>
        <DeleteStickerDialog stickerId={sticker.id} stickerName={sticker.stickerName} />
      </div>
    </li>
  );
}
