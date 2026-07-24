import { z } from "zod";

export const settingsFormSchema = z.object({
  displayName: z.string().trim().max(60, "Keep it under 60 characters.").default(""),
  timezone: z.string().min(1, "Choose a timezone."),
  weekStartsOn: z.coerce.number().int().min(0).max(1),
  confirmBeforeDelete: z.coerce.boolean().default(false),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
