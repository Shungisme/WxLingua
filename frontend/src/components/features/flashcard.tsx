'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type StudyCard } from '@/lib/api';
import { ProgressRing } from '@/components/ui/progress-ring';

interface FlashcardProps {
  card: StudyCard;
}

export function Flashcard({ card }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const meta = card.word.metadata as Record<string, string> | undefined;
  const reading = meta?.pinyin ?? meta?.phonetic ?? meta?.romaja ?? '';

  return (
    <div
      className="relative w-full max-w-md cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full"
      >
        {/* Front */}
        <div
          className="rounded-2xl border border-surface-200 bg-surface-0 shadow-card p-12 flex flex-col items-center justify-center gap-4 min-h-64"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-7xl font-light text-surface-900 leading-none">
            {card.word.word}
          </span>
          <p className="text-xs text-surface-400">Nhấn để xem nghĩa</p>
          <div className="absolute top-4 right-4">
            <ProgressRing value={card.progress} size={40} strokeWidth={4} />
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-surface-200 bg-accent-50 shadow-card p-8 flex flex-col items-center justify-center gap-3"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {reading && (
            <p className="text-xl text-accent-600 font-medium">{reading}</p>
          )}
          <p className="text-sm text-center text-surface-600">
            {card.word.languageCode} · {card.word.level ?? 'N/A'}
          </p>
          <p className="text-xs text-surface-400 mt-2">Streak: {card.streak}</p>
        </div>
      </motion.div>
    </div>
  );
}
