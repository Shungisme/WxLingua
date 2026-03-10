import type { Metadata } from "next";
import { radicalsApi, type Radical } from "@/lib/api";

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

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {radicals.map((r: Radical) => {
          const meaning =
            (r.meaning as Record<string, string>)?.vi ??
            (r.meaning as Record<string, string>)?.en ??
            "";
          return (
            <div
              key={r.id}
              title={meaning}
              className="group flex flex-col items-center gap-1 border-2 border-surface-200 bg-surface-0 p-3 cursor-default hover:border-accent-300 hover:bg-accent-50 transition-colors"
            >
              <span className="text-2xl text-surface-900 leading-none">
                {r.char}
              </span>
              <span className="font-pixel text-[8px] text-surface-400 text-center truncate w-full">
                {meaning}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
