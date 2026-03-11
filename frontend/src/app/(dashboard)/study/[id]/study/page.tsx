import type { Metadata } from "next";
import { decksApi } from "@/lib/api";
import DeckStudyPage from "@/components/features/study/deck-study-page";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const deck = await decksApi.getById(id);
    return { title: `Study: ${deck.name}` };
  } catch {
    return { title: "Study Deck" };
  }
}

export default async function Page({ params, searchParams }: Readonly<Props>) {
  return <DeckStudyPage params={params} searchParams={searchParams} />;
}
