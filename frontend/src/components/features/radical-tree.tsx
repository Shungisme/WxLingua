import { type Radical } from "@/lib/api";

interface RadicalTreeProps {
  radicals: { position: number; radical: Radical }[];
}

export function RadicalTree({ radicals }: RadicalTreeProps) {
  if (!radicals || radicals.length === 0) {
    return <p className="text-sm text-surface-400">No radicals found.</p>;
  }

  const sorted = [...radicals].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-wrap gap-3">
      {sorted.map(({ radical, position }) => (
        <div
          key={radical.id}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-50 p-3 min-w-[72px]"
        >
          <span className="text-3xl font-light text-surface-900 leading-none">
            {radical.char}
          </span>
          <span className="text-xs text-surface-400 text-center leading-snug">
            {(radical.meaning as Record<string, string>)?.vi ??
              (radical.meaning as Record<string, string>)?.en}
          </span>
          <span className="text-[10px] text-surface-300">
            {radical.strokeCount} strokes
          </span>
        </div>
      ))}
    </div>
  );
}
