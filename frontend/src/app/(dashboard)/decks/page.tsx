import type { Metadata } from "next";
import { Suspense } from "react";
import { decksApi, type Deck } from "@/lib/api";
import { DeckCard } from "@/components/features/deck-card";
import { DeckCardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Bộ thẻ" };
export const revalidate = 60;

async function DeckGrid() {
  const decks = await decksApi.list({ public: true });
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((d: Deck) => (
        <DeckCard key={d.id} deck={d} />
      ))}
    </div>
  );
}

export default function DecksPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-surface-900 mb-1">Bộ thẻ</h1>
      <p className="text-sm text-surface-400 mb-8">
        Khám phá các bộ thẻ cộng đồng.
      </p>
      <Suspense
        fallback={
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <DeckCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DeckGrid />
      </Suspense>
    </div>
  );
}
