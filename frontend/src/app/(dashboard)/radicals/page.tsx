import type { Metadata } from "next";
import { Suspense } from "react";
import { radicalsApi, type Radical } from "@/lib/api";
import { RadicalsGrid } from "./radicals-grid";
import { RadicalSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Radicals" };
export const dynamic = "force-dynamic";

export default async function RadicalsPage() {
  const radicals = await radicalsApi.list({ limit: 214 });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-pixel text-sm text-surface-900 mb-1">
        Kangxi Radicals
      </h1>
      <p className="font-pixel text-[8px] text-surface-400">
        214 radicals — foundation for understanding Chinese character structure.
      </p>

      <Suspense
        fallback={
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {Array.from({ length: 40 }).map((_, i) => (
              <RadicalSkeleton key={i} />
            ))}
          </div>
        }
      >
        <RadicalsGrid radicals={radicals} />
      </Suspense>
    </div>
  );
}
