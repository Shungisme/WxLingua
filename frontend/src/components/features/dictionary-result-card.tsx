"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2, BookmarkPlus } from "lucide-react";
import { type DictionaryWord } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks";
import { AddToDeckDialog } from "./add-to-deck-dialog";

interface DictionaryResultCardProps {
  word: DictionaryWord;
  className?: string;
}

export function DictionaryResultCard({
  word,
  className,
}: DictionaryResultCardProps) {
  const { simplified, pinyin, meanings } = word.metadata;
  const { speak, isSpeaking } = useTextToSpeech();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.preventDefault();

    // If there's an audio file, use it
    if (word.audioUrl) {
      new Audio(`http://localhost:3000${word.audioUrl}`).play();
      return;
    }

    // Otherwise, use text-to-speech
    // Speak the Chinese word
    speak(word.word, { lang: "zh-CN", rate: 0.8 });
  };

  const handleAddToDeck = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAddDialog(true);
  };

  return (
    <>
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
          <div className="flex items-center gap-1">
            <button
              aria-label="Listen to pronunciation"
              onClick={handleSpeak}
              className={cn(
                "mt-1 p-1.5 rounded-lg transition-colors",
                isSpeaking
                  ? "text-accent-600 bg-accent-100"
                  : "text-surface-400 hover:text-accent-600 hover:bg-accent-50",
              )}
            >
              <Volume2
                className={cn("h-4 w-4", isSpeaking && "animate-pulse")}
              />
            </button>
            <button
              aria-label="Add to deck"
              onClick={handleAddToDeck}
              className={cn(
                "mt-1 p-1.5 rounded-lg transition-colors",
                "text-surface-400 hover:text-accent-600 hover:bg-accent-50",
              )}
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pinyin */}
        {pinyin && (
          <p className="font-pixel text-[9px] mt-2 text-accent-600">{pinyin}</p>
        )}

        {/* Meanings */}
        {meanings && meanings.length > 0 && (
          <div className="mt-3">
            <ul className="font-pixel text-[8px] text-surface-600 space-y-1">
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
              <p className="font-pixel text-[8px] mt-2 text-surface-400">
                +{meanings.length - 3} more meanings
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Badge variant="default">{word.languageCode}</Badge>
        </div>
      </Link>

      {/* Add to Deck Dialog - outside Link to avoid stacking context issues */}
      <AddToDeckDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        wordId={word.id}
        wordText={word.word}
      />
    </>
  );
}
