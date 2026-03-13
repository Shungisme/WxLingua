"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type StudyCard } from "@/types";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";

interface FlashcardProps {
  card: StudyCard;
  onFlip?: (flipped: boolean) => void;
  forceFlip?: boolean;
}

export function Flashcard({ card, onFlip, forceFlip = false }: FlashcardProps) {
  const [flipped, setFlipped] = useState(forceFlip);
  const meta = card.word.metadata as Record<string, string> | undefined;
  const reading = meta?.pinyin ?? meta?.phonetic ?? meta?.romaja ?? "";

  // Reset flip state when card changes
  useEffect(() => {
    setFlipped(forceFlip);
  }, [card.id, forceFlip]);

  const handleFlip = () => {
    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    onFlip?.(nextFlipped);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "LEARNING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "REVIEW":
        return "bg-green-100 text-green-800 border-green-200";
      case "RELEARNING":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-surface-100 text-surface-800 border-surface-200";
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case "NEW":
        return "New";
      case "LEARNING":
        return "Learning";
      case "REVIEW":
        return "Review";
      case "RELEARNING":
        return "Relearning";
      default:
        return state;
    }
  };

  return (
    <div
      className="relative w-full max-w-md cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={handleFlip}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full"
      >
        {/* Front */}
        <div
          className="border-2 border-surface-200 bg-surface-0 shadow-card p-12 flex flex-col items-center justify-center gap-4 min-h-64"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-4 left-4">
            <Badge className={getStateColor(card.state)}>
              {getStateLabel(card.state)}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <ProgressRing value={card.progress} size={40} strokeWidth={4} />
          </div>

          <span className="text-7xl font-light text-surface-900 leading-none">
            {card.word.word}
          </span>
          <p className="font-pixel text-[8px] text-surface-400">
            Tap to reveal / flip card
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 border-2 border-surface-200 bg-accent-50 shadow-card p-8 flex flex-col items-center justify-center gap-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {reading && (
            <p className="font-pixel text-[10px] text-accent-600">{reading}</p>
          )}
          <p className="font-pixel text-[8px] text-center text-surface-600">
            {card.word.languageCode} · {card.word.level ?? "N/A"}
          </p>

          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="font-pixel text-[8px] text-surface-400">
              Streak: {card.streak} · Lapses: {card.lapses ?? 0}
            </p>
            <p className="font-pixel text-[8px] text-surface-400 scale-90 opacity-70">
              S: {(card.stability ?? 0).toFixed(1)}d | D:{" "}
              {(card.difficulty ?? 0).toFixed(1)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
