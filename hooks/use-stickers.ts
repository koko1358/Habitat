"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getAllStickers } from "@/lib/stickers/service";
import type { NfcSticker } from "@/types/domain";

export function useStickers(): NfcSticker[] | undefined {
  return useLiveQuery(() => getAllStickers(), []);
}
