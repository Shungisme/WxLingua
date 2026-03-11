import type { Metadata } from "next";
import DictionaryPage from "@/components/features/dictionary/dictionary-page";

export const metadata: Metadata = {
  title: "Dictionary",
  description:
    "Search 124,000+ Chinese words with pinyin and English definitions",
};

export const revalidate = 3600;

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: "character" | "pinyin" | "meaning" | "all";
  }>;
};

export default async function Page({ searchParams }: Readonly<Props>) {
  return <DictionaryPage searchParams={searchParams} />;
}
