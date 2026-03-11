import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-surface-200", className)}
      aria-hidden
    />
  );
}

export function WordCardSkeleton() {
  return (
    <div className="border-2 border-surface-200 bg-surface-0 p-5 flex flex-col gap-3">
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-5 w-8" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}

export function DeckCardSkeleton() {
  return (
    <div className="border-2 border-surface-200 bg-surface-0 p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-60" />
      <Skeleton className="h-4 w-20 mt-1" />
    </div>
  );
}

export function StatsPanelSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="border-2 border-surface-200 bg-surface-0 p-4 flex flex-col items-center gap-3"
        >
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function RadicalSkeleton() {
  return (
    <div className="border-2 border-surface-200 bg-surface-0 p-3 flex flex-col items-center gap-1">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-2 w-10" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      <div className="flex gap-8 mt-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
