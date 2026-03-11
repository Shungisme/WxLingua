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
      badge: "is-primary",
    },
    {
      iconClass: "hn-fire",
      label: "Streak",
      value: "—",
      color: "text-amber-500",
      badge: "is-warning",
    },
    {
      iconClass: "hn-clock",
      label: "Today",
      value: "—",
      color: "text-green-600",
      badge: "is-success",
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
      {stats.map(({ iconClass, label, value, color, badge }) => (
        <motion.div
          key={label}
          variants={itemVariants}
          whileHover={{ y: -1 }}
          className="flex flex-col items-center gap-2"
        >
          <i className={`hn ${iconClass} text-2xl ${color}`} />
          <p className="font-pixel text-lg sm:text-xl text-surface-900">
            {value}
          </p>
          <span className="nes-badge font-pixel !text-[10px]">
            <span className={badge}>{label}</span>
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
