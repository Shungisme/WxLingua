"use client";

import { useState, useEffect, useRef } from "react";
import { type DictionarySearchType, type DictionaryWord } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
  flagCode: string;
}[] = [
  { value: "character", flag: "🇨🇳", label: "Chinese", flagCode: "cn" },
  { value: "meaning", flag: "🇺🇸", label: "English", flagCode: "us" },
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
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLang =
    LANG_OPTIONS.find((o) => o.value === searchType) ?? LANG_OPTIONS[0];

  return (
    <div className={cn(className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-stretch gap-3">
          {/* nes-input with inline flag select */}
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              className="w-full"
              style={{ paddingRight: "160px" }}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Type to search..."
              autoComplete="off"
            />
            <div
              ref={langDropdownRef}
              className="absolute right-0 top-0 bottom-0 flex items-center"
            >
              <button
                type="button"
                className="nes-input-select flex items-center gap-1.5 h-full px-3"
                onClick={() => setShowLangDropdown((v) => !v)}
              >
                <img
                  src={`https://flagcdn.com/w20/${selectedLang.flagCode}.png`}
                  alt={selectedLang.label}
                  className="w-4 h-[11px] shrink-0"
                />
                <span className="text-surface-400 shrink-0 rotate-90">
                  <i className="hn hn-play-solid"></i>
                </span>
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black z-50 shadow-lg">
                  {LANG_OPTIONS.map(({ value, label, flagCode }) => (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-xs font-pixel hover:bg-gray-100",
                        searchType === value && "bg-gray-100",
                      )}
                      onClick={() => {
                        handleTypeChange(value);
                        setShowLangDropdown(false);
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/w20/${flagCode}.png`}
                        alt={label}
                        className="w-4 h-[11px] shrink-0"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

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
            className="nes-btn is-primary !px-3 font-pixel !text-[12px] items-center"
          >
            <i className="hn hn-search"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
