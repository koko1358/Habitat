/** Ported verbatim from taphabit:design.html's `flameIcon(color)`. */
export function FlameIcon({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c1.5 1.5 2 3.5 2 5a8 8 0 1 1-16 0c0-4 3-6 4-9 .5 1 1 2 1 3 1-2 2-4 3-6z"
        fill={color}
      />
    </svg>
  );
}
