"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decksApi, type CreateDeckRequest, type Deck } from "@/lib/api";

interface CreateDeckDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (deck: Deck) => void;
}

export function CreateDeckDialog({
  open,
  onClose,
  onSuccess,
}: CreateDeckDialogProps) {
  const [formData, setFormData] = useState<CreateDeckRequest>({
    name: "",
    description: "",
    languageCode: "zh-TW",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter a deck name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newDeck = await decksApi.create({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        languageCode: formData.languageCode || undefined,
        isPublic: formData.isPublic,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        languageCode: "zh-TW",
        isPublic: false,
      });

      onSuccess?.(newDeck);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create deck");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "",
        description: "",
        languageCode: "zh-TW",
        isPublic: false,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Create New Deck"
      description="Create a flashcard collection to study vocabulary"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="deck-name"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Deck Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="deck-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. HSK 1, Daily Vocabulary..."
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="deck-description"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="deck-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Short description..."
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-colors text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="deck-language"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Language
            </label>
            <select
              id="deck-language"
              value={formData.languageCode || ""}
              onChange={(e) =>
                setFormData({ ...formData, languageCode: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select language</option>
              <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese)</option>
              <option value="ko">한국어 (Korean)</option>
            </select>
          </div>

          {/* Public */}
          <div className="flex items-center gap-2">
            <input
              id="deck-public"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              disabled={isLoading}
              className="h-4 w-4 rounded border-surface-300 text-accent-600 focus:ring-accent-500"
            />
            <label
              htmlFor="deck-public"
              className="text-sm text-surface-700 cursor-pointer"
            >
              Public (allow others to view and use)
            </label>
          </div>

          {/* Error */}
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
            {isLoading ? "Creating..." : "Create Deck"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
