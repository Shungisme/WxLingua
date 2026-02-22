import { cn } from '@/lib/utils';

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-200', className)}
      aria-hidden
    />
  );
}

export function WordCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 flex flex-col gap-3">
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-5 w-8 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function DeckCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-60" />
      <Skeleton className="h-4 w-20 mt-1" />
    </div>
  );
}
