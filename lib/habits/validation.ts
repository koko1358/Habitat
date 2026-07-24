import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const FREQUENCY_TYPES = [
  "daily",
  "weekdays",
  "weekly_target",
  "flexible",
] as const;

export const habitFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Give your habit a name.")
      .max(80, "Keep the name under 80 characters."),
    description: z
      .string()
      .trim()
      .max(300, "Keep the description under 300 characters.")
      .default(""),
    icon: z
      .string()
      .trim()
      .min(1, "Pick an emoji to represent this habit.")
      .max(8, "That doesn't look like a single emoji.")
      .default("✨"),
    category: z
      .string()
      .trim()
      .min(1, "Choose a category.")
      .max(40, "Keep the category under 40 characters.")
      .default("General"),
    frequencyType: z.enum(FREQUENCY_TYPES),
    targetCount: z.coerce
      .number()
      .int("Target must be a whole number.")
      .min(1, "Target must be at least 1.")
      .max(50, "That target seems too high — try 50 or fewer."),
    selectedWeekdays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
    allowMultiplePerDay: z.coerce.boolean().default(false),
    allowOvershoot: z.coerce.boolean().default(true),
    reminderTime: z
      .string()
      .regex(TIME_PATTERN, "Use a valid time, like 08:30.")
      .nullable()
      .default(null),
  })
  .refine(
    (data) => data.frequencyType !== "weekdays" || data.selectedWeekdays.length > 0,
    {
      message: "Pick at least one weekday.",
      path: ["selectedWeekdays"],
    }
  );

export type HabitFormValues = z.infer<typeof habitFormSchema>;

export type HabitFormFieldErrors = Partial<
  Record<keyof HabitFormValues, string[]>
>;
