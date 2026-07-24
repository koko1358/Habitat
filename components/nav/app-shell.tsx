"use client";

import { useEffect, type ReactNode } from "react";
import { ensureSettings } from "@/lib/db/db";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
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
    <div className="flex min-h-dvh bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineIndicator />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-8 md:py-8 md:pt-8">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
