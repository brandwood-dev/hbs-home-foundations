export function OrderTrackingSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-8 w-2/3 animate-pulse rounded-sm bg-surface-muted" />
      <div className="h-24 animate-pulse rounded-sm bg-surface-muted" />
      <div className="h-40 animate-pulse rounded-sm bg-surface-muted" />
    </div>
  );
}
