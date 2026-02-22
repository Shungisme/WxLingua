import Link from 'next/link';
import { Volume2 } from 'lucide-react';
import { type Word } from '@/lib/api';
import { LevelBadge, Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WordCardProps {
  word: Word;
  className?: string;
}

export function WordCard({ word, className }: WordCardProps) {
  const meta = word.metadata as Record<string, string> | undefined;
  const pinyin = meta?.pinyin;
  const phonetic = meta?.phonetic;

  return (
    <Link
      href={`/words/${word.id}`}
      className={cn(
        'group block rounded-xl border border-surface-200 bg-surface-0 p-5',
        'shadow-card hover:shadow-card-hover transition-all duration-200',
        'hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Character */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl font-light text-surface-900 leading-none tracking-tight">
          {word.word}
        </span>
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

      {/* Romanisation */}
      {(pinyin || phonetic) && (
        <p className="mt-2 text-sm text-surface-400 italic">{pinyin ?? phonetic}</p>
      )}

      {/* Tags */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge variant="default">{word.languageCode}</Badge>
        <LevelBadge level={word.level} />
      </div>
    </Link>
  );
}
