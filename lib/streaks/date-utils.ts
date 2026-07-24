import { addDays, format, isBefore, parse } from "date-fns";

/** A calendar date with no time-of-day component, formatted "yyyy-MM-dd". */
export type LocalDateString = string;

export function parseLocalDate(dateStr: LocalDateString): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date(2000, 0, 1));
}

export function formatLocalDate(date: Date): LocalDateString {
  return format(date, "yyyy-MM-dd");
}

export function addLocalDays(dateStr: LocalDateString, amount: number): LocalDateString {
  return formatLocalDate(addDays(parseLocalDate(dateStr), amount));
}

export function isLocalDateBefore(a: LocalDateString, b: LocalDateString): boolean {
  return isBefore(parseLocalDate(a), parseLocalDate(b));
}
