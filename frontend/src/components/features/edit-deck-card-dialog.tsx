"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decksApi } from "@/lib/api";
import type { DeckCard } from "@/types";
import type { UpdateDeckCardRequest } from "@/api/DecksApi";

interface EditDeckCardDialogProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
  card: DeckCard;
  onSuccess: (updated: DeckCard) => void;
}

export function EditDeckCardDialog({
  open,
  onClose,
  deckId,
  card,
  onSuccess,
}: EditDeckCardDialogProps) {
  const [term, setTerm] = useState(card.term);
  const [pronunciation, setPronunciation] = useState(card.pronunciation ?? "");
  const [meaningVi, setMeaningVi] = useState(card.meaning?.vi ?? "");
  const [meaningEn, setMeaningEn] = useState(card.meaning?.en ?? "");
  const [imageUrl, setImageUrl] = useState(card.imageUrl ?? "");
  const [notes, setNotes] = useState(card.notes ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when card changes
  useEffect(() => {
    setTerm(card.term);
    setPronunciation(card.pronunciation ?? "");
    setMeaningVi(card.meaning?.vi ?? "");
    setMeaningEn(card.meaning?.en ?? "");
    setImageUrl(card.imageUrl ?? "");
    setNotes(card.notes ?? "");
    setError(null);
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      setError("Term is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build meaning object (only include non-empty keys)
    const meaning: Record<string, string> = {};
    if (meaningVi.trim()) meaning.vi = meaningVi.trim();
    if (meaningEn.trim()) meaning.en = meaningEn.trim();

    const payload: UpdateDeckCardRequest = {
      term: term.trim(),
      pronunciation: pronunciation.trim() || undefined,
      meaning: Object.keys(meaning).length > 0 ? meaning : undefined,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const updated = await decksApi.updateCard(deckId, card.id, payload);
      onSuccess(updated);
      onClose();
    } catch {
      setError("Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Edit Card"
      description="Customize this card's content independently of the dictionary."
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Term */}
          <div>
            <label
              htmlFor="edit-term"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Term <span className="text-red-500">*</span>
            </label>
            <Input
              id="edit-term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. 學"
              disabled={isLoading}
              required
            />
          </div>

          {/* Pronunciation */}
          <div>
            <label
              htmlFor="edit-pronunciation"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Pronunciation / Pinyin
            </label>
            <Input
              id="edit-pronunciation"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="e.g. xué"
              disabled={isLoading}
            />
          </div>

          {/* Meaning */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-meaning-vi"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Vietnamese meaning
              </label>
              <Input
                id="edit-meaning-vi"
                value={meaningVi}
                onChange={(e) => setMeaningVi(e.target.value)}
                placeholder="e.g. to study, to learn"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="edit-meaning-en"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                English meaning
              </label>
              <Input
                id="edit-meaning-en"
                value={meaningEn}
                onChange={(e) => setMeaningEn(e.target.value)}
                placeholder="e.g. study / learn"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="edit-image"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Image URL
            </label>
            <Input
              id="edit-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              disabled={isLoading}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="mt-2 h-20 w-auto rounded-md border border-surface-200 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="edit-notes"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Personal notes or mnemonics..."
              rows={2}
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-colors text-sm resize-none disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogActions>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
