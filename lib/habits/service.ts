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
    reminderTime: formData.get("reminderTime") || null,
  });
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

  const now = new Date().toISOString();
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    description: parsed.data.description,
    icon: parsed.data.icon,
    category: parsed.data.category,
    frequencyType: parsed.data.frequencyType,
    targetCount: parsed.data.targetCount,
    selectedWeekdays: parsed.data.selectedWeekdays,
    allowMultiplePerDay: parsed.data.allowMultiplePerDay,
    allowOvershoot: parsed.data.allowOvershoot,
    reminderTime: parsed.data.reminderTime,
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

  return { errors: {}, formError: null, success: true };
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

  try {
    await db.habits.update(habitId, {
      name: parsed.data.name,
      description: parsed.data.description,
      icon: parsed.data.icon,
      category: parsed.data.category,
      frequencyType: parsed.data.frequencyType,
      targetCount: parsed.data.targetCount,
      selectedWeekdays: parsed.data.selectedWeekdays,
      allowMultiplePerDay: parsed.data.allowMultiplePerDay,
      allowOvershoot: parsed.data.allowOvershoot,
      reminderTime: parsed.data.reminderTime,
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
  await db.transaction("rw", db.habits, db.habitCompletions, async () => {
    await db.habitCompletions.where("habitId").equals(habitId).delete();
    await db.habits.delete(habitId);
  });
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
