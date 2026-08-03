import { db } from "@/lib/db/db";
import { z } from "zod";
import {
  habitFormSchema,
  type HabitFormFieldErrors,
} from "@/lib/habits/validation";
import type { Habit } from "@/types/domain";

export interface HabitFormState {
  errors: HabitFormFieldErrors;
  formError: string | null;
  success: boolean;
  /** Set on a successful *create* only — lets the caller advance to a next step (e.g. generating a sticker) without a re-fetch. */
  habitId?: string;
}

export const initialHabitFormState: HabitFormState = {
  errors: {},
  formError: null,
  success: false,
};

function parseHabitForm(formData: FormData) {
  return habitFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") || undefined,
    category: formData.get("category") || undefined,
    frequencyType: formData.get("frequencyType"),
    targetCount: formData.get("targetCount"),
    selectedWeekdays: formData.getAll("selectedWeekdays"),
    allowMultiplePerDay: formData.get("allowMultiplePerDay") === "on",
    allowOvershoot: formData.get("allowOvershoot") !== "off",
    unlimitedPerDay: formData.get("unlimitedPerDay") === "on",
    reminderTime: formData.get("reminderTime") || null,
  });
}

/** Unlimited taps implies "more than one per day" is allowed — keep that flag consistent regardless of what the form submitted. */
function withUnlimitedImpliesMultiple<
  T extends { unlimitedPerDay: boolean; allowMultiplePerDay: boolean },
>(data: T): T {
  return data.unlimitedPerDay ? { ...data, allowMultiplePerDay: true } : data;
}

export async function createHabit(
  _prevState: HabitFormState,
  formData: FormData
): Promise<HabitFormState> {
  const parsed = parseHabitForm(formData);

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors as HabitFormFieldErrors,
      formError: null,
      success: false,
    };
  }

  const data = withUnlimitedImpliesMultiple(parsed.data);
  const now = new Date().toISOString();
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    icon: data.icon,
    category: data.category,
    frequencyType: data.frequencyType,
    targetCount: data.targetCount,
    selectedWeekdays: data.selectedWeekdays,
    allowMultiplePerDay: data.allowMultiplePerDay,
    allowOvershoot: data.allowOvershoot,
    unlimitedPerDay: data.unlimitedPerDay,
    reminderTime: data.reminderTime,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.habits.add(habit);
  } catch (error) {
    return {
      errors: {},
      formError: error instanceof Error ? error.message : "Couldn't save habit",
      success: false,
    };
  }

  return { errors: {}, formError: null, success: true, habitId: habit.id };
}

export async function updateHabit(
  habitId: string,
  _prevState: HabitFormState,
  formData: FormData
): Promise<HabitFormState> {
  const parsed = parseHabitForm(formData);

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors as HabitFormFieldErrors,
      formError: null,
      success: false,
    };
  }

  const data = withUnlimitedImpliesMultiple(parsed.data);
  try {
    await db.habits.update(habitId, {
      name: data.name,
      description: data.description,
      icon: data.icon,
      category: data.category,
      frequencyType: data.frequencyType,
      targetCount: data.targetCount,
      selectedWeekdays: data.selectedWeekdays,
      allowMultiplePerDay: data.allowMultiplePerDay,
      allowOvershoot: data.allowOvershoot,
      unlimitedPerDay: data.unlimitedPerDay,
      reminderTime: data.reminderTime,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return {
      errors: {},
      formError: error instanceof Error ? error.message : "Couldn't save habit",
      success: false,
    };
  }

  return { errors: {}, formError: null, success: true };
}

export async function setHabitActive(habitId: string, isActive: boolean) {
  await db.habits.update(habitId, {
    isActive,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteHabit(habitId: string) {
  // Cascades to habitCompletions AND nfcStickers — a habit's sticker(s)
  // are meaningless (and un-openable) once the habit they tap-complete no
  // longer exists, so deleting one without the other would silently leave
  // an orphaned, dead-end sticker record behind.
  await db.transaction(
    "rw",
    db.habits,
    db.habitCompletions,
    db.nfcStickers,
    async () => {
      await db.habitCompletions.where("habitId").equals(habitId).delete();
      await db.nfcStickers.where("habitId").equals(habitId).delete();
      await db.habits.delete(habitId);
    }
  );
}

export async function getActiveHabits(): Promise<Habit[]> {
  const all = await db.habits.toArray();
  return all
    .filter((h) => h.isActive)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getAllHabits(): Promise<Habit[]> {
  const all = await db.habits.toArray();
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getHabitById(habitId: string): Promise<Habit | undefined> {
  return db.habits.get(habitId);
}
