"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DictionarySearchBar } from "@/components/features/dictionary-search-bar";
import type { DictionarySearchType } from "@/types";

export function DictionaryClientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialLanguage = searchParams.get("language") || "zh-TW";
  const rawType = searchParams.get("type") as DictionarySearchType | null;
  const initialType: DictionarySearchType =
    initialLanguage === "en"
      ? "meaning"
      : rawType === "character" || rawType === "meaning"
        ? rawType
        : "character";

  const handleSearch = (
    query: string,
    type: DictionarySearchType,
    language?: string,
  ) => {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("type", "character");
    params.set("language", language || "zh-TW");
    router.push(`/dictionary?${params.toString()}`);
  };

  return (
    <DictionarySearchBar
      initialQuery={initialQuery}
      initialType={initialType}
      initialLanguage={initialLanguage}
      onSearch={handleSearch}
    />
  );
}
