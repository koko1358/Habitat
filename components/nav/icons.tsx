/**
 * Tab icons. Today/Summary are ported verbatim from taphabit:design.html's
 * `.tab-btn` SVGs (4-square grid, 3-bar chart) — the mockup's third tab
 * ("Maker") no longer exists (habit + sticker creation both live on
 * /habits now), so its sparkle icon was replaced with a checklist icon in
 * the same stroke-based style for the Habits tab.
 * Colored via `currentColor` so the parent's text color drives
 * active/inactive state, exactly like the mockup's `.tab-btn` /
 * `.tab-btn.active` CSS.
 */

type IconProps = { className?: string };

export function TodayTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function SummaryTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="10" width="4" height="11" rx="1" fill="currentColor" />
      <rect x="10" y="5" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="17" y="13" width="4" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}

export function HabitsTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 6h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 18h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M3.5 6l1.25 1.25L7 4.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12l1.25 1.25L7 10.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}
