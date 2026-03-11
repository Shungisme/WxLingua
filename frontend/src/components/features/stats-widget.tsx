"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { studyApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function StatsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["study-stats"],
    queryFn: () => studyApi.stats(),
  });

  const stats = [
    {
      iconClass: "hn-book-heart",
      label: "Learned",
      value: data?.totalLearned ?? 0,
      color: "text-accent-600",
    },
    {
      iconClass: "hn-fire",
      label: "Streak",
      value: "—",
      color: "text-amber-500",
    },
    {
      iconClass: "hn-clock",
      label: "Today",
      value: "—",
      color: "text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-3 gap-3 sm:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map(({ iconClass, label, value, color }) => (
        <motion.div
          key={label}
          variants={itemVariants}
          whileHover={{ y: -1 }}
          className="border-2 border-surface-200 bg-surface-0 shadow-card p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2"
        >
          <i className={`hn ${iconClass} text-base sm:text-xl ${color}`} />
          <p className="text-xl sm:text-2xl font-bold text-surface-900">
            {value}
          </p>
          <p className="text-[10px] sm:text-xs text-surface-400">{label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
