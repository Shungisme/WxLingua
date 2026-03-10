"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { decksApi } from "@/lib/api";
import type { DeckDetail, DeckCard } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddWordsToDeckDialog } from "@/components/features/add-words-to-deck-dialog";
import { BulkImportWordsDialog } from "@/components/features/bulk-import-words-dialog";
import { EditDeckCardDialog } from "@/components/features/edit-deck-card-dialog";

export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<DeckCard | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  const loadDeck = async () => {
    try {
      const data = await decksApi.getById(id);
      setDeck(data);
    } catch {
      router.push("/decks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRemoveCard = async (cardId: string) => {
    setRemovingId(cardId);
    try {
      await decksApi.removeCard(id, cardId);
      setDeck((prev) =>
        prev
          ? {
              ...prev,
              cardCount: prev.cardCount - 1,
              deckCards: prev.deckCards.filter((c) => c.id !== cardId),
            }
          : prev,
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleCardUpdated = (updated: DeckCard) => {
    setDeck((prev) =>
      prev
        ? {
            ...prev,
            deckCards: prev.deckCards.map((c) =>
              c.id === updated.id ? updated : c,
            ),
          }
        : prev,
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <i className="hn hn-spinner text-3xl animate-spin text-accent-500" />
      </div>
    );
  }

  if (!deck) return null;

  const dueCount = deck.deckCards.filter(
    (c) => new Date(c.nextReview) <= new Date(),
  ).length;

  // sourceWordIds used so the "Add Words" dialog knows which dict words are already in
  const existingSourceWordIds = new Set(
    deck.deckCards.map((c) => c.sourceWordId).filter(Boolean) as string[],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/decks")}
          className="flex items-center gap-1.5 font-pixel text-[9px] text-surface-500 hover:text-surface-800 mb-4 transition-colors"
        >
          <i className="hn hn-arrow-left text-base" />
          Back to Decks
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-pixel text-sm text-surface-900">
                {deck.name}
              </h1>
              {deck.languageCode && (
                <Badge variant="accent">{deck.languageCode}</Badge>
              )}
              <Badge variant={deck.isPublic ? "default" : "accent"}>
                {deck.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            {deck.description && (
              <p className="font-pixel text-[8px] text-surface-500">
                {deck.description}
              </p>
            )}
            <p className="font-pixel text-[8px] text-surface-400 mt-1">
              {deck.cardCount} cards
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBulkDialog(true)}
            >
              <i className="hn hn-upload text-base mr-1.5" />
              Bulk Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              <i className="hn hn-plus text-base mr-1.5" />
              Add Words
            </Button>
            {dueCount > 0 && (
              <Link href={`/decks/${id}/study?mode=review`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400"
                >
                  <i className="hn hn-refresh text-base mr-1.5" />
                  Review {dueCount}
                </Button>
              </Link>
            )}
            <Link href={`/decks/${id}/study?mode=learn`}>
              <Button size="sm">
                <i className="hn hn-book-heart text-base mr-1.5" />
                Study
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Practice Modes */}
      {deck.deckCards.length > 0 && (
        <div className="mb-8">
          <h2 className="font-pixel text-[9px] text-surface-500 uppercase tracking-wider mb-3">
            Practice modes
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/decks/${id}/study?mode=type`}>
              <Button variant="outline" size="sm" className="gap-2">
                <i className="hn hn-code text-base" />
                Typing
                <span className="font-pixel text-[8px] text-surface-400 font-normal">
                  See meaning → type the word
                </span>
              </Button>
            </Link>
            <Link href={`/decks/${id}/study?mode=match`}>
              <Button variant="outline" size="sm" className="gap-2">
                <i className="hn hn-grid text-base" />
                Matching
                <span className="font-pixel text-[8px] text-surface-400 font-normal">
                  Pair words with their meanings
                </span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Card Grid */}
      {deck.deckCards.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deck.deckCards.map((card) => (
            <DeckCardItem
              key={card.id}
              card={card}
              removing={removingId === card.id}
              onEdit={() => setEditCard(card)}
              onRemove={() => handleRemoveCard(card.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-surface-200 rounded-xl">
          <p className="font-pixel text-[9px] text-surface-400 mb-4">
            No cards in this deck yet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowBulkDialog(true)}>
              <i className="hn hn-upload text-base mr-1.5" />
              Bulk Import
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <i className="hn hn-plus text-base mr-1.5" />
              Add Words
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddWordsToDeckDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        deckId={id}
        existingWordIds={existingSourceWordIds}
        onSuccess={loadDeck}
      />
      <BulkImportWordsDialog
        open={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        deckId={id}
        onSuccess={loadDeck}
      />
      {editCard && (
        <EditDeckCardDialog
          open={!!editCard}
          onClose={() => setEditCard(null)}
          deckId={id}
          card={editCard}
          onSuccess={handleCardUpdated}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card item component
// ---------------------------------------------------------------------------
function DeckCardItem({
  card,
  removing,
  onEdit,
  onRemove,
}: {
  card: DeckCard;
  removing: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const meaning =
    card.meaning?.vi ??
    card.meaning?.en ??
    Object.values(card.meaning ?? {})[0];

  return (
    <div className="relative group rounded-xl border border-surface-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md bg-white/95 border border-surface-200 text-surface-400 hover:text-accent-600 hover:border-accent-200 shadow-sm"
          title="Edit card"
        >
          <i className="hn hn-pencil text-[14px]" />
        </button>
        <button
          onClick={onRemove}
          disabled={removing}
          className="p-1.5 rounded-md bg-white/95 border border-surface-200 text-surface-400 hover:text-red-500 hover:border-red-200 shadow-sm disabled:opacity-50"
          title="Remove from deck"
        >
          {removing ? (
            <i className="hn hn-spinner text-[14px] animate-spin" />
          ) : (
            <i className="hn hn-trash-alt text-[14px]" />
          )}
        </button>
      </div>

      {/* Image */}
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.term}
          className="w-full h-28 object-cover rounded-lg mb-3"
        />
      )}

      {/* Term */}
      <p className="text-2xl font-bold text-surface-900 mb-0.5">{card.term}</p>

      {/* Pronunciation */}
      {card.pronunciation && (
        <p className="font-pixel text-[8px] text-accent-600 mb-1 flex items-center gap-1">
          {card.audioUrl && <i className="hn hn-sound-on text-xs shrink-0" />}
          {card.pronunciation}
        </p>
      )}

      {/* Meaning */}
      {meaning && (
        <p className="font-pixel text-[8px] text-surface-600 line-clamp-2">
          {meaning}
        </p>
      )}

      {/* Notes */}
      {card.notes && (
        <p className="font-pixel text-[8px] mt-2 text-surface-400 italic line-clamp-1">
          {card.notes}
        </p>
      )}

      {/* SRS state badge */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`font-pixel text-[8px] px-1.5 py-0.5 ${
            card.state === "NEW"
              ? "bg-blue-50 text-blue-600"
              : card.state === "LEARNING"
                ? "bg-amber-50 text-amber-600"
                : card.state === "REVIEW"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
          }`}
        >
          {card.state}
        </span>
        {card.state !== "NEW" && (
          <span className="text-[10px] text-surface-400">
            streak {card.streak}
          </span>
        )}
      </div>
    </div>
  );
}
