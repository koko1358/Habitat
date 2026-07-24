import { describe, expect, it } from "vitest";
import {
  dailyStreak,
  weekdayStreak,
  weeklyTargetStreak,
  flexibleStats,
} from "@/lib/streaks/streaks";
import { getLocalDateString } from "@/lib/timezone";

describe("dailyStreak", () => {
  it("counts consecutive daily completions", () => {
    const dates = ["2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23"];
    const result = dailyStreak(dates, "2026-07-23", "2026-07-15");
    expect(result.current).toBe(4);
    expect(result.longest).toBe(4);
  });

  it("breaks the streak on a missed scheduled day", () => {
    // 20, 21 completed; 22 missed; 23 (today) completed -> current streak is just today
    const dates = ["2026-07-20", "2026-07-21", "2026-07-23"];
    const result = dailyStreak(dates, "2026-07-23", "2026-07-15");
    expect(result.current).toBe(1);
    expect(result.longest).toBe(2);
  });

  it("doesn't break the streak just because today isn't done yet", () => {
    const dates = ["2026-07-21", "2026-07-22"];
    const result = dailyStreak(dates, "2026-07-23", "2026-07-15");
    expect(result.current).toBe(2);
  });

  it("treats multiple completions in one day as a single streak day", () => {
    const dates = [
      "2026-07-22",
      "2026-07-22",
      "2026-07-22",
      "2026-07-23",
      "2026-07-23",
    ];
    const result = dailyStreak(dates, "2026-07-23", "2026-07-15");
    expect(result.current).toBe(2);
    expect(result.longest).toBe(2);
  });
});

describe("weekdayStreak", () => {
  it("skips unscheduled days without breaking the streak", () => {
    // Mon-Fri habit. 2026-07-20 is a Monday.
    const selectedWeekdays = [1, 2, 3, 4, 5];
    const dates = [
      "2026-07-20", // Mon
      "2026-07-21", // Tue
      "2026-07-22", // Wed
      "2026-07-23", // Thu
      // Fri 24th not yet completed but also not "today" in this test
    ];
    const streak = weekdayStreak(dates, selectedWeekdays, "2026-07-23", "2026-07-13");
    expect(streak.current).toBe(4);
  });

  it("does not count a missed weekend day against a weekday habit", () => {
    const selectedWeekdays = [1, 2, 3, 4, 5];
    // Fri 17th and Mon 20th completed; Sat/Sun in between are unscheduled.
    const dates = ["2026-07-17", "2026-07-20"];
    const streak = weekdayStreak(dates, selectedWeekdays, "2026-07-20", "2026-07-13");
    expect(streak.current).toBe(2);
  });

  it("breaks the streak on a missed scheduled weekday", () => {
    const selectedWeekdays = [1, 2, 3, 4, 5];
    // Mon 20th completed, Tue 21st missed, Wed 22nd completed.
    const dates = ["2026-07-20", "2026-07-22"];
    const streak = weekdayStreak(dates, selectedWeekdays, "2026-07-22", "2026-07-13");
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
  });
});

describe("weeklyTargetStreak", () => {
  it("counts a streak when the weekly target is reached in consecutive weeks", () => {
    // weekStartsOn 0 (Sunday). Week of 2026-07-05 (Sun) through 2026-07-11 (Sat).
    const dates = [
      "2026-07-06",
      "2026-07-07",
      "2026-07-08", // week 1: 3 completions
      "2026-07-13",
      "2026-07-14",
      "2026-07-15", // week 2: 3 completions
    ];
    const streak = weeklyTargetStreak(dates, 3, "2026-07-16", "2026-07-05", 0);
    expect(streak.current).toBe(2);
    expect(streak.longest).toBe(2);
  });

  it("does not break the streak for an in-progress current week", () => {
    const dates = [
      "2026-07-06",
      "2026-07-07",
      "2026-07-08", // week 1: target met
      "2026-07-13", // week 2 (current, in progress): only 1 so far
    ];
    const streak = weeklyTargetStreak(dates, 3, "2026-07-14", "2026-07-05", 0);
    expect(streak.current).toBe(1);
  });

  it("breaks the streak when a past week missed the target", () => {
    const dates = [
      "2026-07-06", // week 1: only 1 completion, target 3 -> missed
      "2026-07-13",
      "2026-07-14",
      "2026-07-15", // week 2: target met
    ];
    const streak = weeklyTargetStreak(dates, 3, "2026-07-16", "2026-07-05", 0);
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
  });
});

describe("flexibleStats", () => {
  it("counts active days and total completions without a streak concept", () => {
    const dates = ["2026-07-01", "2026-07-01", "2026-07-03", "2026-07-10"];
    const stats = flexibleStats(dates, "2026-07-16", "2026-07-01", 0);
    expect(stats.activeDays).toBe(3);
    expect(stats.totalCompletions).toBe(4);
    expect(stats.weeklyConsistency).toBeGreaterThan(0);
    expect(stats.weeklyConsistency).toBeLessThanOrEqual(1);
  });
});

describe("timezone boundaries", () => {
  it("maps a late-UTC instant to the next local calendar date in Asia/Manila", () => {
    // 23:30 UTC on Jan 1 is 07:30 the next day in Manila (UTC+8).
    const instant = new Date("2026-01-01T23:30:00Z");
    expect(getLocalDateString(instant, "Asia/Manila")).toBe("2026-01-02");
  });

  it("keeps the same local calendar date for a US timezone at the same instant", () => {
    const instant = new Date("2026-01-01T23:30:00Z");
    expect(getLocalDateString(instant, "America/New_York")).toBe("2026-01-01");
  });

  it("rolls over correctly right at local midnight", () => {
    // 16:00 UTC = 00:00 in Asia/Manila (UTC+8) on the next day.
    const instant = new Date("2026-01-01T16:00:00Z");
    expect(getLocalDateString(instant, "Asia/Manila")).toBe("2026-01-02");
    const justBefore = new Date("2026-01-01T15:59:00Z");
    expect(getLocalDateString(justBefore, "Asia/Manila")).toBe("2026-01-01");
  });
});
