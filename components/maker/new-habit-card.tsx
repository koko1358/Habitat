"use client";

import { useActionState, useState } from "react";
import { createHabit, initialHabitFormState } from "@/lib/habits/service";
import { FieldLabel, FieldError } from "@/components/maker/field-label";

/** Ported from taphabit:design.html's first `.maker-card` ("New habit"). */
export function NewHabitCard() {
  const [state, formAction, isPending] = useActionState(
    createHabit,
    initialHabitFormState
  );
  const [targetCount, setTargetCount] = useState(1);

  return (
    <div className="hb-card-shadow mb-3.5 rounded-hb-card bg-hb-card p-[18px]">
      <form action={formAction}>
        {state.formError ? (
          <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.formError}
          </p>
        ) : null}

        <input type="hidden" name="frequencyType" value="daily" />
        {targetCount > 1 ? (
          <input type="hidden" name="allowMultiplePerDay" value="on" />
        ) : null}

        <FieldLabel htmlFor="nh-emoji">Icon</FieldLabel>
        <input
          id="nh-emoji"
          name="icon"
          maxLength={2}
          defaultValue="🎯"
          className="hb-field mb-3.5 w-16 text-center text-lg"
        />
        {state.errors.icon ? <FieldError message={state.errors.icon[0]} /> : null}

        <FieldLabel htmlFor="nh-name">Habit name</FieldLabel>
        <input
          id="nh-name"
          name="name"
          placeholder="e.g. Stretch"
          required
          className="hb-field mb-3.5"
        />
        {state.errors.name ? <FieldError message={state.errors.name[0]} /> : null}

        <FieldLabel htmlFor="nh-target">Times per day</FieldLabel>
        <input
          id="nh-target"
          name="targetCount"
          type="number"
          min={1}
          max={12}
          value={targetCount}
          onChange={(e) => setTargetCount(Number(e.target.value) || 1)}
          className="hb-field mb-3.5"
        />
        {state.errors.targetCount ? (
          <FieldError message={state.errors.targetCount[0]} />
        ) : null}

        <button type="submit" disabled={isPending} className="hb-gen-btn">
          {isPending ? "Creating…" : "Create habit"}
        </button>
      </form>
    </div>
  );
}
