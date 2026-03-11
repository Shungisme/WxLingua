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

export function ForecastChartSkeleton() {
  return (
    <div className="nes-container with-title w-full">
      <p className="title font-pixel" style={{ fontSize: "8px" }}>
        UPCOMING REVIEWS
      </p>
      <Skeleton className="h-3 w-24 mb-5" />
      <div className="flex h-32 items-end gap-1 w-full">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 max-w-[20px]"
            style={{ height: `${20 + ((i * 17 + 23) % 70)}%` }}
          >
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewHeatmapSkeleton() {
  return (
    <div className="nes-container with-title w-full overflow-x-auto">
      <p className="title font-pixel" style={{ fontSize: "8px" }}>
        REVIEW HISTORY
      </p>
      <div className="flex gap-[3px]">
        {Array.from({ length: 12 }).map((_, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, di) => (
              <Skeleton key={di} className="w-3 h-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
