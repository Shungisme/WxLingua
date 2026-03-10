"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Check, Plus } from "lucide-react";
import { wordsApi, decksApi, type Word } from "@/lib/api";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddWordsToDeckDialogProps {
  open: boolean;
  deckId: string;
  existingWordIds: Set<string>;
  onClose: () => void;
  onSuccess: (addedCount: number) => void;
}

export function AddWordsToDeckDialog({
  open,
  deckId,
  existingWordIds,
  onClose,
  onSuccess,
}: AddWordsToDeckDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const words = await wordsApi.list({ q, limit: 30 });
      setResults(words);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setIsAdding(true);
    setError(null);
    try {
      await decksApi.addWords(deckId, { wordIds: [...selected] });
      onSuccess(selected.size);
      handleClose();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to add words");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (isAdding) return;
    setQuery("");
    setResults([]);
    setSelected(new Set());
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add Words to Deck"
      description="Search the word library and select words to add"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words..."
            className="pl-9"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-surface-400" />
          )}
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-surface-200 divide-y divide-surface-100">
          {results.length === 0 && !isSearching && query && (
            <p className="text-sm text-surface-400 text-center py-8">
              No words found for &quot;{query}&quot;
            </p>
          )}
          {results.length === 0 && !query && (
            <p className="text-sm text-surface-400 text-center py-8">
              Type to search words
            </p>
          )}
          {results.map((word) => {
            const alreadyIn = existingWordIds.has(word.id);
            const isSelected = selected.has(word.id);
            return (
              <button
                key={word.id}
                onClick={() => !alreadyIn && toggle(word.id)}
                disabled={alreadyIn}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                  alreadyIn
                    ? "opacity-40 cursor-not-allowed bg-surface-50"
                    : isSelected
                      ? "bg-accent-50"
                      : "hover:bg-surface-50",
                )}
              >
                <div>
                  <span className="font-medium text-surface-900 text-sm">
                    {word.word}
                  </span>
                  <span className="ml-2 text-xs text-surface-400">
                    {word.languageCode}
                  </span>
                  {word.level && (
                    <span className="ml-1 text-xs text-surface-400">
                      · {word.level}
                    </span>
                  )}
                </div>
                {alreadyIn ? (
                  <span className="text-xs text-surface-400">In deck</span>
                ) : isSelected ? (
                  <Check className="h-4 w-4 text-accent-600" />
                ) : null}
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <p className="text-sm text-accent-600 font-medium">
            {selected.size} word{selected.size !== 1 ? "s" : ""} selected
          </p>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <DialogActions>
        <Button variant="ghost" onClick={handleClose} disabled={isAdding}>
          Cancel
        </Button>
        <Button onClick={handleAdd} disabled={selected.size === 0 || isAdding}>
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add {selected.size > 0 ? `${selected.size} ` : ""}Words
        </Button>
      </DialogActions>
    </Dialog>
  );
}
