"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
      icon: <i className="hn hn-calender text-xl text-amber-500" />,
      bg: "bg-amber-50",
    },
    {
      label: "Reviewed today",
      value: stats?.todayReviews ?? 0,
      icon: <i className="hn hn-book-heart text-xl text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Study streak",
      value: "N/A",
      icon: <i className="hn hn-fire text-xl text-orange-500" />,
      bg: "bg-orange-50",
    },
    {
      label: "Total cards learning",
      value: stats?.totalLearned ?? 0,
      icon: <i className="hn hn-grid text-xl text-purple-500" />,
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
