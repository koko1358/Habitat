"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getStickersForHabit } from "@/lib/stickers/service";
import type { NfcSticker } from "@/types/domain";

export function useStickersForHabit(habitId: string): NfcSticker[] | undefined {
  return useLiveQuery(() => getStickersForHabit(habitId), [habitId]);
}
