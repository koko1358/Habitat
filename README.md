# Habitap

A simple, personal, mobile-first habit tracker: see today's habits, mark
them complete, watch streaks build, review history and trends, and tap
physical NFC stickers to log habits. Installable to an iPhone Home Screen
as a PWA.

**Fully local-first — there is no backend, no accounts, and no cloud
database.** All data (habits, completions, settings, NFC stickers) is
stored in the browser via IndexedDB (through [Dexie.js](https://dexie.org)).
Nothing is synced anywhere. See
[**Local-first storage — read this**](#local-first-storage--read-this)
below before you rely on it across devices.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui (Base UI primitives)
- Dexie.js over IndexedDB — no server, no database, no auth
- date-fns for dates/streaks, Zod for validation, Recharts for charts
- `qrcode` for generating a test QR code from a sticker's tap link
- Vitest for unit tests (streak math + Dexie-backed completion logic via
  `fake-indexeddb`)

## Project structure

```
app/
  page.tsx                  Today dashboard ("/")
  habits/, history/, analytics/, settings/, stickers/
  tap/[token]/               NFC sticker tap-to-complete route
  manifest.ts                 PWA manifest
  icon.tsx, apple-icon.tsx     generated app icons
components/                  presentational + client components, grouped by feature
lib/
  db/                         Dexie schema (db.ts) — the only place IndexedDB is opened
  habits/                     scheduling, validation, CRUD service, today-dashboard aggregation
  completions/                the single completion-creation/undo/soft-delete service
  stickers/                   NFC sticker CRUD + token generation
  streaks/                    pure streak math (unit tested)
  analytics/                  analytics aggregate functions
  backup/                     export/import/reset (schema + Zod validation)
  app-url.ts                   hydration-safe app-origin helper (see below)
hooks/                       useLiveQuery-based hooks (reactive Dexie reads)
types/domain.ts               app-level types (Habit, HabitCompletion, NfcSticker, Settings)
tests/                       Vitest unit tests
public/sw.js                  minimal offline-shell service worker
```

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. There's no sign-in — it opens straight to
the Today dashboard. Create a habit at `/habits` to get started.

No `.env.local` is required to run the app. See
[Environment variable](#environment-variable) below for the one optional
variable that affects NFC sticker links.

### Testing on your iPhone over the same Wi-Fi (development only)

This is **only** for testing the dev server from your phone while your
laptop is running it — the deployed Vercel app doesn't need this.

```bash
npm run dev -- --hostname 0.0.0.0
```

Find your laptop's local IP (macOS: **System Settings → Wi-Fi → Details**,
or `ipconfig getifaddr en0` in Terminal), then on your iPhone (same Wi-Fi
network) open:

```
http://LOCAL-IP:3000
```

## Environment variable

Habitap has exactly one environment variable, and the app works without
it:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

It's only used to build NFC sticker tap links
(`{origin}/tap/{token}`) at the moment before the browser has taken over
rendering — i.e. during server rendering and the very first client
render, where there's no `window` yet. `hooks/use-app-origin.ts` renders
this value first (matching server and client exactly, so there's no
hydration mismatch), then swaps to the real `window.location.origin`
right after mount. In practice, once the page has loaded, sticker links
always reflect wherever the app is actually running.

Copy `.env.example` to `.env.local` for local dev (already defaults to
`http://localhost:3000`, so this step is optional). **In Vercel**, set it
to your deployed domain, e.g.:

```
NEXT_PUBLIC_APP_URL=https://tap-habit.vercel.app
```

If you're not sure what your final Vercel URL will be yet, deploy first,
then set this variable to the real URL and redeploy — see
[Deploying to Vercel](#deploying-to-vercel).

## Testing

```bash
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript (or: npm run typecheck)
npm run test         # Vitest — streak math, timezone boundaries, completion service
npm run build        # production build
```

### Manually testing the core flow

1. Go to `/habits`, create a habit (e.g. daily, target 1).
2. Go to `/` (Today) — the habit appears under "Today's Habits".
3. Tap **Complete** — the card updates immediately, no page reload.
4. Tap **Undo** (on the card, or from the toast) — the completion is
   removed.
5. Go to `/history` — completions show up there, grouped by day.
6. **Refresh the page** — everything persists (it's in IndexedDB, not
   memory).
7. On `/habits`, open that habit's **Sticker** action and generate a
   link, then open it (`/tap/<token>`) directly — it completes the habit
   and shows a success screen with Undo.

## Local-first storage — read this

**Every browser/device stores its own separate copy of your data. There
is no sync between devices, and no server-side backup.** Opening the
same deployed URL on a different phone, a different browser, or in
Incognito/Private mode starts with a completely empty, independent
database — it is not the same data.

Practical implications:

- Clearing a browser's site data, uninstalling and reinstalling as a PWA
  in a way that resets storage, or switching browsers loses that copy of
  the data.
- The `/tap/[token]` NFC link **must be opened in the same browser
  context** where the habit data lives (see the iOS-specific note in the
  testing checklist below — Safari and an added-to-Home-Screen PWA can be
  different storage contexts on iOS).
- There's no account recovery, because there's no account. Use
  Settings → Export (once wired up) to keep a JSON backup if you care
  about not losing history.

## Deploying to Vercel

The app is a stock Next.js app with no backend — there is nothing
Vercel-specific to configure beyond the optional environment variable.

### Method A: Vercel website

1. Push this repo to GitHub (see the Git section your assistant/README
   generator left you, or `git remote add origin <url>` if you haven't
   yet).
2. Go to [vercel.com](https://vercel.com) and log in (or create an
   account).
3. Click **Add New… → Project**.
4. **Import** the GitHub repository.
5. Vercel auto-detects **Framework Preset: Next.js** — leave it as-is.
6. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_APP_URL` = `https://<whatever-your-project-will-be>.vercel.app`
     (a reasonable guess is fine — you'll fix it in step 8 if needed)
7. Click **Deploy**.
8. Once deployed, copy the real URL Vercel gives you. If it differs from
   what you guessed in step 6, update `NEXT_PUBLIC_APP_URL` in
   **Project → Settings → Environment Variables** to the real URL.
9. **Redeploy** (Deployments tab → ⋯ on the latest deployment →
   Redeploy) so the new environment variable takes effect.

### Method B: Vercel CLI

```bash
npm install -g vercel   # if not already installed
vercel login
vercel                  # first deploy — follow the prompts (creates a preview deployment)
vercel --prod           # promote to production
```

Set the environment variable either in the dashboard (as above) or via:

```bash
vercel env add NEXT_PUBLIC_APP_URL production
```

then redeploy with `vercel --prod`.

### Production testing checklist (do this on your iPhone)

1. Open the Vercel URL in **Safari**.
2. Create a test habit.
3. Refresh and confirm it's still there.
4. On `/habits`, open that habit's **Sticker** action and generate one.
5. Confirm the copied link uses your **Vercel domain**, not
   `localhost`.
6. Open the `/tap/[token]` link manually (paste it in a new Safari tab).
7. Confirm the habit gets logged (✅ Habit Completed screen).
8. Go back to the dashboard and refresh — confirm the completion counts
   it.
9. Add the site to your iPhone Home Screen (Share → Add to Home Screen).
10. Open it **from the Home Screen icon** and confirm the same habit/
    completion data is visible.

**Important iOS caveat:** Safari and a Home-Screen-launched PWA can use
different storage contexts depending on iOS version and how the icon was
added, which would make step 10 show an empty dashboard even though
everything worked in Safari. If that happens, treat Safari as the
primary/authoritative experience and open NFC tap links in Safari rather
than expecting them to share storage with the Home Screen app. Test the
tap link in whichever context you actually created the habit in.

## Notes on the data model

- Timestamps are stored in UTC (`completedAt`); `localDate` on each
  completion is precomputed from the timezone in Settings at write time,
  so streak and analytics logic never has to do timezone math itself —
  see `lib/timezone.ts` and `lib/streaks/`.
- Completions are soft-deleted (`deletedAt`), never hard-deleted, so
  Undo/delete can't silently corrupt analytics; queries always filter out
  soft-deleted rows.
- `HabitCompletion.source` supports `"nfc"` and `"shortcut"` values in
  addition to `"manual"` — NFC tap-to-complete is implemented (see
  [`FUTURE_NFC.md`](./FUTURE_NFC.md)); Shortcuts is not, but would reuse
  the exact same `createHabitCompletion()` path.
