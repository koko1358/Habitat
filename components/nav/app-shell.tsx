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
    <div className="flex min-h-dvh flex-col">
      <OfflineIndicator />

      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-[calc(env(safe-area-inset-top)+22px)] pb-10 md:px-8">
        <HabitHeader />

        <div className="mt-4 mb-3">
          <TabSwitcher />
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
