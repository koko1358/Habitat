"use client";

import { useSettings } from "@/hooks/use-settings";
import { useAllHabits } from "@/hooks/use-habits";
import { useStickers } from "@/hooks/use-stickers";
import { MakerView } from "@/components/maker/maker-view";
import { ListPageSkeleton } from "@/components/shared/skeletons";

export default function MakerPage() {
  const settings = useSettings();
  const habits = useAllHabits();
  const stickers = useStickers();

  if (!settings || !habits || !stickers) {
    return <ListPageSkeleton />;
  }

  return <MakerView habits={habits} stickers={stickers} timezone={settings.timezone} />;
}
