import { heatColor } from "@/lib/design-tokens";

/** The small 7-col x 2-row heat grid on a Today habit card — from `.mini-heat`/`.mini-cell`. */
export function MiniHeat({
  fractions,
  accent,
}: {
  fractions: number[];
  accent: string;
}) {
  return (
    <div className="grid grid-cols-7 gap-[3px]">
      {fractions.map((fraction, i) => (
        <div
          key={i}
          className="size-[9px] rounded-[2.5px]"
          style={{ background: heatColor(fraction, accent) }}
        />
      ))}
    </div>
  );
}
