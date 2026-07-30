"use client";

import { useEffect, type ReactNode } from "react";
import { ensureSettings } from "@/lib/db/db";
import { HabitHeader } from "@/components/nav/habit-header";
import { TabSwitcher } from "@/components/nav/tab-switcher";
import { OfflineIndicator } from "@/components/nav/offline-indicator";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureSettings();

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline caching is a nice-to-have — habit data itself still works
        // fully offline via IndexedDB even if the service worker fails.
      });
    }
  }, []);

  return (
    // overflow-x-hidden here is a deliberate safety net: without it, any
    // descendant that doesn't wrap/shrink correctly on a narrow viewport
    // (a non-wrapping flex row, a fixed-width control, etc.) can silently
    // widen the whole page instead of visibly breaking, pushing controls
    // off-screen with no scrollbar hint on mobile to reveal it.
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <OfflineIndicator />

      <div className="mx-auto w-full min-w-0 max-w-md flex-1 px-5 pt-[calc(env(safe-area-inset-top)+22px)] pb-10 md:px-8">
        <HabitHeader />

        <div className="mt-4 mb-3">
          <TabSwitcher />
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
