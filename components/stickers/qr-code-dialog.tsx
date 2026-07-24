"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function QrCodeDialog({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    QRCode.toDataURL(url, { width: 320, margin: 1 })
      .then((generated) => {
        if (!cancelled) setDataUrl(generated);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't generate a QR code.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, url]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        QR Code
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan to test</DialogTitle>
          <DialogDescription>
            This QR code is for testing the tap link — it&apos;s not what you
            write to the sticker itself.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a data: URL, not an optimizable remote image
            <img
              src={dataUrl}
              alt={`QR code for ${url}`}
              className="size-64 rounded-lg border border-border"
            />
          ) : (
            <div className="size-64 animate-pulse rounded-lg bg-muted" />
          )}
          <p className="break-all text-center text-xs text-muted-foreground">
            {url}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
