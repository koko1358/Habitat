"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ensureSettings } from "@/lib/db/db";
import { getStickerByTokenWithDiagnostics, recordStickerTap } from "@/lib/stickers/service";
import { getHabitById } from "@/lib/habits/service";
import {
  createHabitCompletion,
  getCompletionsForDate,
  HabitAlreadyCompletedError,
  undoLatestHabitCompletion,
} from "@/lib/completions/service";
import { getLocalDateString, getLocalTimeString } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import type { Habit } from "@/types/domain";

const DEDUPE_WINDOW_MS = 60_000;

interface NotFoundDiagnostics {
  receivedToken: string;
  storedCount: number;
  storedTokens: string[];
}

type TapState =
  | { status: "loading" }
  | { status: "invalid"; reason: string; diagnostics?: NotFoundDiagnostics }
  | {
      status: "success";
      habit: Habit;
      completedAt: string;
      timezone: string;
    };

export default function TapPage() {
  const params = useParams<{ token: string }>();
  const [state, setState] = useState<TapState>({ status: "loading" });
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    async function processTap() {
      const receivedToken = params.token;
      console.log(
        "[TapHabit:tap] received token=%o (len=%d) full pathname=%o",
        receivedToken,
        receivedToken?.length,
        typeof window !== "undefined" ? window.location.pathname : "(no window)"
      );

      const { sticker, storedCount, storedTokens } =
        await getStickerByTokenWithDiagnostics(receivedToken);

      console.log(
        "[TapHabit:tap] lookup result found=%o storedCount=%d storedTokens=%o",
        Boolean(sticker),
        storedCount,
        storedTokens
      );

      if (!sticker) {
        setState({
          status: "invalid",
          reason: "This sticker link isn't recognized.",
          diagnostics: { receivedToken, storedCount, storedTokens },
        });
        return;
      }
      if (!sticker.active) {
        setState({ status: "invalid", reason: "This sticker has been deactivated." });
        return;
      }

      const habit = await getHabitById(sticker.habitId);
      if (!habit) {
        setState({ status: "invalid", reason: "This sticker's habit no longer exists." });
        return;
      }

      const settings = await ensureSettings();
      const now = new Date();
      const withinDedupeWindow =
        sticker.lastTappedAt !== null &&
        now.getTime() - new Date(sticker.lastTappedAt).getTime() < DEDUPE_WINDOW_MS;

      if (!withinDedupeWindow) {
        try {
          await createHabitCompletion({
            habitId: habit.id,
            timezone: settings.timezone,
            source: "nfc",
          });
        } catch (error) {
          // Already completed today (e.g. via the manual button) — still a
          // success from the user's point of view, just nothing new to
          // record. Fall through to show today's existing completion time.
          if (!(error instanceof HabitAlreadyCompletedError)) {
            throw error;
          }
        }
      }

      await recordStickerTap(sticker.id);

      const today = getLocalDateString(now, settings.timezone);
      const todaysCompletions = await getCompletionsForDate(habit.id, today);
      const latest = todaysCompletions.sort((a, b) =>
        b.completedAt.localeCompare(a.completedAt)
      )[0];
      const completedAt = latest?.completedAt ?? now.toISOString();

      setState({
        status: "success",
        habit,
        completedAt,
        timezone: settings.timezone,
      });
    }

    processTap().catch((error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setState({ status: "invalid", reason: "Something went wrong recording this tap." });
    });
  }, [params.token]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <div className="size-10 animate-pulse rounded-full bg-muted" />
        <p className="text-sm text-muted-foreground">Logging your habit…</p>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="text-4xl">🚫</span>
        <h1 className="text-xl font-semibold">Invalid Sticker</h1>
        <p className="max-w-xs text-sm text-muted-foreground">{state.reason}</p>
        <Button className="mt-2" render={<Link href="/" />}>
          Back to Dashboard
        </Button>
        {state.diagnostics ? <NotFoundDebugPanel {...state.diagnostics} /> : null}
      </div>
    );
  }

  return (
    <TapSuccess
      habit={state.habit}
      completedAt={state.completedAt}
      timezone={state.timezone}
    />
  );
}

/**
 * Visible (not just console) diagnostics for a "sticker not recognized" tap
 * — iPhone Safari's console isn't reachable without a Mac + cable, so this
 * is the fastest way to tell "wrong browser storage context" (0 stickers,
 * or none of the stored tokens match) apart from a genuine typo/bad link.
 */
function NotFoundDebugPanel({
  receivedToken,
  storedCount,
  storedTokens,
}: NotFoundDiagnostics) {
  return (
    <div className="mt-4 w-full max-w-sm rounded-xl border border-dashed border-border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
      <p className="font-medium text-foreground">Debug info</p>
      <p className="mt-1 break-all">
        Received token: <span className="font-mono">{receivedToken || "(empty)"}</span>
      </p>
      <p>Stickers in this browser&apos;s storage: {storedCount}</p>
      {storedCount === 0 ? (
        <p className="mt-2">
          This browser has <strong>zero</strong> stickers saved. If you
          created the sticker in Safari but opened this link from the
          Home Screen app (or vice versa), that&apos;s almost certainly why —
          on iPhone those can be separate storage contexts. Open the sticker
          link in the same app/browser where you created it on
          <code> /habits</code>.
        </p>
      ) : (
        <>
          <p className="mt-2">Tokens stored here:</p>
          <ul className="mt-1 space-y-0.5">
            {storedTokens.map((t) => (
              <li key={t} className="break-all font-mono">
                {t}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TapSuccess({
  habit,
  completedAt,
  timezone,
}: {
  habit: Habit;
  completedAt: string;
  timezone: string;
}) {
  const [isUndone, setIsUndone] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleUndo() {
    setIsPending(true);
    try {
      await undoLatestHabitCompletion(habit.id);
      setIsUndone(true);
      toast.success("Completion undone");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't undo");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">{isUndone ? habit.icon : "✅"}</span>
      <div>
        <h1 className="text-xl font-semibold">
          {isUndone ? "Completion undone" : "Habit Completed"}
        </h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-muted-foreground">
          <span className="text-lg">{habit.icon}</span>
          {habit.name}
        </p>
        {!isUndone ? (
          <p className="text-sm text-muted-foreground">
            {getLocalTimeString(new Date(completedAt), timezone)}
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex gap-2">
        {!isUndone ? (
          <Button variant="outline" disabled={isPending} onClick={handleUndo}>
            Undo
          </Button>
        ) : null}
        <Button render={<Link href="/" />}>Back to Dashboard</Button>
      </div>
    </div>
  );
}
