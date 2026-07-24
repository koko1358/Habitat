"use client";

import { useSettings } from "@/hooks/use-settings";
import { useHistory } from "@/hooks/use-history";
import { useAllHabits } from "@/hooks/use-habits";
import { HistoryView } from "@/components/history/history-view";
import { ListPageSkeleton } from "@/components/shared/skeletons";

export default function HistoryPage() {
  const settings = useSettings();
  const habits = useAllHabits();
  const entries = useHistory();

  if (!settings || !habits || !entries) {
    return <ListPageSkeleton />;
  }

  return (
    <HistoryView
      entries={entries}
      habits={habits}
      timezone={settings.timezone}
      confirmBeforeDelete={settings.confirmBeforeDelete}
    />
  );
}
