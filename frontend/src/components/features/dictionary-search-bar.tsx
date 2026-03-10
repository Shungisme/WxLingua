"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { type DictionarySearchType, type DictionaryWord } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DictionarySuggestions } from "./dictionary-suggestions";

interface DictionarySearchBarProps {
  initialQuery?: string;
  initialType?: DictionarySearchType;
  onSearch: (query: string, type: DictionarySearchType) => void;
  className?: string;
}

const SEARCH_TYPES: { value: DictionarySearchType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "character", label: "Chinese" },
  { value: "pinyin", label: "Pinyin" },
  { value: "meaning", label: "Meaning" },
];

export function DictionarySearchBar({
  initialQuery = "",
  initialType = "all",
  onSearch,
  className,
}: DictionarySearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] =
    useState<DictionarySearchType>(initialType);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSearchType(initialType);
  }, [initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
      setShowSuggestions(false);
    }
  };

  const handleTypeChange = (type: DictionarySearchType) => {
    setSearchType(type);
    if (query.trim()) {
      onSearch(query.trim(), type);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(newQuery.trim().length > 0);
  };

  const handleSuggestionSelect = (word: DictionaryWord) => {
    setQuery(word.word);
    onSearch(word.word, searchType);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (query.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search Chinese characters, pinyin or meaning..."
            className={cn(
              "w-full pl-12 pr-4 py-3.5 rounded-xl",
              "border border-surface-200 bg-surface-0",
              "text-surface-900 placeholder:text-surface-400",
              "focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent",
              "transition-all text-base",
            )}
            autoComplete="off"
          />

          {/* Suggestions Dropdown */}
          <DictionarySuggestions
            query={query}
            searchType={searchType}
            onSelect={handleSuggestionSelect}
            onClose={() => setShowSuggestions(false)}
            isVisible={showSuggestions}
          />
        </div>
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      {/* Search Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {SEARCH_TYPES.map(({ value, label }) => {
          const active = searchType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleTypeChange(value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                "border transition-all",
                active
                  ? "bg-accent-600 text-white border-accent-600 shadow-sm"
                  : "border-surface-200 text-surface-600 hover:border-accent-300 hover:text-accent-600 hover:bg-accent-50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
