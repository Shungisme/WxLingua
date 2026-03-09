"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function ForecastChart() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ["study-forecast"],
    queryFn: () => studyApi.forecast(14), // Next 14 days
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (!forecast || forecast.length === 0) return null;

  const maxCount = Math.max(...forecast.map((d) => d.count), 10);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-2xl p-6 shadow-sm w-full">
      <h3 className="text-base font-semibold text-surface-900 mb-6">
        Upcoming reviews (next 14 days)
      </h3>
      <div className="flex h-32 items-end gap-2 w-full mt-4">
        {forecast.map((day, i) => {
          const heightPct = Math.max(
            (day.count / maxCount) * 100,
            day.count > 0 ? 5 : 0,
          );

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-surface-800 text-surface-50 text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                {day.count} cards
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[24px] rounded-t-sm transition-all duration-500 ease-out ${day.count > 0 ? "bg-blue-500" : "bg-surface-100"}`}
                style={{ height: `${heightPct}%` }}
              />

              {/* Label */}
              <span className="text-[10px] text-surface-400 mt-2 rotate-45 origin-top-left -ml-2">
                {formatDate(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
