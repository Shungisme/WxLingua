import type { Metadata } from "next";
import RadicalsPage from "@/components/features/radicals/radicals-page";

export const metadata: Metadata = {
  title: "Radicals",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <RadicalsPage />;
}
