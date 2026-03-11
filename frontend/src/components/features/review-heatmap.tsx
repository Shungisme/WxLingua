"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { ReviewHeatmapSkeleton } from "@/components/ui/skeleton";

export function ReviewHeatmap() {
  const { data: dailyStats, isLoading } = useQuery({
    queryKey: ["study-heatmap"],
    queryFn: () => studyApi.dailyStats(84), // Last 12 weeks
  });

  if (isLoading) {
    return <ReviewHeatmapSkeleton />;
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
    <div className="nes-container with-title shadow-pixel w-full">
      <p className="title font-pixel" style={{ fontSize: "12px" }}>
        REVIEW HISTORY
      </p>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3 h-3 ${getColor(day.count)}`}
                title={`${day.date}: ${day.count} reviews`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span
          className="font-pixel text-surface-400"
          style={{ fontSize: "7px" }}
        >
          LESS
        </span>
        <div className="flex gap-[3px]">
          <div className="w-3 h-3 bg-surface-200" />
          <div className="w-3 h-3 bg-green-200" />
          <div className="w-3 h-3 bg-green-400" />
          <div className="w-3 h-3 bg-green-500" />
          <div className="w-3 h-3 bg-green-600" />
        </div>
        <span
          className="font-pixel text-surface-400"
          style={{ fontSize: "7px" }}
        >
          MORE
        </span>
      </div>
    </div>
  );
}
