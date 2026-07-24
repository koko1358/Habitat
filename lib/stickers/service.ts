import { z } from "zod";
import { db } from "@/lib/db/db";
import {
  stickerFormSchema,
  type StickerFormFieldErrors,
} from "@/lib/stickers/validation";
import type { NfcSticker } from "@/types/domain";

export interface StickerFormState {
  errors: StickerFormFieldErrors;
  formError: string | null;
  success: boolean;
}

export const initialStickerFormState: StickerFormState = {
  errors: {},
  formError: null,
  success: false,
};

/** 16 hex characters from 8 cryptographically random bytes, e.g. "4ba9f22ab81cd91e". */
export function generateStickerToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Builds the tap URL for a sticker. Takes `origin` explicitly rather than
 * reading `window.location` itself — callers rendering this should get the
 * origin from `useAppOrigin()` (hooks/use-app-origin.ts) so the value is
 * hydration-safe and falls back to `NEXT_PUBLIC_APP_URL` when there's no
 * window (SSR) or before the client has corrected it.
 */
export function stickerUrl(origin: string, token: string): string {
  return `${origin}/tap/${token}`;
}

export async function createSticker(
  _prevState: StickerFormState,
  formData: FormData
): Promise<StickerFormState> {
  const parsed = stickerFormSchema.safeParse({
    habitId: formData.get("habitId"),
    stickerName: formData.get("stickerName"),
    room: formData.get("room") ?? "",
  });

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors as StickerFormFieldErrors,
      formError: null,
      success: false,
    };
  }

  const now = new Date().toISOString();
  const sticker: NfcSticker = {
    id: crypto.randomUUID(),
    habitId: parsed.data.habitId,
    stickerName: parsed.data.stickerName,
    room: parsed.data.room,
    token: generateStickerToken(),
    createdAt: now,
    updatedAt: now,
    lastTappedAt: null,
    active: true,
  };

  try {
    await db.nfcStickers.add(sticker);
  } catch (error) {
    return {
      errors: {},
      formError: error instanceof Error ? error.message : "Couldn't save sticker",
      success: false,
    };
  }

  return { errors: {}, formError: null, success: true };
}

export async function renameSticker(
  id: string,
  stickerName: string,
  room: string
): Promise<void> {
  await db.nfcStickers.update(id, {
    stickerName,
    room,
    updatedAt: new Date().toISOString(),
  });
}

export async function regenerateStickerToken(id: string): Promise<string> {
  const token = generateStickerToken();
  await db.nfcStickers.update(id, {
    token,
    updatedAt: new Date().toISOString(),
  });
  return token;
}

export async function setStickerActive(id: string, active: boolean): Promise<void> {
  await db.nfcStickers.update(id, {
    active,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteSticker(id: string): Promise<void> {
  await db.nfcStickers.delete(id);
}

export async function getAllStickers(): Promise<NfcSticker[]> {
  const all = await db.nfcStickers.toArray();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getStickerByToken(
  token: string
): Promise<NfcSticker | undefined> {
  return db.nfcStickers.get({ token });
}

export async function getStickersForHabit(habitId: string): Promise<NfcSticker[]> {
  return db.nfcStickers.where("habitId").equals(habitId).toArray();
}

export async function recordStickerTap(id: string): Promise<void> {
  await db.nfcStickers.update(id, { lastTappedAt: new Date().toISOString() });
}
