"use client";

import { motion } from "framer-motion";
import { type Radical } from "@/lib/api";

interface RadicalsGridProps {
  radicals: Radical[];
}

export function RadicalsGrid({ radicals }: RadicalsGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {radicals.map((r, i) => {
        const meaning =
          (r.meaning as Record<string, string>)?.vi ??
          (r.meaning as Record<string, string>)?.en ??
          "";
        return (
          <motion.div
            key={r.id}
            title={meaning}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: Math.min(i * 0.006, 0.5),
              duration: 0.2,
              ease: "easeOut" as const,
            }}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex flex-col items-center gap-1 border-2 border-surface-200 bg-surface-0 p-3 cursor-default hover:border-accent-300 hover:bg-accent-50 transition-colors"
          >
            <span className="text-2xl text-surface-900 leading-none">
              {r.char}
            </span>
            <span className="font-pixel text-[8px] text-surface-400 text-center truncate w-full">
              {meaning}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
