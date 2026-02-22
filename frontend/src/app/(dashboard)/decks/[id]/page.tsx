import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { decksApi, type Word } from '@/lib/api';
import { WordCard } from '@/components/features/word-card';
import { Badge } from '@/components/ui/badge';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await decksApi.getById(id);
    return { title: data.name };
  } catch {
    return { title: 'Bộ thẻ' };
  }
}

export default async function DeckDetailPage({ params }: Props) {
  const { id } = await params;
  let deck;
  try {
    const { data } = await decksApi.getById(id);
    deck = data;
  } catch {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-surface-900">{deck.name}</h1>
          {deck.languageCode && <Badge variant="accent">{deck.languageCode}</Badge>}
        </div>
        {deck.description && (
          <p className="text-sm text-surface-500">{deck.description}</p>
        )}
        <p className="text-xs text-surface-400 mt-2">{deck.cardCount} thẻ</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deck.deckWords?.map(({ word }: { word: Word }) => (
          <WordCard key={word.id} word={word} />
        ))}
      </div>
    </div>
  );
}
