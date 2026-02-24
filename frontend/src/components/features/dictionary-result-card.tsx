"use client";

import Link from "next/link";
import { Volume2 } from "lucide-react";
import { type DictionaryWord } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DictionaryResultCardProps {
  word: DictionaryWord;
  className?: string;
}

export function DictionaryResultCard({
  word,
  className,
}: DictionaryResultCardProps) {
  const { simplified, pinyin, meanings } = word.metadata;

  return (
    <Link
      href={`/words/${word.id}`}
      className={cn(
        "group block rounded-xl border border-surface-200 bg-surface-0 p-5",
        "shadow-card hover:shadow-card-hover transition-all duration-200",
        "hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Traditional & Simplified Characters */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-light text-surface-900 leading-none tracking-tight">
            {word.word}
          </span>
          {simplified && simplified !== word.word && (
            <span className="text-2xl font-light text-surface-400 leading-none">
              {simplified}
            </span>
          )}
        </div>
        {word.audioUrl && (
          <button
            aria-label="Nghe phát âm"
            onClick={(e) => {
              e.preventDefault();
              new Audio(`http://localhost:3000${word.audioUrl}`).play();
            }}
            className="mt-1 p-1.5 rounded-lg text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Pinyin */}
      {pinyin && (
        <p className="mt-2 text-base text-accent-600 font-medium">{pinyin}</p>
      )}

      {/* Meanings */}
      {meanings && meanings.length > 0 && (
        <div className="mt-3">
          <ul className="text-sm text-surface-600 space-y-1">
            {meanings.slice(0, 3).map((meaning, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-surface-400 flex-shrink-0">
                  {idx + 1}.
                </span>
                <span className="line-clamp-1">{meaning}</span>
              </li>
            ))}
          </ul>
          {meanings.length > 3 && (
            <p className="mt-2 text-xs text-surface-400">
              +{meanings.length - 3} nghĩa khác
            </p>
          )}
        </div>
      )}

      {/* Tags */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Badge variant="default">{word.languageCode}</Badge>
      </div>
    </Link>
  );
}
