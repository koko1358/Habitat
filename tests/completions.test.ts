import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";
import { createHabit, getActiveHabits, deleteHabit } from "@/lib/habits/service";
import {
  createHabitCompletion,
  getCompletionsForDate,
  HabitAlreadyCompletedError,
  softDeleteCompletion,
  undoLatestHabitCompletion,
} from "@/lib/completions/service";
import { getLocalDateString } from "@/lib/timezone";

const TIMEZONE = "Asia/Manila";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

async function makeHabit(overrides: Record<string, string> = {}) {
  const state = await createHabit(
    { errors: {}, formError: null, success: false },
    formData({
      name: "Brush Teeth",
      frequencyType: "daily",
      targetCount: "1",
      ...overrides,
    })
  );
  expect(state.success).toBe(true);
  const habits = await getActiveHabits();
  return habits[habits.length - 1];
}

beforeEach(async () => {
  await db.habits.clear();
  await db.habitCompletions.clear();
  await db.nfcStickers.clear();
});

describe("createHabitCompletion", () => {
  it("creates a completion record with a derived local date", async () => {
    const habit = await makeHabit();
    const completion = await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt: new Date("2026-01-15T10:00:00Z"), // 18:00 in Manila
    });

    expect(completion.localDate).toBe("2026-01-15");
    expect(completion.source).toBe("manual");
    expect(completion.deletedAt).toBeNull();

    const forDate = await getCompletionsForDate(habit.id, "2026-01-15");
    expect(forDate).toHaveLength(1);
  });

  it("prevents a second completion on the same day for single-completion habits", async () => {
    const habit = await makeHabit({ allowMultiplePerDay: "off" });
    const completedAt = new Date("2026-01-15T10:00:00Z");

    await createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt });

    await expect(
      createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt })
    ).rejects.toBeInstanceOf(HabitAlreadyCompletedError);
  });

  it("allows repeated completions for multi-completion habits", async () => {
    const habit = await makeHabit({ allowMultiplePerDay: "on", targetCount: "3" });
    const completedAt = new Date("2026-01-15T10:00:00Z");

    await createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt });
    await createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt });
    await createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt });

    const forDate = await getCompletionsForDate(habit.id, "2026-01-15");
    expect(forDate).toHaveLength(3);
  });
});

describe("undoLatestHabitCompletion", () => {
  it("soft-deletes the most recent completion, leaving earlier ones intact", async () => {
    const habit = await makeHabit({ allowMultiplePerDay: "on", targetCount: "5" });

    const first = await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt: new Date(Date.now() - 60_000),
    });
    await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt: new Date(),
    });

    await undoLatestHabitCompletion(habit.id, TIMEZONE);

    const today = getLocalDateString(new Date(), TIMEZONE);
    const remaining = await getCompletionsForDate(habit.id, today);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(first.id);
  });

  it("does nothing when there are no completions to undo", async () => {
    const habit = await makeHabit();
    await expect(
      undoLatestHabitCompletion(habit.id, TIMEZONE)
    ).resolves.toBeUndefined();
  });

  it("only undoes today's completion, leaving an earlier day's completion for the same habit intact", async () => {
    const habit = await makeHabit({ allowMultiplePerDay: "on", targetCount: "5" });
    const yesterdayInstant = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // A completion from a previous day (a different localDate) should never
    // be touched by an undo triggered from today's card.
    await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt: yesterdayInstant,
    });
    await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt: new Date(),
    });

    await undoLatestHabitCompletion(habit.id, TIMEZONE);

    const yesterday = await getCompletionsForDate(
      habit.id,
      getLocalDateString(yesterdayInstant, TIMEZONE)
    );
    expect(yesterday).toHaveLength(1);
  });
});

describe("soft-deleted records", () => {
  it("are excluded from getCompletionsForDate", async () => {
    const habit = await makeHabit({ allowMultiplePerDay: "on", targetCount: "2" });
    const completedAt = new Date("2026-01-15T10:00:00Z");

    const first = await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt,
    });
    await createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt });

    await softDeleteCompletion(first.id);

    const remaining = await getCompletionsForDate(habit.id, "2026-01-15");
    expect(remaining).toHaveLength(1);
    expect(remaining.find((c) => c.id === first.id)).toBeUndefined();
  });

  it("a single-completion habit can be completed again after its completion is soft-deleted", async () => {
    const habit = await makeHabit({ allowMultiplePerDay: "off" });
    const completedAt = new Date("2026-01-15T10:00:00Z");

    const completion = await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt,
    });
    await softDeleteCompletion(completion.id);

    await expect(
      createHabitCompletion({ habitId: habit.id, timezone: TIMEZONE, source: "manual", completedAt })
    ).resolves.toBeDefined();
  });
});

describe("deleteHabit", () => {
  it("cascades to remove the habit's completions", async () => {
    const habit = await makeHabit();
    await createHabitCompletion({
      habitId: habit.id,
      timezone: TIMEZONE,
      source: "manual",
      completedAt: new Date("2026-01-15T10:00:00Z"),
    });

    await deleteHabit(habit.id);

    const remainingCompletions = await db.habitCompletions
      .where("habitId")
      .equals(habit.id)
      .toArray();
    expect(remainingCompletions).toHaveLength(0);
  });

  it("cascades to remove the habit's NFC stickers, leaving nothing orphaned", async () => {
    const habit = await makeHabit();
    await db.nfcStickers.add({
      id: crypto.randomUUID(),
      habitId: habit.id,
      stickerName: "Test sticker",
      room: "",
      token: "abcdef0123456789",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastTappedAt: null,
      active: true,
    });

    await deleteHabit(habit.id);

    const remainingStickers = await db.nfcStickers
      .where("habitId")
      .equals(habit.id)
      .toArray();
    expect(remainingStickers).toHaveLength(0);
  });
});
