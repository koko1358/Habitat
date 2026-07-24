/**
 * Converts a UTC instant to a "yyyy-MM-dd" calendar date string in the given
 * IANA timezone. Uses the `en-CA` locale, which happens to format dates as
 * ISO (yyyy-MM-dd) — a lightweight alternative to a full timezone library
 * for the one conversion streaks/completions actually need.
 */
export function getLocalDateString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getLocalTimeString(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getLocalWeekdayIndex(date: Date, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(weekday);
}
