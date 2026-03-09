import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { decksApi, type Word } from "@/lib/api";
import { WordCard } from "@/components/features/word-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const deck = await decksApi.getById(id);
    return { title: deck.name };
  } catch {
    return { title: "Deck" };
  }
}

export default async function DeckDetailPage({ params }: Props) {
  const { id } = await params;
  let deck;
  try {
    deck = await decksApi.getById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900">{deck.name}</h1>
            {deck.languageCode && (
              <Badge variant="accent">{deck.languageCode}</Badge>
            )}
          </div>
          <Link href={`/decks/${id}/study`}>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Start Studying
            </Button>
          </Link>
        </div>
        {deck.description && (
          <p className="text-sm text-surface-500">{deck.description}</p>
        )}
        <p className="text-xs text-surface-400 mt-2">{deck.cardCount} cards</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deck.deckWords?.map(({ word }: { word: Word }) => (
          <WordCard key={word.id} word={word} />
        ))}
      </div>
    </div>
  );
}
