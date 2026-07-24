"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettings, initialSettingsFormState } from "@/lib/settings/service";
import type { Settings } from "@/types/domain";

export function SettingsForm({
  settings,
  timezones,
}: {
  settings: Settings;
  timezones: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateSettings,
    initialSettingsFormState
  );
  const [timezone, setTimezone] = useState(settings.timezone);
  const [weekStartsOn, setWeekStartsOn] = useState(String(settings.weekStartsOn));
  const [confirmDelete, setConfirmDelete] = useState(settings.confirmBeforeDelete);

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={settings.displayName}
          placeholder="Jose"
        />
        {state.errors.displayName ? (
          <p className="text-xs text-destructive">{state.errors.displayName[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select name="timezone" value={timezone} onValueChange={(v) => v && setTimezone(v)}>
          <SelectTrigger id="timezone" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Used to work out local dates, streaks, and the Today dashboard.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weekStartsOn">Week starts on</Label>
        <Select
          name="weekStartsOn"
          value={weekStartsOn}
          onValueChange={(v) => v && setWeekStartsOn(v)}
        >
          <SelectTrigger id="weekStartsOn" className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sunday</SelectItem>
            <SelectItem value="1">Monday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Confirm before deleting completions</p>
          <p className="text-xs text-muted-foreground">
            Show a confirmation dialog before removing a completion in History.
          </p>
        </div>
        <Switch
          name="confirmBeforeDelete"
          checked={confirmDelete}
          onCheckedChange={setConfirmDelete}
        />
      </div>

      <Button type="submit" disabled={isPending} className="h-11 w-full sm:w-auto">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
