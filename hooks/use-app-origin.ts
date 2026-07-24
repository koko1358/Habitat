"use client";

import { useEffect, useState } from "react";
import { getServerAppUrl } from "@/lib/app-url";

/**
 * The app's origin, safe to use during render.
 *
 * Renders `NEXT_PUBLIC_APP_URL` (or the localhost fallback) on the server
 * and during the client's first hydration pass — identical output on both,
 * so no hydration mismatch — then swaps to the real
 * `window.location.origin` once mounted, which is what should actually be
 * used for links generated in the browser (e.g. a Vercel preview URL that
 * differs from the configured production `NEXT_PUBLIC_APP_URL`).
 */
export function useAppOrigin(): string {
  const [origin, setOrigin] = useState(getServerAppUrl);

  useEffect(() => {
    // Safe: window.location.origin is stable and this only ever moves the
    // displayed URL from the SSR fallback to the real one, post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  return origin;
}
