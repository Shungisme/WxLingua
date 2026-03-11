import { notFound } from "next/navigation";
import Link from "next/link";
import { decksApi } from "@/lib/api";
import { StudySession } from "@/components/features/study-session";
import { TypingGame } from "@/components/features/typing-game";
import { MatchingGame } from "@/components/features/matching-game";
import { Button } from "@/components/ui/button";

type StudyMode = "learn" | "review" | "type" | "match";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

const MODE_META: Record<
  StudyMode,
  { title: (name: string) => string; description: string }
> = {
  learn: {
    title: (n) => `Study: ${n}`,
    description: "Study all cards in this deck using flashcards",
  },
  review: {
    title: (n) => `Review: ${n}`,
    description: "Review cards that are due based on spaced repetition",
  },
  type: {
    title: (n) => `Typing: ${n}`,
    description: "See the meaning and type the word — test your memory",
  },
  match: {
    title: (n) => `Matching: ${n}`,
    description: "Match each word with its meaning as fast as you can",
  },
};

export default async function DeckStudyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { mode: rawMode } = await searchParams;

  const validModes: StudyMode[] = ["learn", "review", "type", "match"];
  const mode: StudyMode = validModes.includes(rawMode as StudyMode)
    ? (rawMode as StudyMode)
    : "learn";

  let deck;
  try {
    deck = await decksApi.getById(id);
  } catch {
    notFound();
  }

  const meta = MODE_META[mode];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/decks/${id}`}>
          <Button variant="ghost" size="sm">
            <i className="hn hn-arrow-left text-base mr-1.5" />
            Back to Deck
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-sm text-surface-900 mb-1">
          {meta.title(deck.name)}
        </h1>
        <p className="font-pixel text-[8px] text-surface-500">
          {meta.description}
        </p>
      </div>

      {/* Game / Session */}
      <div className="nes-container shadow-pixel">
        {mode === "learn" || mode === "review" ? (
          <StudySession deckId={id} mode={mode} />
        ) : mode === "type" ? (
          <TypingGame deckId={id} />
        ) : (
          <MatchingGame deckId={id} />
        )}
      </div>
    </div>
  );
}
