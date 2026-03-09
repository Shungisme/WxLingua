import type { Metadata } from "next";
import { StudySession } from "@/components/features/study-session";
import { StatsPanel } from "@/components/features/stats-panel";
import { ReviewHeatmap } from "@/components/features/review-heatmap";
import { ForecastChart } from "@/components/features/forecast-chart";

export const metadata: Metadata = { title: "Study now" };

export default function StudyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">
          Study overview
        </h1>
        <p className="text-sm text-surface-400">
          Track your progress and continue studying with SRS algorithm.
        </p>
      </div>

      <StatsPanel />

      <div className="bg-surface-0 border border-surface-200 rounded-2xl p-6 shadow-sm mb-12">
        <StudySession />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart />
        <ReviewHeatmap />
      </div>
    </div>
  );
}
