import { Suspense } from "react";
import { radicalsApi } from "@/lib/api";
import { RadicalsGrid } from "./radicals-grid";
import { RadicalSkeleton } from "@/components/ui/skeleton";
import type { Radical } from "@/types";

export default async function RadicalsPage() {
  let radicals: Radical[] = [];
  let loadFailed = false;

  try {
    radicals = await radicalsApi.list({ limit: 214 });
  } catch (error) {
    loadFailed = true;
    console.error("Failed to load radicals", error);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-pixel text-sm text-surface-900 mb-1">
        Kangxi Radicals
      </h1>
      <p className="font-pixel text-[8px] text-surface-400">
        214 radicals — foundation for understanding Chinese character structure.
      </p>

      {loadFailed ? (
        <div className="nes-container is-rounded mt-4">
          <p className="font-pixel text-[8px] text-surface-700">
            Could not load radicals right now. Please check backend connection
            and reload this page.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
