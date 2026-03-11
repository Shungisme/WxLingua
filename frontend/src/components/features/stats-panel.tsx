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
      iconClass: "hn-calender",
      color: "text-amber-500",
      badge: "is-warning",
    },
    {
      label: "Reviewed today",
      value: stats?.todayReviews ?? 0,
      iconClass: "hn-book-heart",
      color: "text-blue-500",
      badge: "is-primary",
    },
    {
      label: "Study streak",
      value: "N/A",
      iconClass: "hn-fire",
      color: "text-orange-500",
      badge: "is-error",
    },
    {
      label: "Total learning",
      value: stats?.totalLearned ?? 0,
      iconClass: "hn-grid",
      color: "text-purple-500",
      badge: "is-dark",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.label}
          variants={itemVariants}
          whileHover={{ y: -1 }}
          className="flex flex-col items-center gap-2 font-pixel"
        >
          <i className={`hn ${item.iconClass} text-2xl ${item.color}`} />
          <p className="text-lg text-surface-900">{item.value}</p>
          <span className="nes-badge">
            <span className={`!text-[10px] ${item.badge}`}>{item.label}</span>
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
