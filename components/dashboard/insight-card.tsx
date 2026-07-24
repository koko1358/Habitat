export function InsightCard({ insight }: { insight: string }) {
  return (
    <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm text-foreground">
      💡 {insight}
    </div>
  );
}
