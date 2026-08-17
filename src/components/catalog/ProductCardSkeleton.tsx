export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col" aria-hidden="true">
      <div className="aspect-[3/4] w-full rounded-md bg-surface-muted" />
      <div className="mt-3 h-3 w-24 rounded bg-surface-muted" />
      <div className="mt-2 h-4 w-3/4 rounded bg-surface-muted" />
      <div className="mt-2 h-3 w-full rounded bg-surface-muted" />
      <div className="mt-2 h-4 w-20 rounded bg-surface-muted" />
    </div>
  );
}
