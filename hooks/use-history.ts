"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getCompletionHistory } from "@/lib/completions/service";
import { getAllHabits } from "@/lib/habits/service";
import type { Habit, HistoryEntry } from "@/types/domain";

export function useHistory(sinceDays = 90): HistoryEntry[] | undefined {
  return useLiveQuery(async () => {
    const [completions, habits] = await Promise.all([
      getCompletionHistory({ sinceDays }),
      getAllHabits(),
    ]);
    const habitsById = new Map<string, Habit>(habits.map((h) => [h.id, h]));

    return completions.flatMap((completion) => {
      const habit = habitsById.get(completion.habitId);
      if (!habit) return [];
      return [
        {
          completion,
          habit: {
            id: habit.id,
            name: habit.name,
            icon: habit.icon,
            category: habit.category,
            isActive: habit.isActive,
          },
        },
      ];
    });
  }, [sinceDays]);
}
