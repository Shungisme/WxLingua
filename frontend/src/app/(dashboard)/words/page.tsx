import type { Metadata } from "next";
import WordsPage from "@/components/features/words/words-page";

export const metadata: Metadata = {
  title: "Vocabulary",
};

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function Page({ searchParams }: Readonly<Props>) {
  return <WordsPage searchParams={searchParams} />;
}
