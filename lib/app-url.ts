const DEFAULT_APP_URL = "http://localhost:3000";

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * The app's origin as known at render time on the server (and during the
 * client's first hydration pass, so the two match and don't trigger a
 * hydration mismatch). Prefers `NEXT_PUBLIC_APP_URL`; falls back to
 * localhost for local dev when it isn't set.
 *
 * Never reads `window.location` — see `useAppOrigin` (hooks/use-app-origin.ts)
 * for the client-corrected value to use once mounted.
 */
export function getServerAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  return stripTrailingSlash(configured || DEFAULT_APP_URL);
}
