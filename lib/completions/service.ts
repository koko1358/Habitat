import { db } from "@/lib/db/db";
import { getLocalDateString } from "@/lib/timezone";
import { getHabitById } from "@/lib/habits/service";
import type { CompletionSource, HabitCompletion } from "@/types/domain";

export class HabitAlreadyCompletedError extends Error {
  constructor() {
    super("This habit has already been completed for today.");
    this.name = "HabitAlreadyCompletedError";
  }
}

export interface CreateHabitCompletionInput {
  habitId: string;
  timezone: string;
  /**
   * Where the completion came from. Manual taps in the UI use "manual";
   * this is the same seam a future NFC tap route (`/tap/[habitId]`) or
   * Shortcuts action will call with "nfc" / "shortcut" instead. See
   * FUTURE_NFC.md.
   */
  source: CompletionSource;
  /** Defaults to now — overridable for backfilled/imported completions. */
  completedAt?: Date;
}

/**
 * The single write path for recording a habit completion, regardless of
 * where the tap came from. The manual Complete button, and eventually the
 * NFC tap route and Shortcuts action, all funnel through this function so
 * the business rules (local-date derivation, single-completion-per-day
 * enforcement) only live in one place.
 */
export async function createHabitCompletion(
  input: CreateHabitCompletionInput
): Promise<HabitCompletion> {
  const habit = await getHabitById(input.habitId);
  if (!habit) {
    throw new Error("Habit not found.");
  }

  const completedAt = input.completedAt ?? new Date();
  const localDate = getLocalDateString(completedAt, input.timezone);

  if (!habit.allowMultiplePerDay) {
    const sameDay = await db.habitCompletions
      .where("[habitId+localDate]")
      .equals([input.habitId, localDate])
      .toArray();
    if (sameDay.some((c) => c.deletedAt === null)) {
      throw new HabitAlreadyCompletedError();
    }
  }

  const completion: HabitCompletion = {
    id: crypto.randomUUID(),
    habitId: input.habitId,
    completedAt: completedAt.toISOString(),
    localDate,
    source: input.source,
    deletedAt: null,
  };

  await db.habitCompletions.add(completion);
  return completion;
}

/**
 * Soft-deletes the most recent (non-deleted) completion for a habit — the
 * "Undo" action. Scoped to today's local date only (per `timezone`), so a
 * multi-completion-per-day habit loses just its latest tap today, never a
 * completion from an earlier day.
 */
export async function undoLatestHabitCompletion(
  habitId: string,
  timezone: string
): Promise<void> {
  const today = getLocalDateString(new Date(), timezone);
  const completions = await db.habitCompletions
    .where("[habitId+localDate]")
    .equals([habitId, today])
    .toArray();

  const latest = completions
    .filter((c) => c.deletedAt === null)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];

  if (!latest) return;

  await softDeleteCompletion(latest.id);
}

/** Soft-deletes a specific completion by id — used by the History page's delete action. */
export async function softDeleteCompletion(completionId: string): Promise<void> {
  await db.habitCompletions.update(completionId, {
    deletedAt: new Date().toISOString(),
  });
}

export async function getCompletionsForDate(
  habitId: string,
  localDate: string
): Promise<HabitCompletion[]> {
  const rows = await db.habitCompletions
    .where("[habitId+localDate]")
    .equals([habitId, localDate])
    .toArray();
  return rows.filter((c) => c.deletedAt === null);
}

/** All non-deleted completions for the given habits, most recent first. */
export async function getCompletionsForHabits(
  habitIds: string[]
): Promise<Map<string, HabitCompletion[]>> {
  const map = new Map<string, HabitCompletion[]>();
  if (habitIds.length === 0) return map;

  const all = await db.habitCompletions
    .where("habitId")
    .anyOf(habitIds)
    .toArray();

  for (const completion of all) {
    if (completion.deletedAt !== null) continue;
    const list = map.get(completion.habitId) ?? [];
    list.push(completion);
    map.set(completion.habitId, list);
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  }

  return map;
}

export interface HistoryQueryOptions {
  sinceDays?: number;
}

export async function getCompletionHistory(
  options: HistoryQueryOptions = {}
): Promise<HabitCompletion[]> {
  const sinceDays = options.sinceDays ?? 90;
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const sinceIso = since.toISOString();

  const all = await db.habitCompletions
    .where("completedAt")
    .above(sinceIso)
    .toArray();

  return all
    .filter((c) => c.deletedAt === null)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
