import { z } from "zod";
import { db, ensureSettings, SETTINGS_ID } from "@/lib/db/db";
import { settingsFormSchema } from "@/lib/settings/validation";

export interface SettingsFormState {
  errors: Partial<Record<string, string[]>>;
  formError: string | null;
  success: boolean;
}

export const initialSettingsFormState: SettingsFormState = {
  errors: {},
  formError: null,
  success: false,
};

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const parsed = settingsFormSchema.safeParse({
    displayName: formData.get("displayName"),
    timezone: formData.get("timezone"),
    weekStartsOn: formData.get("weekStartsOn"),
    confirmBeforeDelete: formData.get("confirmBeforeDelete") === "on",
  });

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      formError: null,
      success: false,
    };
  }

  await ensureSettings();
  await db.settings.update(SETTINGS_ID, {
    displayName: parsed.data.displayName,
    timezone: parsed.data.timezone,
    weekStartsOn: parsed.data.weekStartsOn,
    confirmBeforeDelete: parsed.data.confirmBeforeDelete,
    updatedAt: new Date().toISOString(),
  });

  return { errors: {}, formError: null, success: true };
}

export async function updateTheme(theme: "light" | "dark" | "system") {
  await ensureSettings();
  await db.settings.update(SETTINGS_ID, {
    theme,
    updatedAt: new Date().toISOString(),
  });
}
