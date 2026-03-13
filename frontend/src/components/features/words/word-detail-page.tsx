import { notFound } from "next/navigation";
import { wordsApi } from "@/lib/api";
import { RadicalTree } from "@/components/features/radical-tree";
import { LevelBadge, Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ id: string }> };

export default async function WordDetailPage({ params }: Props) {
  const { id } = await params;

  let word;
  try {
    word = await wordsApi.getById(id);
  } catch {
    notFound();
  }

  const meta = word.metadata as Record<string, string> | undefined;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
    "http://localhost:3000";
  const audioSrc =
    word.audioUrl && word.audioUrl.startsWith("http")
      ? word.audioUrl
      : word.audioUrl
        ? `${apiBase}${word.audioUrl}`
        : undefined;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-start gap-6">
        <span className="text-8xl font-light text-surface-900 leading-none">
          {word.word}
        </span>
        {word.audioUrl && (
          <audio controls src={audioSrc} className="mt-4">
            <track kind="captions" />
          </audio>
        )}
      </div>

      {/* Meta */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <Badge variant="default">{word.languageCode}</Badge>
        <LevelBadge level={word.level} />
        {meta?.pinyin && <Badge variant="accent">{meta.pinyin}</Badge>}
        {meta?.phonetic && <Badge variant="accent">{meta.phonetic}</Badge>}
      </div>

      {/* Radical decomposition */}
      {word.wordRadicals && word.wordRadicals.length > 0 && (
        <section className="mt-10">
          <h2 className="font-pixel text-[10px] text-surface-800 mb-4">
            Radicals
          </h2>
          <RadicalTree radicals={word.wordRadicals} />
        </section>
      )}
    </div>
  );
}
