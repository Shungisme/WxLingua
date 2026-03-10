"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewHeatmap() {
  const { data: dailyStats, isLoading } = useQuery({
    queryKey: ["study-heatmap"],
    queryFn: () => studyApi.dailyStats(84), // Last 12 weeks
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-2xl" />;
  }

  // Create a map of dates to counts
  const countMap = new Map(dailyStats?.map((d) => [d.date, d.count]) || []);

  // Generate last 84 days
  const days = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      count: countMap.get(dateStr) || 0,
    });
  }

  // Group by weeks (7 days per column)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-surface-100 dark:bg-surface-800";
    if (count < 10) return "bg-green-200 dark:bg-green-900";
    if (count < 30) return "bg-green-400 dark:bg-green-700";
    if (count < 60) return "bg-green-500 dark:bg-green-600";
    return "bg-green-600 dark:bg-green-500";
  };

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-2xl p-6 shadow-sm w-full overflow-x-auto">
      <h3 className="text-base font-semibold text-surface-900 mb-4">
        Review history
      </h3>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} reviews`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 text-xs text-surface-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-surface-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
