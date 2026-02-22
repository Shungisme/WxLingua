import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { wordsApi } from '@/lib/api';
import { RadicalTree } from '@/components/features/radical-tree';
import { LevelBadge, Badge } from '@/components/ui/badge';
import { Volume2 } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await wordsApi.getById(id);
    return { title: data.word };
  } catch {
    return { title: 'Từ vựng' };
  }
}

export default async function WordDetailPage({ params }: Props) {
  const { id } = await params;

  let word;
  try {
    const { data } = await wordsApi.getById(id);
    word = data;
  } catch {
    notFound();
  }

  const meta = word.metadata as Record<string, string> | undefined;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start gap-6">
        <span className="text-8xl font-light text-surface-900 leading-none">
          {word.word}
        </span>
        {word.audioUrl && (
          <audio controls src={`http://localhost:3000${word.audioUrl}`} className="mt-4">
            <track kind="captions" />
          </audio>
        )}
      </div>

      {/* Meta */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <Badge variant="default">{word.languageCode}</Badge>
        <LevelBadge level={word.level} />
        {meta?.pinyin && <Badge variant="accent">{meta.pinyin}</Badge>}
        {meta?.phonetic && <Badge variant="accent">{meta.phonetic}</Badge>}
      </div>

      {/* Radical decomposition */}
      {word.wordRadicals && word.wordRadicals.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-surface-800 mb-4">Bộ thủ</h2>
          <RadicalTree radicals={word.wordRadicals} />
        </section>
      )}
    </div>
  );
}
