"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  // Always starts `true` (matching the server, which has no `navigator` at
  // all) — reading the real navigator.onLine synchronously here would run
  // during the client's first render too, and if that first real reading
  // is `false`, it'd render different content than the server did and
  // throw a hydration mismatch. The real value is only applied post-mount.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
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
