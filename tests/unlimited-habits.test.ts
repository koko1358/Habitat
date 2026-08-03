import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/db";
import { createHabit, getActiveHabits } from "@/lib/habits/service";
import { createHabitCompletion } from "@/lib/completions/service";
import { getTodaySummary } from "@/lib/habits/today";
import type { Settings } from "@/types/domain";

const TIMEZONE = "Asia/Manila";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

function makeSettings(): Settings {
  const now = new Date().toISOString();
  return {
    id: "local",
    displayName: "",
    timezone: TIMEZONE,
    weekStartsOn: 0,
    theme: "system",
    confirmBeforeDelete: true,
    createdAt: now,
    updatedAt: now,
  };
}

beforeEach(async () => {
  await db.habits.clear();
  await db.habitCompletions.clear();
});

describe("unlimited-per-day habits", () => {
  it("forces allowMultiplePerDay on even if the form didn't submit it", async () => {
    const state = await createHabit(
      { errors: {}, formError: null, success: false },
      formData({
        name: "Drink Water",
        frequencyType: "daily",
        targetCount: "1",
        unlimitedPerDay: "on",
      })
    );
    expect(state.success).toBe(true);

    const habits = await getActiveHabits();
    const habit = habits[habits.length - 1];
    expect(habit.unlimitedPerDay).toBe(true);
    expect(habit.allowMultiplePerDay).toBe(true);
  });

  it("rejects unlimitedPerDay combined with a weekly target", async () => {
    const state = await createHabit(
      { errors: {}, formError: null, success: false },
      formData({
        name: "Gym",
        frequencyType: "weekly_target",
        targetCount: "3",
        unlimitedPerDay: "on",
      })
    );
    expect(state.success).toBe(false);
    expect(state.errors.unlimitedPerDay?.[0]).toBeTruthy();
  });

  it("keeps accepting completions with no upper cap, and counts the day done after just one", async () => {
    await createHabit(
      { errors: {}, formError: null, success: false },
      formData({
        name: "Drink Water",
        frequencyType: "daily",
        targetCount: "1",
        unlimitedPerDay: "on",
      })
    );
    const habits = await getActiveHabits();
    const habit = habits[habits.length - 1];

    for (let i = 0; i < 7; i++) {
      await createHabitCompletion({
        habitId: habit.id,
        timezone: TIMEZONE,
        source: "manual",
      });
    }

    const summary = await getTodaySummary(makeSettings());
    const status = summary.habits.find((h) => h.id === habit.id);
    expect(status?.completedCount).toBe(7);
    expect(status?.isComplete).toBe(true);
  });
});
