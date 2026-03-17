"use client";

import { useState, useEffect, useRef } from "react";
import { type DictionarySearchType, type DictionaryWord } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DictionarySuggestions } from "./dictionary-suggestions";
import { HandwritingInputDropdown } from "./dictionary/handwriting-input-dialog";

interface DictionarySearchBarProps {
  initialQuery?: string;
  initialType?: DictionarySearchType;
  initialLanguage?: string;
  onSearch: (
    query: string,
    type: DictionarySearchType,
    language?: string,
  ) => void;
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
  initialLanguage = "zh-TW",
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
  const [showHandwritingDropdown, setShowHandwritingDropdown] = useState(false);
  const [languageCode, setLanguageCode] = useState<string>(initialLanguage);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const handwritingDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setLanguageCode(initialLanguage || "zh-TW");
  }, [initialLanguage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), "character", languageCode);
      setShowSuggestions(false);
    }
  };

  const handleTypeChange = (type: DictionarySearchType) => {
    setSearchType(type);
    const nextLanguage = type === "meaning" ? "en" : "zh-TW";
    setLanguageCode(nextLanguage);
    if (query.trim()) {
      onSearch(query.trim(), "character", nextLanguage);
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
    onSearch(word.word, "character", languageCode);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (query.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleHandwritingSelect = (character: string) => {
    setQuery(character);
    setSearchType("character");
    setLanguageCode("zh-TW");
    onSearch(character, "character", "zh-TW");
    setShowSuggestions(false);
    setShowHandwritingDropdown(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(target)
      ) {
        setShowLangDropdown(false);
      }

      if (
        handwritingDropdownRef.current &&
        !handwritingDropdownRef.current.contains(target)
      ) {
        setShowHandwritingDropdown(false);
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
              style={{ paddingRight: "128px" }}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Type to search..."
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1">
              <div ref={handwritingDropdownRef} className="relative">
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center",
                    "border-2 border-black bg-surface-50 text-surface-800",
                    "shadow-[2px_2px_0_#0f172a] transition-all",
                    "hover:bg-accent-100",
                    "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                    showHandwritingDropdown &&
                      "bg-accent-200 translate-x-[1px] translate-y-[1px] shadow-none",
                  )}
                  onClick={() => {
                    setShowHandwritingDropdown((v) => !v);
                    setShowLangDropdown(false);
                  }}
                  aria-label="Open handwriting input"
                >
                  <i className="hn hn-pencil" />
                </button>

                <HandwritingInputDropdown
                  open={showHandwritingDropdown}
                  onClose={() => setShowHandwritingDropdown(false)}
                  onSelectCharacter={handleHandwritingSelect}
                  language="zh-TW"
                />
              </div>

              <div ref={langDropdownRef} className="relative">
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 px-2",
                    "border-2 border-black bg-surface-50",
                    "shadow-[2px_2px_0_#0f172a] transition-all",
                    "hover:bg-accent-100",
                    "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                    showLangDropdown &&
                      "bg-accent-200 translate-x-[1px] translate-y-[1px] shadow-none",
                  )}
                  onClick={() => {
                    setShowLangDropdown((v) => !v);
                    setShowHandwritingDropdown(false);
                  }}
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
                  <div className="absolute right-0 top-full mt-2 z-50 w-36 border-[3px] border-black bg-surface-0 p-1 shadow-pixel">
                    {LANG_OPTIONS.map(({ value, label, flagCode }) => (
                      <button
                        key={value}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 border-2 border-transparent px-2 py-1.5 text-[8px] font-pixel",
                          "hover:border-black hover:bg-surface-100",
                          searchType === value &&
                            "border-black bg-accent-100 shadow-[2px_2px_0_#0f172a]",
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
                        <span className="text-surface-700">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <DictionarySuggestions
              query={query}
              searchType="character"
              language={languageCode}
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
