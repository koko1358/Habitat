"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

function getInitialOnlineStatus() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
      <WifiOff className="size-3.5" aria-hidden />
      Offline — your data is saved on this device
    </div>
  );
}
