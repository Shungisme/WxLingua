"use client";

import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import { Flame, BookOpen, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["study-stats"],
    queryFn: () => studyApi.stats(),
  });

  const stats = [
    {
      icon: BookOpen,
      label: "Đã học",
      value: data?.totalLearned ?? 0,
      color: "text-accent-600",
    },
    { icon: Flame, label: "Streak", value: "—", color: "text-amber-500" },
    { icon: Clock, label: "Hôm nay", value: "—", color: "text-green-600" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="rounded-xl border border-surface-200 bg-surface-0 p-4 flex flex-col gap-2"
        >
          <Icon className={`h-5 w-5 ${color}`} />
          <p className="text-2xl font-bold text-surface-900">{value}</p>
          <p className="text-xs text-surface-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
