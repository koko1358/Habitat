import type { ComponentType } from "react";
import { MakerTabIcon, SummaryTabIcon, TodayTabIcon } from "@/components/nav/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

/** Exactly the 3 tabs from taphabit:design.html's pill switcher. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Today", icon: TodayTabIcon },
  { href: "/summary", label: "Summary", icon: SummaryTabIcon },
  { href: "/maker", label: "Maker", icon: MakerTabIcon },
];
