import type { ComponentType } from "react";
import { HabitsTabIcon, SummaryTabIcon, TodayTabIcon } from "@/components/nav/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * The pill switcher's tabs. Habits replaced the old "Maker" tab once habit
 * creation and sticker-link generation were consolidated into one flow on
 * /habits — that page is the app's single habit interface now, so it has
 * to be reachable from primary nav, not just a direct URL.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Today", icon: TodayTabIcon },
  { href: "/habits", label: "Habits", icon: HabitsTabIcon },
  { href: "/summary", label: "Summary", icon: SummaryTabIcon },
];
