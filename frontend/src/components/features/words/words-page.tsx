import { Suspense } from "react";
import { type Word, wordsApi } from "@/lib/api";
import { WordsGridClient } from "./words-grid-client";
import { WordCardSkeleton } from "@/components/ui/skeleton";

async function WordsGrid({ language }: { language?: string }) {
  const words = await wordsApi.list({ language, limit: 48 });
  return <WordsGridClient words={words} />;
}

const LANGS = ["zh", "en", "ja", "ko"];

type Props = { searchParams: Promise<{ lang?: string }> };

export default async function WordsPage({ searchParams }: Props) {
  const { lang } = await searchParams;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-pixel text-sm text-surface-900 mb-1">Vocabulary</h1>
      <p className="font-pixel text-[8px] text-surface-400">
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
              className={`px-3 py-1.5 font-pixel text-[8px] border-2 transition-colors ${
                active
                  ? "bg-accent-600 text-white border-accent-600"
                  : "border-surface-200 text-surface-500 hover:border-accent-600 hover:text-accent-600"
              }`}
            >
              {l === "all" ? "All" : l.toUpperCase()}
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
