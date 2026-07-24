"use client";

import { useAllHabits } from "@/hooks/use-habits";
import { HabitsView } from "@/components/habits/habits-view";
import { ListPageSkeleton } from "@/components/shared/skeletons";

export default function HabitsPage() {
  const habits = useAllHabits();

  if (!habits) {
    return <ListPageSkeleton />;
  }

  return <HabitsView habits={habits} />;
}
