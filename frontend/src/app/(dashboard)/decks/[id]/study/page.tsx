import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { decksApi } from "@/lib/api";
import { StudySession } from "@/components/features/study-session";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const deck = await decksApi.getById(id);
    return { title: `Study: ${deck.name}` };
  } catch {
    return { title: "Study Deck" };
  }
}

export default async function DeckStudyPage({ params }: Props) {
  const { id } = await params;
  let deck;
  try {
    deck = await decksApi.getById(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/decks/${id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to deck
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">
          Study: {deck.name}
        </h1>
        <p className="text-sm text-surface-400">
          Review cards from this deck using spaced repetition
        </p>
      </div>

      {/* Study Session */}
      <div className="bg-surface-0 border border-surface-200 rounded-2xl p-6 shadow-sm">
        <StudySession deckId={id} />
      </div>
    </div>
  );
}
