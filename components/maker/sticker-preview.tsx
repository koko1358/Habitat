"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { stickerUrl } from "@/lib/stickers/service";
import { useAppOrigin } from "@/hooks/use-app-origin";
import type { Habit, NfcSticker } from "@/types/domain";

/**
 * Ported from taphabit:design.html's `.sticker-preview` — shown right after
 * generating a sticker. The mockup's dot grid is decorative/fake; this
 * renders a real, scannable QR code instead (same idea, actually useful).
 */
export function StickerPreview({
  sticker,
  habit,
}: {
  sticker: NfcSticker;
  habit: Habit | undefined;
}) {
  const origin = useAppOrigin();
  const url = stickerUrl(origin, sticker.token);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 160, margin: 1 }).then((generated) => {
      if (!cancelled) setQrDataUrl(generated);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <div className="mb-3.5 rounded-hb-card border border-dashed border-[#d8d3c4] bg-[#f8f6f0] p-4">
      <p className="mb-3 text-[15px] font-bold text-hb-ink" style={{ letterSpacing: "-0.02em" }}>
        {habit ? `${habit.icon} ${habit.name}` : sticker.stickerName}
      </p>

      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small data: URL, not an optimizable remote image
        <img src={qrDataUrl} alt="" className="mb-3 size-24 rounded-md" />
      ) : (
        <div className="mb-3 size-24 animate-pulse rounded-md bg-[#eeece3]" />
      )}

      <div className="flex items-center gap-2 rounded-xl bg-[#efece3] px-2.5 py-2">
        <span
          className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] text-hb-ink-dim"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {url}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy sticker link"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-hb-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="#fff" strokeWidth="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="#fff" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
