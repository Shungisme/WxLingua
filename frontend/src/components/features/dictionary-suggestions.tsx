"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  dictionaryApi,
  type DictionaryWord,
  type DictionarySearchType,
} from "@/lib/api";
import { useDebounce } from "../../hooks";
import { cn } from "@/lib/utils";

interface DictionarySuggestionsProps {
  query: string;
  searchType: DictionarySearchType;
  onSelect: (word: DictionaryWord) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function DictionarySuggestions({
  query,
  searchType,
  onSelect,
  onClose,
  isVisible,
}: DictionarySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<DictionaryWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const results = await dictionaryApi.search({
          q: debouncedQuery,
          type: searchType,
          limit: 8, // Show max 8 suggestions
        });
        setSuggestions(results.words);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, searchType]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose]);

  if (!isVisible || query.trim().length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-full left-0 right-0 mt-2 z-50",
        "bg-surface-0 border border-surface-200 rounded-xl shadow-lg",
        "max-h-96 overflow-y-auto",
      )}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent-600" />
          <span className="ml-2 text-sm text-surface-500">Đang tìm...</span>
        </div>
      )}

      {!isLoading && suggestions.length === 0 && debouncedQuery && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-surface-400">
            Không tìm thấy kết quả cho &quot;{debouncedQuery}&quot;
          </p>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="py-2">
          {suggestions.map((word, index) => {
            const metadata = word.metadata;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={word.id}
                type="button"
                onClick={() => onSelect(word)}
                className={cn(
                  "w-full px-4 py-3 text-left",
                  "hover:bg-accent-50 transition-colors",
                  "border-b border-surface-100 last:border-0",
                  isSelected && "bg-accent-50",
                )}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-light text-surface-900">
                    {word.word}
                  </span>
                  {metadata.simplified && metadata.simplified !== word.word && (
                    <span className="text-lg text-surface-400">
                      {metadata.simplified}
                    </span>
                  )}
                </div>
                {metadata.pinyin && (
                  <p className="mt-1 text-sm text-accent-600 font-medium">
                    {metadata.pinyin}
                  </p>
                )}
                {metadata.meanings && metadata.meanings.length > 0 && (
                  <p className="mt-1 text-xs text-surface-500 line-clamp-1">
                    {metadata.meanings[0]}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
