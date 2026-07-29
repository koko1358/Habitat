/**
 * Tab icons ported verbatim from taphabit:design.html's `.tab-btn` SVGs
 * (Today = 4-square grid, Summary = 3-bar chart, Maker = 8-point sparkle).
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

export function MakerTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
