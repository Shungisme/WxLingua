import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatsWidget } from "@/components/features/stats-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, BookOpen, FolderOpen } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const quickLinks = [
  { href: "/study", label: "Study", icon: Zap, desc: "Study your flashcards" },
  {
    href: "/words",
    label: "Words",
    icon: BookOpen,
    desc: "Browse your entire dictionary",
  },
  {
    href: "/decks",
    label: "Decks",
    icon: FolderOpen,
    desc: "Manage your flashcard collections",
  },
];

const staggerClasses = ["stagger-1", "stagger-2", "stagger-3"] as const;

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-surface-900 mb-2 animate-fade-in-down">
        Dashboard
      </h1>
      <p className="text-sm text-surface-400 mb-8 animate-fade-in-down stagger-1">
        Track your learning progress.
      </p>

      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Skeleton className="h-20 sm:h-24 rounded-xl" />
            <Skeleton className="h-20 sm:h-24 rounded-xl" />
            <Skeleton className="h-20 sm:h-24 rounded-xl" />
          </div>
        }
      >
        <StatsWidget />
      </Suspense>

      <h2 className="text-lg font-semibold text-surface-800 mt-10 mb-4">
        Quick Access
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, desc }, i) => (
          <Link
            key={href}
            href={href}
            className={`rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2 animate-fade-in-up ${staggerClasses[i]}`}
          >
            <Icon className="h-5 w-5 text-accent-600" />
            <p className="font-semibold text-surface-900 text-sm">{label}</p>
            <p className="text-xs text-surface-400">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
