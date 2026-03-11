"use client";

import { motion } from "framer-motion";
import { WordCard } from "@/components/features/word-card";
import { type Word } from "@/lib/api";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

interface WordsGridClientProps {
  words: Word[];
}

export function WordsGridClient({ words }: WordsGridClientProps) {
  return (
    <motion.div
      className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((w) => (
        <motion.div key={w.id} variants={itemVariants}>
          <WordCard word={w} />
        </motion.div>
      ))}
    </motion.div>
  );
}
