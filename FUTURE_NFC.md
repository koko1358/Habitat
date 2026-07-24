# NFC support

NFC sticker tap-to-complete is implemented. This file documents how it
works and how to write a generated link to a physical tag.

## How it fits together

**`lib/completions/service.ts` — `createHabitCompletion({ habitId, timezone, source, completedAt? })`**

This is the single write path for recording a completion, regardless of
where the tap came from. The manual Complete button
(`components/dashboard/habit-card.tsx`) calls it with `source: "manual"`.
The NFC tap route (`app/tap/[token]/page.tsx`) calls the exact same
function with `source: "nfc"` — no duplicated validation, no separate
streak/analytics path. `source` also supports `"shortcut"` and
`"imported"` for the same reason, even though nothing produces those yet.

**`nfcStickers` table (`lib/db/db.ts`, Dexie schema v2)**

Each row: `id`, `habitId`, `stickerName`, `room`, `token` (16 hex chars
from `crypto.getRandomValues`), `createdAt`, `updatedAt`, `lastTappedAt`,
`active`. Managed entirely client-side via `lib/stickers/service.ts` — no
backend, matching the rest of the app.

**`/stickers`** — create/rename/regenerate/deactivate/delete stickers,
copy the tap link, and generate a QR code for testing (`components/stickers/`).

**`/tap/[token]`** (`app/tap/[token]/page.tsx`) — the route a physical tag
opens:
1. Looks up the sticker by token. Missing or inactive → friendly "Invalid
   Sticker" screen (habit-not-found behaves the same way).
2. If a tap for the same sticker landed within the last 60 seconds
   (`sticker.lastTappedAt`), skips creating a new completion — prevents a
   bumpy/accidental double-scan from double-logging.
3. Otherwise calls `createHabitCompletion({ habitId, timezone, source: "nfc" })`.
   If the habit only allows one completion/day and was already completed
   today (e.g. via the manual button), the resulting
   `HabitAlreadyCompletedError` is treated as a success, not a failure —
   the screen just shows today's existing completion time.
4. Updates `lastTappedAt` and shows "✅ Habit Completed" with the habit's
   icon, name, completion time, an Undo button, and a link back to `/`.

## Writing the link to a physical NFC sticker (NFC Tools)

1. On `/stickers`, create a sticker and tap **Copy Link** — you get
   something like `https://your-app.vercel.app/tap/4ba9f22ab81cd91e`.
2. Install **NFC Tools** (iOS App Store / Google Play — by wakdev).
3. Open NFC Tools → **Write** → **Add a record** → **URL/URI**.
4. Paste the copied link into the URL field and confirm.
5. Tap **Write** and hold the phone against a blank NFC sticker (NTAG213/215/216
   work well and are cheap) until NFC Tools confirms the write succeeded.
6. Stick it wherever the habit happens (e.g. the bathroom mirror for
   "Brush Teeth"). Tapping your phone on it opens the link and completes
   the habit.
7. Use **QR Code** on the sticker's card in `/stickers` first to confirm
   the link itself works (scan it with your camera) before writing it to
   a physical tag — it's much faster to fix a wrong habit/link before
   it's on a sticker than after.
8. If you ever need to change what a sticker does, use **Regenerate
   Token** (invalidates the old link — you'll need to rewrite the
   sticker) rather than editing the habit it points to, unless you
   actually want the same physical sticker to keep completing whatever
   habit it's mapped to.
