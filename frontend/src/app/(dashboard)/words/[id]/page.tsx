import type { Metadata } from "next";
import { wordsApi } from "@/lib/api";
import WordDetailPage from "@/components/features/words/word-detail-page";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const word = await wordsApi.getById(id);
    return { title: word.word };
  } catch {
    return { title: "Vocabulary" };
  }
}

export default async function Page({ params }: Readonly<Props>) {
  return <WordDetailPage params={params} />;
}
