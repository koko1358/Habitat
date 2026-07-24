"use client";

import { useStickers } from "@/hooks/use-stickers";
import { useAllHabits } from "@/hooks/use-habits";
import { StickersView } from "@/components/stickers/stickers-view";
import { ListPageSkeleton } from "@/components/shared/skeletons";

export default function StickersPage() {
  const stickers = useStickers();
  const habits = useAllHabits();

  if (!stickers || !habits) {
    return <ListPageSkeleton />;
  }

  return <StickersView stickers={stickers} habits={habits} />;
}
