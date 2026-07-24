import { z } from "zod";

export const stickerFormSchema = z.object({
  habitId: z.string().min(1, "Choose a habit."),
  stickerName: z
    .string()
    .trim()
    .min(1, "Give the sticker a name.")
    .max(60, "Keep it under 60 characters."),
  room: z.string().trim().max(60, "Keep it under 60 characters.").default(""),
});

export type StickerFormValues = z.infer<typeof stickerFormSchema>;

export type StickerFormFieldErrors = Partial<
  Record<keyof StickerFormValues, string[]>
>;
