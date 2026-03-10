import type { Metadata } from "next";
import { Suspense } from "react";
import {
  dictionaryApi,
  DictionarySearchResult,
  type DictionaryWord,
} from "@/lib/api";
import { DictionaryResultCard } from "@/components/features/dictionary-result-card";
import { DictionaryClientSearch } from "./dictionary-client-search";

export const metadata: Metadata = {
  title: "Dictionary",
  description:
    "Search 124,000+ Chinese words with pinyin and English definitions",
};

export const revalidate = 3600; // Revalidate every hour

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: "character" | "pinyin" | "meaning" | "all";
  }>;
};

async function DictionaryResults({
  query,
  type,
}: {
  query: string;
  type?: string;
}) {
  if (!query || query.trim().length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-400 text-lg">
          Enter a keyword to start searching
        </p>
        <p className="text-surface-300 text-sm mt-2">
          Search by Chinese character, pinyin, or English meaning
        </p>
      </div>
    );
  }

  try {
    const results = await dictionaryApi.search({
      q: query,
      type: (type as any) || "all",
      limit: 50,
    });

    if (results.total === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-surface-400 text-lg">
            No results found for &quot;{query}&quot;
          </p>
          <p className="text-surface-300 text-sm mt-2">
            Try a different keyword or change the search type
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-surface-500">
            Found <strong className="text-surface-900">{results.total}</strong>{" "}
            result(s) for &quot;{query}&quot;
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results?.words.map((word: DictionaryWord) => (
            <DictionaryResultCard key={word.id} word={word} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dictionary search error:", error);
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg">
          An error occurred while searching
        </p>
        <p className="text-surface-400 text-sm mt-2">Please try again later</p>
      </div>
    );
  }
}

function DictionaryResultsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-surface-200 bg-surface-0 p-5 animate-pulse"
        >
          <div className="h-12 w-24 bg-surface-100 rounded" />
          <div className="mt-2 h-4 w-32 bg-surface-100 rounded" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-surface-100 rounded" />
            <div className="h-3 w-4/5 bg-surface-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DictionaryPage({ searchParams }: Props) {
  const { q, type } = await searchParams;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">
          Chinese Dictionary
        </h1>
        <p className="text-surface-500">
          Search 124,000+ Chinese words with pinyin and definitions
        </p>
      </div>

      {/* Search Bar */}
      <Suspense
        fallback={
          <div className="h-24 animate-pulse bg-surface-50 rounded-xl" />
        }
      >
        <DictionaryClientSearch />
      </Suspense>

      {/* Results */}
      <div className="mt-8">
        <Suspense fallback={<DictionaryResultsSkeleton />}>
          <DictionaryResults query={q || ""} type={type} />
        </Suspense>
      </div>
    </div>
  );
}
