"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DictionarySearchBar } from "@/components/features/dictionary-search-bar";
import { type DictionarySearchType } from "@/lib/api";

export function DictionaryClientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialType =
    (searchParams.get("type") as DictionarySearchType) || "all";

  const handleSearch = (query: string, type: DictionarySearchType) => {
    const params = new URLSearchParams();
    params.set("q", query);
    if (type !== "all") {
      params.set("type", type);
    }
    router.push(`/dictionary?${params.toString()}`);
  };

  return (
    <DictionarySearchBar
      initialQuery={initialQuery}
      initialType={initialType}
      onSearch={handleSearch}
    />
  );
}
