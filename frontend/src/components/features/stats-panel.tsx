"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CalendarCheck, Flame, Layers } from "lucide-react";

export function StatsPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["study-stats"],
    queryFn: () => studyApi.stats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Due today",
      value: stats?.dueToday ?? 0,
      icon: <CalendarCheck className="h-5 w-5 text-amber-500" />,
      bg: "bg-amber-50",
    },
    {
      label: "Reviewed today",
      value: stats?.todayReviews ?? 0,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Study streak",
      value: "N/A", // This could be derived from a real streak API if we had one for user
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      bg: "bg-orange-50",
    },
    {
      label: "Total cards learning",
      value: stats?.totalLearned ?? 0,
      icon: <Layers className="h-5 w-5 text-purple-500" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-surface-0 border-2 border-surface-200 shadow-card p-4 flex flex-col items-center justify-center text-center"
        >
          <div className={`${item.bg} border border-surface-200 p-2 mb-2`}>
            {item.icon}
          </div>
          <p className="text-2xl font-bold text-surface-900">{item.value}</p>
          <p className="text-xs text-surface-500 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
