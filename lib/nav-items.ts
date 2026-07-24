import type { LucideIcon } from "lucide-react";
import { BarChart3, History, ListChecks, Nfc, Settings, Sun } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/history", label: "History", icon: History },
  { href: "/stickers", label: "Stickers", icon: Nfc },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
