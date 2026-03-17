"use client";

import { useState } from "react";
import { type DictionaryWord } from "@/types";
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
  const { simplified, pinyin, ipa, meanings, glosses, translations } =
    word.metadata;
  const displayMeanings =
    (Array.isArray(glosses) && glosses.length > 0
      ? glosses
      : Array.isArray(meanings)
        ? meanings
        : []) || [];
  const englishTranslations = Array.isArray(translations)
    ? translations
        .filter((t) => t?.lang_code === "en" && typeof t.word === "string")
        .map((t) => t.word as string)
        .slice(0, 3)
    : [];
  const { speak, isSpeaking } = useTextToSpeech();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.preventDefault();

    // If there's an audio file, use it
    if (word.audioUrl) {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
        "http://localhost:3000";
      const audioSrc = word.audioUrl.startsWith("http")
        ? word.audioUrl
        : `${apiBase}${word.audioUrl}`;
      new Audio(audioSrc).play();
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
      <div
        className={cn(
          "group block border-[3px] border-black bg-surface-0 p-4",
          "shadow-pixel transition-all duration-100",
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--pixel-shadow-color)]",
          className,
        )}
      >
        {/* Traditional & Simplified Characters */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold text-surface-900 leading-none tracking-tight">
              {word.word}
            </span>
            {simplified && simplified !== word.word && (
              <span className="text-2xl font-semibold text-surface-500 leading-none">
                {simplified}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Listen to pronunciation"
              onClick={handleSpeak}
              className={cn(
                "mt-1 h-8 w-8 border-2 border-black transition-colors",
                "inline-flex items-center justify-center",
                isSpeaking
                  ? "text-accent-600 bg-accent-100"
                  : "text-surface-500 bg-surface-100 hover:text-accent-600 hover:bg-accent-50",
              )}
            >
              <i
                className={cn(
                  "hn hn-sound-on text-base",
                  isSpeaking && "animate-pulse",
                )}
              />
            </button>
            <button
              aria-label="Add to deck"
              onClick={handleAddToDeck}
              className={cn(
                "mt-1 h-8 w-8 border-2 border-black transition-colors",
                "inline-flex items-center justify-center",
                "text-surface-500 bg-surface-100 hover:text-accent-600 hover:bg-accent-50",
              )}
            >
              <i className="hn hn-bookmark text-base" />
            </button>
          </div>
        </div>

        {/* Pronunciation */}
        {(pinyin || ipa) && (
          <p className="font-pixel text-[8px] mt-2 text-accent-600 uppercase tracking-wide">
            {pinyin || ipa}
          </p>
        )}

        {/* Meanings */}
        {displayMeanings.length > 0 && (
          <div className="mt-3 border-t-2 border-dashed border-surface-300 pt-2">
            <ul className="text-[14px] leading-6 text-surface-700 space-y-1">
              {displayMeanings.slice(0, 3).map((meaning, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-surface-500 flex-shrink-0 text-[12px] leading-6">
                    {idx + 1}.
                  </span>
                  <span className="line-clamp-1">{meaning}</span>
                </li>
              ))}
            </ul>

            {displayMeanings.length > 3 && (
              <p className="text-[12px] mt-2 text-surface-500">
                +{displayMeanings.length - 3} more meanings
              </p>
            )}
          </div>
        )}

        {englishTranslations.length > 0 && (
          <p className="text-[13px] leading-5 mt-2 text-surface-600 line-clamp-1 border-t border-surface-200 pt-2">
            EN: {englishTranslations.join(", ")}
          </p>
        )}

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Badge variant="default">{word.languageCode}</Badge>
        </div>
      </div>

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
