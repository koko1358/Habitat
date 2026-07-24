"use client";

import { useMemo, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { HistoryEntryRow } from "@/components/history/history-entry-row";
import type { CompletionSource, Habit, HistoryEntry } from "@/types/domain";

const SOURCE_LABELS: Record<CompletionSource, string> = {
  manual: "Manual",
  nfc: "NFC tap",
  shortcut: "Shortcut",
  imported: "Imported",
};

function groupLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
}

export function HistoryView({
  entries,
  habits,
  timezone,
  confirmBeforeDelete,
}: {
  entries: HistoryEntry[];
  habits: Habit[];
  timezone: string;
  confirmBeforeDelete: boolean;
}) {
  const [habitId, setHabitId] = useState("all");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(habits.map((h) => h.category))).sort(),
    [habits]
  );

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (habitId !== "all" && entry.habit.id !== habitId) return false;
      if (category !== "all" && entry.habit.category !== category) return false;
      if (source !== "all" && entry.completion.source !== source) return false;
      if (fromDate && entry.completion.localDate < fromDate) return false;
      if (toDate && entry.completion.localDate > toDate) return false;
      return true;
    });
  }, [entries, habitId, category, source, fromDate, toDate]);

  const groups = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const entry of filtered) {
      const key = entry.completion.localDate;
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">History</h1>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Habit</Label>
          <Select value={habitId} onValueChange={(v) => setHabitId(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All habits</SelectItem>
              {habits.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.icon} {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Source</Label>
          <Select value={source} onValueChange={(v) => setSource(v ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {(Object.keys(SOURCE_LABELS) as CompletionSource[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No completions found"
          description={
            entries.length === 0
              ? "Complete a habit and it'll show up here."
              : "Try adjusting your filters."
          }
        />
      ) : (
        <div className="space-y-5">
          {groups.map(([localDate, groupEntries]) => (
            <div key={localDate}>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {groupLabel(new Date(`${localDate}T00:00:00`))}
              </p>
              <ul className="space-y-2">
                {groupEntries.map((entry) => (
                  <HistoryEntryRow
                    key={entry.completion.id}
                    entry={entry}
                    timezone={timezone}
                    confirmBeforeDelete={confirmBeforeDelete}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
