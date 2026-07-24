"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, SETTINGS_ID } from "@/lib/db/db";
import type { Settings } from "@/types/domain";

/** Reactive read of the single local settings record. Undefined while loading or before `ensureSettings()` has run. */
export function useSettings(): Settings | undefined {
  return useLiveQuery(() => db.settings.get(SETTINGS_ID), []);
}
