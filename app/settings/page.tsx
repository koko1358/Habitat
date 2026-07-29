"use client";

import { useMemo } from "react";
import { useSettings } from "@/hooks/use-settings";
import { SettingsForm } from "@/components/settings/settings-form";
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

      <SettingsForm settings={settings} timezones={timezones} />
    </div>
  );
}
