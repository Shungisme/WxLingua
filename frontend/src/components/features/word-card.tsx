"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Word } from "@/types";
import { LevelBadge, Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WordCardProps {
  word: Word;
  className?: string;
}

export function WordCard({ word, className }: WordCardProps) {
  const meta = word.metadata as Record<string, string> | undefined;
  const pinyin = meta?.pinyin;
  const phonetic = meta?.phonetic;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
    "http://localhost:3000";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("group", className)}
    >
      <Link
        href={`/words/${word.id}`}
        className="block border-2 border-surface-200 bg-surface-0 p-5 shadow-card hover:shadow-card-hover transition-all duration-200"
      >
        {/* Character */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-4xl font-light text-surface-900 leading-none tracking-tight">
            {word.word}
          </span>
          {word.audioUrl && (
            <button
              aria-label="Listen to pronunciation"
              onClick={(e) => {
                e.preventDefault();
                const audioSrc = word.audioUrl!.startsWith("http")
                  ? word.audioUrl!
                  : `${apiBase}${word.audioUrl}`;
                new Audio(audioSrc).play();
              }}
              className="mt-1 p-1.5 text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition-colors border border-surface-200 hover:border-accent-300"
            >
              <i className="hn hn-sound-on text-base" />
            </button>
          )}
        </div>

        {/* Romanisation */}
        {(pinyin || phonetic) && (
          <p className="font-pixel text-[8px] mt-2 text-surface-400 italic">
            {pinyin ?? phonetic}
          </p>
        )}

        {/* Tags */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="default">{word.languageCode}</Badge>
          <LevelBadge level={word.level} />
        </div>
      </Link>
    </motion.div>
  );
}
