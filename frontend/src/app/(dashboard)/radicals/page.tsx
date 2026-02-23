import type { Metadata } from "next";
import { radicalsApi, type Radical } from "@/lib/api";

export const metadata: Metadata = { title: "Bộ thủ" };
export const revalidate = 3600;

export default async function RadicalsPage() {
  const radicals = await radicalsApi.list({ limit: 214 });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-surface-900 mb-1">
        Bộ thủ Khang Hi
      </h1>
      <p className="text-sm text-surface-400 mb-8">
        214 bộ thủ — nền tảng để hiểu cấu trúc chữ Hán.
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
              className="group flex flex-col items-center gap-1 rounded-xl border border-surface-200 bg-surface-0 p-3 cursor-default hover:border-accent-300 hover:bg-accent-50 transition-colors"
            >
              <span className="text-2xl text-surface-900 leading-none">
                {r.char}
              </span>
              <span className="text-[10px] text-surface-400 text-center truncate w-full">
                {meaning}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
