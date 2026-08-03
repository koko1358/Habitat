"use client";

import { useActionState, useEffect, useId, useState } from "react";
import type { Habit, HabitFrequencyType } from "@/types/domain";
import {
  type HabitFormState,
  initialHabitFormState,
} from "@/lib/habits/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const FREQUENCY_LABELS: Record<HabitFrequencyType, string> = {
  daily: "Every day",
  weekdays: "Specific weekdays",
  weekly_target: "Times per week",
  flexible: "Flexible / no fixed schedule",
};

const CATEGORY_SUGGESTIONS = [
  "Health",
  "Home",
  "Productivity",
  "Fitness",
  "Mindfulness",
  "Learning",
];

export function HabitForm({
  habit,
  action,
  onSuccess,
}: {
  habit?: Habit;
  action: (
    state: HabitFormState,
    formData: FormData
  ) => Promise<HabitFormState>;
  /** Called with the new habit's id on a successful *create* (undefined for edits). */
  onSuccess?: (createdHabitId?: string) => void;
}) {
  const formId = useId();
  const [state, formAction, isPending] = useActionState(
    action,
    initialHabitFormState
  );
  const [frequencyType, setFrequencyType] = useState<HabitFrequencyType>(
    habit?.frequencyType ?? "daily"
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
    habit?.selectedWeekdays ?? []
  );
  const [allowMultiple, setAllowMultiple] = useState(
    habit?.allowMultiplePerDay ?? false
  );
  const [unlimitedPerDay, setUnlimitedPerDay] = useState(
    habit?.unlimitedPerDay ?? false
  );

  // Depends on the whole `state` object (a fresh reference every dispatch),
  // not `state.success` — a boolean dependency wouldn't change between two
  // consecutive successful submissions (both `true`), silently skipping
  // this effect on the second one.
  useEffect(() => {
    if (state.success) {
      onSuccess?.(state.habitId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function toggleWeekday(day: number) {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  return (
    <form id={formId} action={formAction} className="space-y-5">
      {state.formError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <div className="w-20 space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={habit?.icon ?? "✨"}
            className="text-center text-xl"
            maxLength={8}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={habit?.name}
            placeholder="Brush Teeth"
            required
          />
          {state.errors.name ? (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={habit?.description}
          placeholder="A short note about this habit"
          rows={2}
        />
        {state.errors.description ? (
          <p className="text-xs text-destructive">
            {state.errors.description[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          defaultValue={habit?.category ?? "General"}
          list={`${formId}-categories`}
        />
        <datalist id={`${formId}-categories`}>
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {state.errors.category ? (
          <p className="text-xs text-destructive">{state.errors.category[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequencyType">Frequency</Label>
        <Select
          name="frequencyType"
          value={frequencyType}
          onValueChange={(value) => {
            const next = value as HabitFrequencyType;
            setFrequencyType(next);
            // Unlimited taps and a weekly target are contradictory — a
            // weekly target needs a real count to know when the week is met.
            if (next === "weekly_target") setUnlimitedPerDay(false);
          }}
        >
          <SelectTrigger id="frequencyType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(FREQUENCY_LABELS) as HabitFrequencyType[]).map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {FREQUENCY_LABELS[key]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {frequencyType === "weekdays" ? (
        <div className="space-y-2">
          <Label>Which days?</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekday(day.value)}
                className={cn(
                  "h-9 w-12 rounded-lg border text-sm font-medium transition-colors",
                  selectedWeekdays.includes(day.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
          {selectedWeekdays.map((day) => (
            <input key={day} type="hidden" name="selectedWeekdays" value={day} />
          ))}
          {state.errors.selectedWeekdays ? (
            <p className="text-xs text-destructive">
              {state.errors.selectedWeekdays[0]}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="targetCount">
            {frequencyType === "weekly_target"
              ? "Times per week"
              : "Daily target"}
          </Label>
          {unlimitedPerDay ? (
            <>
              <Input value="Unlimited" disabled />
              <input type="hidden" name="targetCount" value={1} />
            </>
          ) : (
            <Input
              id="targetCount"
              name="targetCount"
              type="number"
              min={1}
              max={50}
              defaultValue={habit?.targetCount ?? 1}
              required
            />
          )}
          {state.errors.targetCount ? (
            <p className="text-xs text-destructive">
              {state.errors.targetCount[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reminderTime">Reminder (optional)</Label>
          <Input
            id="reminderTime"
            name="reminderTime"
            type="time"
            defaultValue={habit?.reminderTime ?? ""}
          />
          {state.errors.reminderTime ? (
            <p className="text-xs text-destructive">
              {state.errors.reminderTime[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Allow multiple completions</p>
          <p className="text-xs text-muted-foreground">
            For habits like drinking water, logged several times a day.
          </p>
        </div>
        <Switch
          name="allowMultiplePerDay"
          checked={allowMultiple || unlimitedPerDay}
          disabled={unlimitedPerDay}
          onCheckedChange={setAllowMultiple}
        />
      </div>

      {frequencyType !== "weekly_target" ? (
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Unlimited completions per day</p>
            <p className="text-xs text-muted-foreground">
              No daily target — every tap counts, e.g. Drink Water. The
              dashboard shows a running total instead of a fixed target.
            </p>
          </div>
          <Switch
            name="unlimitedPerDay"
            checked={unlimitedPerDay}
            onCheckedChange={(checked) => {
              setUnlimitedPerDay(checked);
              if (checked) setAllowMultiple(true);
            }}
          />
        </div>
      ) : null}

      {state.errors.unlimitedPerDay ? (
        <p className="text-xs text-destructive">
          {state.errors.unlimitedPerDay[0]}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="h-11 w-full">
        {isPending
          ? "Saving…"
          : habit
            ? "Save changes"
            : "Create habit"}
      </Button>
    </form>
  );
}
