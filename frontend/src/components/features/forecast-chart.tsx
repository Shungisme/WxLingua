"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { ForecastChartSkeleton } from "@/components/ui/skeleton";

export function ForecastChart() {
  const { data: forecast, isLoading } = useQuery({
    queryKey: ["study-forecast"],
    queryFn: () => studyApi.forecast(14), // Next 14 days
  });

  if (isLoading) {
    return <ForecastChartSkeleton />;
  }

  if (!forecast || forecast.length === 0) return null;

  const maxCount = Math.max(...forecast.map((d) => d.count), 10);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="nes-container with-title shadow-pixel w-full">
      <p className="title font-pixel" style={{ fontSize: "12px" }}>
        UPCOMING REVIEWS
      </p>
      <p
        className="font-pixel text-surface-400 mb-4"
        style={{ fontSize: "7px" }}
      >
        NEXT 14 DAYS
      </p>
      <div className="flex h-32 items-end gap-1 w-full">
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
              {/* Pixel Tooltip */}
              <div
                className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform bg-surface-800 text-surface-0 font-pixel py-1 px-2 whitespace-nowrap z-10 border-b-2 border-r-2 border-surface-600"
                style={{ fontSize: "7px" }}
              >
                {day.count}
              </div>

              {/* Bar — pixel square, no rounded corners */}
              <div
                className={`w-full max-w-[20px] transition-all duration-300 ease-out ${
                  day.count > 0
                    ? "bg-accent-500 shadow-pixel-sm"
                    : "bg-surface-100"
                }`}
                style={{ height: `${heightPct}%` }}
              />

              {/* Date Label */}
              <span
                className="font-pixel text-surface-400 mt-2 rotate-45 origin-top-left -ml-1"
                style={{ fontSize: "6px" }}
              >
                {formatDate(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
