"use client";

import { useState, useEffect, useCallback } from "react";
import { wordsApi, decksApi } from "@/lib/api";
import type { Word } from "@/types";
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
  const [mode, setMode] = useState<"dictionary" | "manual">("dictionary");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Word[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [term, setTerm] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaningVi, setMeaningVi] = useState("");
  const [meaningEn, setMeaningEn] = useState("");
  const [notes, setNotes] = useState("");
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

  const handleAddManual = async () => {
    if (!term.trim()) return;

    setIsAdding(true);
    setError(null);

    const meaning: Record<string, string> = {};
    if (meaningVi.trim()) {
      meaning.vi = meaningVi.trim();
    }
    if (meaningEn.trim()) {
      meaning.en = meaningEn.trim();
    }

    try {
      await decksApi.createCard(deckId, {
        term: term.trim(),
        pronunciation: pronunciation.trim() || undefined,
        meaning: Object.keys(meaning).length > 0 ? meaning : undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess(1);
      handleClose();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to add custom card";
      setError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (isAdding) return;
    setMode("dictionary");
    setQuery("");
    setResults([]);
    setSelected(new Set());
    setTerm("");
    setPronunciation("");
    setMeaningVi("");
    setMeaningEn("");
    setNotes("");
    setError(null);
    onClose();
  };

  const canAddManual = term.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add Words to Deck"
      description="Choose words from dictionary or create your own card"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-1 w-full border-b-[4px] border-ui-ink">
          <button
            type="button"
            onClick={() => {
              setMode("dictionary");
              setError(null);
            }}
            className={cn(
              "w-full mb-[-4px] border-[4px] text-center font-pixel !text-[8px] leading-[1.5] outline-none image-rendering-pixelated transition-[background,color,box-shadow,padding] duration-100",
              mode === "dictionary"
                ? "bg-ui-primary text-ui-primary-contrast border-ui-ink border-b-ui-primary shadow-ui-primary-inset pt-[12px] pb-[12px]"
                : "bg-ui-muted-bg text-ui-muted-text border-ui-ink pt-[8px] pb-[8px] hover:bg-ui-hover-bg hover:text-ui-hover-text",
            )}
          >
            From Dictionary
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("manual");
              setError(null);
            }}
            className={cn(
              "w-full border-[4px] text-center font-pixel !text-[8px] leading-[1.5] outline-none image-rendering-pixelated transition-[background,color,box-shadow,padding] duration-100",
              mode === "manual"
                ? "bg-ui-primary text-ui-primary-contrast border-ui-ink border-b-ui-primary shadow-ui-primary-inset pt-[12px] pb-[12px]"
                : "bg-ui-muted-bg text-ui-muted-text border-ui-ink pt-[8px] pb-[8px] hover:bg-ui-hover-bg hover:text-ui-hover-text",
            )}
          >
            Add Manually
          </button>
        </div>

        {mode === "dictionary" ? (
          <>
            <div className="relative">
              <i className="hn hn-search text-base absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search words..."
                className="!pl-8"
                autoFocus
              />
              {isSearching && (
                <i className="hn hn-spinner text-base animate-spin text-surface-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-surface-200 divide-y divide-surface-100">
              {results.length === 0 && !isSearching && query && (
                <p className="font-pixel text-[8px] text-surface-400 text-center py-8">
                  No words found for &quot;{query}&quot;
                </p>
              )}
              {results.length === 0 && !query && (
                <p className="font-pixel text-[8px] text-surface-400 text-center py-8">
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
                      <i className="hn hn-check text-base text-accent-600" />
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
          </>
        ) : (
          <div className="space-y-3">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Term (required)"
              autoFocus
            />
            <Input
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              placeholder="Pronunciation (optional)"
            />
            <Input
              value={meaningVi}
              onChange={(e) => setMeaningVi(e.target.value)}
              placeholder="Meaning (Vietnamese)"
            />
            <Input
              value={meaningEn}
              onChange={(e) => setMeaningEn(e.target.value)}
              placeholder="Meaning (English)"
            />
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
            />
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <DialogActions>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClose}
          disabled={isAdding}
        >
          Cancel
        </Button>
        {mode === "dictionary" ? (
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={selected.size === 0 || isAdding}
          >
            {isAdding ? (
              <i className="hn hn-spinner text-base animate-spin mr-2" />
            ) : (
              <i className="hn hn-plus text-base mr-2" />
            )}
            Add {selected.size > 0 ? `${selected.size} ` : ""}Words
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleAddManual}
            disabled={!canAddManual || isAdding}
          >
            {isAdding ? (
              <i className="hn hn-spinner text-base animate-spin mr-2" />
            ) : (
              <i className="hn hn-plus text-base mr-2" />
            )}
            Add Custom Card
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
