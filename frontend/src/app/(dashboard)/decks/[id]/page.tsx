import DeckDetailPage from "@/components/features/study/deck-detail-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: Readonly<Props>) {
  return <DeckDetailPage params={params} />;
}
