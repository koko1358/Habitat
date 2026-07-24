"use client";

import { useMemo } from "react";
import { useSettings } from "@/hooks/use-settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Label } from "@/components/ui/label";
import { ListPageSkeleton } from "@/components/shared/skeletons";

function getTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return ["Asia/Manila", "UTC"];
}

export default function SettingsPage() {
  const settings = useSettings();
  const timezones = useMemo(() => getTimezones(), []);

  if (!settings) {
    return <ListPageSkeleton />;
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="space-y-2">
        <Label>Appearance</Label>
        <ThemeToggle />
      </div>

      <SettingsForm settings={settings} timezones={timezones} />
    </div>
  );
}
