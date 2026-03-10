"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateDeckDialog } from "./create-deck-dialog";
import { decksApi, type Deck } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AddToDeckDialogProps {
  open: boolean;
  onClose: () => void;
  wordId: string;
  wordText: string;
}

export function AddToDeckDialog({
  open,
  onClose,
  wordId,
  wordText,
}: AddToDeckDialogProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's decks when dialog opens
  useEffect(() => {
    if (open) {
      fetchDecks();
      setSuccess(false);
      setError(null);
    }
  }, [open]);

  const fetchDecks = async () => {
    setIsFetching(true);
    setError(null);
    try {
      // Fetch user's decks (not public)
      const userDecks = await decksApi.list({ public: false });
      setDecks(userDecks);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load decks");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddToDeck = async () => {
    if (!selectedDeckId) {
      setError("Please select a deck");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await decksApi.addWords(selectedDeckId, { wordIds: [wordId] });
      setSuccess(true);

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedDeckId(null);
      }, 1500);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to add word to deck";

      // Check for duplicate error
      if (message.includes("unique") || message.includes("duplicate")) {
        setError("This word is already in the deck");
      } else {
        setError(message);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateSuccess = (newDeck: Deck) => {
    setDecks([newDeck, ...decks]);
    setSelectedDeckId(newDeck.id);
    setShowCreateDialog(false);
  };

  const handleClose = () => {
    if (!isAdding) {
      setSelectedDeckId(null);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        title="Add to Deck"
        description={`Select a deck to save "${wordText}"`}
      >
        <div className="space-y-4">
          {/* Loading state */}
          {isFetching && (
            <div className="flex items-center justify-center py-8">
              <i className="hn hn-spinner text-2xl animate-spin text-accent-600" />
              <span className="ml-2 text-sm text-surface-500">
                Loading decks...
              </span>
            </div>
          )}

          {/* Empty state */}
          {!isFetching && decks.length === 0 && (
            <div className="text-center py-8">
              <i className="hn hn-folder-open text-[48px] mx-auto text-surface-300 mb-3 block" />
              <p className="text-sm text-surface-500 mb-4">
                You don&apos;t have any decks yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <i className="hn hn-plus text-base mr-1.5" />
                Create your first deck
              </Button>
            </div>
          )}

          {/* Deck list */}
          {!isFetching && decks.length > 0 && (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => setSelectedDeckId(deck.id)}
                    disabled={isAdding || success}
                    className={cn(
                      "w-full p-3 rounded-lg border-2 transition-all",
                      "flex items-start gap-3 text-left",
                      selectedDeckId === deck.id
                        ? "border-accent-500 bg-accent-50"
                        : "border-surface-200 hover:border-surface-300 bg-surface-0",
                      (isAdding || success) && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        selectedDeckId === deck.id
                          ? "border-accent-500 bg-accent-500"
                          : "border-surface-300",
                      )}
                    >
                      {selectedDeckId === deck.id && (
                        <i className="hn hn-check text-xs text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-surface-900 text-sm">
                        {deck.name}
                      </h4>
                      {deck.description && (
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">
                          {deck.description}
                        </p>
                      )}
                      <p className="text-xs text-surface-400 mt-1">
                        {deck.cardCount} cards
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Create new deck button */}
              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                disabled={isAdding || success}
                className={cn(
                  "w-full p-3 rounded-lg border-2 border-dashed border-surface-300",
                  "hover:border-accent-400 hover:bg-accent-50",
                  "flex items-center justify-center gap-2",
                  "text-sm font-medium text-surface-600 hover:text-accent-600",
                  "transition-all",
                  (isAdding || success) && "opacity-50 cursor-not-allowed",
                )}
              >
                <i className="hn hn-plus text-base" />
                Create new deck
              </button>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">✓ Word added to deck!</p>
            </div>
          )}
        </div>

        {!isFetching && decks.length > 0 && (
          <DialogActions>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isAdding || success}
            >
              {success ? "Close" : "Cancel"}
            </Button>
            {!success && (
              <Button
                type="button"
                onClick={handleAddToDeck}
                disabled={!selectedDeckId || isAdding}
              >
                {isAdding ? "Adding..." : "Add to Deck"}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>

      {/* Create Deck Dialog */}
      <CreateDeckDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
