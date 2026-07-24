"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { HabitRow } from "@/components/habits/habit-row";
import { EmptyState } from "@/components/shared/empty-state";
import { createHabit } from "@/lib/habits/service";
import type { Habit } from "@/types/domain";
import { PlusIcon, SearchIcon } from "lucide-react";

export function HabitsView({ habits }: { habits: Habit[] }) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(habits.map((h) => h.category))).sort(),
    [habits]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return habits
      .filter((h) => (tab === "active" ? h.isActive : !h.isActive))
      .filter((h) => category === "all" || h.category === category)
      .filter(
        (h) =>
          query === "" ||
          h.name.toLowerCase().includes(query) ||
          h.description.toLowerCase().includes(query)
      );
  }, [habits, tab, category, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Habits</h1>
        <HabitFormDialog
          action={createHabit}
          trigger={
            <DialogTrigger render={<Button size="sm" />}>
              <PlusIcon />
              New habit
            </DialogTrigger>
          }
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "archived")}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search habits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? "all")}
        >
          <SelectTrigger className="sm:w-44">
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

      {filtered.length === 0 ? (
        <EmptyState
          title={
            tab === "archived" ? "No archived habits" : "No habits found"
          }
          description={
            tab === "archived"
              ? "Habits you archive will show up here."
              : habits.length === 0
                ? "Create your first habit to start tracking."
                : "Try a different search or category."
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((habit) => (
            <HabitRow key={habit.id} habit={habit} />
          ))}
        </ul>
      )}
    </div>
  );
}
