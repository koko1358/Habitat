"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getActiveHabits, getAllHabits } from "@/lib/habits/service";
import type { Habit } from "@/types/domain";

export function useActiveHabits(): Habit[] | undefined {
  return useLiveQuery(() => getActiveHabits(), []);
}

export function useAllHabits(): Habit[] | undefined {
  return useLiveQuery(() => getAllHabits(), []);
}
