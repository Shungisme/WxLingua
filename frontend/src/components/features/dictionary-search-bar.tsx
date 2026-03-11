"use client";

import { useState, useEffect, useRef } from "react";
import { type DictionarySearchType, type DictionaryWord } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DictionarySuggestions } from "./dictionary-suggestions";

interface DictionarySearchBarProps {
  initialQuery?: string;
  initialType?: DictionarySearchType;
  onSearch: (query: string, type: DictionarySearchType) => void;
  className?: string;
}

const LANG_OPTIONS: {
  value: DictionarySearchType;
  flag: string;
  label: string;
}[] = [
  { value: "character", flag: "🇨🇳", label: "Chinese" },
  { value: "meaning", flag: "🇺🇸", label: "English" },
];

export function DictionarySearchBar({
  initialQuery = "",
  initialType = "all",
  onSearch,
  className,
}: DictionarySearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<DictionarySearchType>(
    initialType === "all" || initialType === "pinyin"
      ? "character"
      : initialType,
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSearchType(
      initialType === "all" || initialType === "pinyin"
        ? "character"
        : initialType,
    );
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
    <div className={cn(className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-stretch gap-3">
          {/* nes-input with inline flag select */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              className="nes-input w-full"
              style={{ paddingRight: "160px" }}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="TYPE TO SEARCH..."
              autoComplete="off"
            />
            <select
              className="nes-input-select"
              value={searchType}
              onChange={(e) =>
                handleTypeChange(e.target.value as DictionarySearchType)
              }
            >
              {LANG_OPTIONS.map(({ value, flag, label }) => (
                <option key={value} value={value}>
                  {flag} {label}
                </option>
              ))}
            </select>

            {/* Suggestions Dropdown */}
            <DictionarySuggestions
              query={query}
              searchType={searchType}
              onSelect={handleSuggestionSelect}
              onClose={() => setShowSuggestions(false)}
              isVisible={showSuggestions}
            />
          </div>

          {/* NES submit button */}
          <button
            type="submit"
            className="nes-btn is-primary !py-2 !px-5 font-pixel text-[9px]"
          >
            ▶ SEARCH
          </button>
        </div>
      </form>
    </div>
  );
}
