"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decksApi } from "@/lib/api";
import { type CreateDeckRequest, type Deck } from "@/types";

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
              className="block font-pixel text-[9px] text-surface-700 mb-1.5"
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
              className="!text-[8px]"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="deck-description"
              className="block font-pixel text-[9px] text-surface-700 mb-1.5"
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
              className="nes-textarea w-full font-pixel !text-[8px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="deck-language"
              className="block font-pixel text-[9px] text-surface-700 mb-1.5"
            >
              Language
            </label>
            <div className="nes-select disabled:opacity-50">
              <select
                id="deck-language"
                value={formData.languageCode || ""}
                onChange={(e) =>
                  setFormData({ ...formData, languageCode: e.target.value })
                }
                disabled={isLoading}
                className="font-pixel !text-[8px]"
              >
                <option value="">Select language</option>
                <option value="zh-TW">繁體中文 (Traditional Chinese)</option>
                <option value="en">English</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ko">한국어 (Korean)</option>
              </select>
            </div>
          </div>

          {/* Public */}
          <div>
            <label className="nes-checkbox-label flex items-center gap-3 cursor-pointer">
              <input
                id="deck-public"
                type="checkbox"
                className="nes-checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                disabled={isLoading}
              />
              <span className="font-pixel text-[9px] text-surface-700 py-1">
                Public (allow others to view and use)
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 border-2 border-red-400 bg-red-50">
              <p className="font-pixel text-[8px] text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogActions>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="!text-[10px]"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="!text-[10px]">
            {isLoading ? "Creating..." : "Create Deck"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
