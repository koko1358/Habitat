/**
 * Design tokens ported from taphabit:design.html (the "Habitap" mockup).
 * Colors/spacing/radii that map cleanly onto Tailwind theme values live in
 * globals.css's `@theme inline` block (see the `--hb-*` tokens); the pieces
 * below are the parts that are actual per-habit *logic* (color assignment,
 * heat-color interpolation) rather than static tokens, ported verbatim from
 * the mockup's `<script>` block.
 */

/** Same 7 colors, same order, as HABITS' COLOR_PALETTE in the mockup. */
export const HABIT_ACCENT_PALETTE = [
  "#3E7BFA",
  "#7B6EF6",
  "#34B27B",
  "#F5A623",
  "#EF5DA8",
  "#22B8B0",
  "#E85D4D",
] as const;

/**
 * The mockup assigns a color at creation time via
 * `COLOR_PALETTE[HABITS.length % COLOR_PALETTE.length]`. Since habits here
 * can be archived/deleted (changing "length so far"), that scheme isn't
 * stable over time. Deriving a color from a hash of the habit's own id is
 * the stable equivalent — same idea (cycle through the 7-color palette),
 * but a given habit always gets the same color regardless of what else
 * exists.
 */
export function habitAccentColor(habitId: string): string {
  let hash = 0;
  for (let i = 0; i < habitId.length; i++) {
    hash = (hash * 31 + habitId.charCodeAt(i)) >>> 0;
  }
  return HABIT_ACCENT_PALETTE[hash % HABIT_ACCENT_PALETTE.length];
}

// rgb(237, 234, 226) === #edeae2 === --hb-pip-off, the mockup's heat "off" color.
const HEAT_OFF_RGB: readonly [number, number, number] = [237, 234, 226];

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Ported verbatim from the mockup's `heatColor(fraction, accentHex)`. */
export function heatColor(fraction: number, accentHex: string): string {
  const t = Math.max(0, Math.min(1, fraction));
  const on = hexToRgb(accentHex);
  const r = Math.round(lerp(HEAT_OFF_RGB[0], on[0], t));
  const g = Math.round(lerp(HEAT_OFF_RGB[1], on[1], t));
  const b = Math.round(lerp(HEAT_OFF_RGB[2], on[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}
