import type { Metadata } from "next";
import { Suspense } from "react";
import { type Word, wordsApi } from "@/lib/api";
import { WordCard } from "@/components/features/word-card";
import { WordCardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Vocabulary" };
export const revalidate = 60;

async function WordsGrid({ language }: { language?: string }) {
  const words = await wordsApi.list({ language, limit: 48 });
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {words.map((w: Word) => (
        <WordCard key={w.id} word={w} />
      ))}
    </div>
  );
}

const LANGS = ["zh", "en", "ja", "ko"];

type Props = { searchParams: Promise<{ lang?: string }> };

export default async function WordsPage({ searchParams }: Props) {
  const { lang } = await searchParams;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-surface-900 mb-1">Vocabulary</h1>
      <p className="text-sm text-surface-400">
        Browse and search the entire word bank.
      </p>

      {/* Language filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", ...LANGS].map((l) => {
          const active = (!lang && l === "all") || lang === l;
          return (
            <a
              key={l}
              href={l === "all" ? "/words" : `/words?lang=${l}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? "bg-accent-600 text-white border-accent-600"
                  : "border-surface-200 text-surface-500 hover:border-accent-300 hover:text-accent-600"
              }`}
            >
              {l === "all" ? "Tất cả" : l.toUpperCase()}
            </a>
          );
        })}
      </div>

      <Suspense
        fallback={
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <WordCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <WordsGrid language={lang} />
      </Suspense>
    </div>
  );
}
