import Link from "next/link";
import { Suspense } from "react";
import { StatsWidget } from "@/components/features/stats-widget";
import { Skeleton } from "@/components/ui/skeleton";

const quickLinks = [
  {
    href: "/decks",
    label: "Decks",
    icon: <i className="hn hn-lightbulb-solid"></i>,
    desc: "Review your flashcards",
    nesBtnClass: "is-primary",
  },
  {
    href: "/words",
    label: "Words",
    icon: <i className="hn hn-book-heart-solid"></i>,
    desc: "Browse your dictionary",
    nesBtnClass: "",
  },
  {
    href: "/dictionary",
    label: "Dictionary",
    icon: <i className="hn hn-search"></i>,
    desc: "Search words",
    nesBtnClass: "is-success",
  },
];

const staggerClasses = ["stagger-1", "stagger-2", "stagger-3"] as const;

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-down">
        <i className="nes-icon coin is-medium" />
        <div>
          <h1 className="font-pixel text-lg text-surface-900 leading-loose">
            Dashboard
          </h1>
          <p className="font-pixel text-[8px] text-surface-400 stagger-1">
            Track your learning quest.
          </p>
        </div>
      </div>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Skeleton className="h-20 sm:h-24" />
            <Skeleton className="h-20 sm:h-24" />
            <Skeleton className="h-20 sm:h-24" />
          </div>
        }
      >
        <StatsWidget />
      </Suspense>

      {/* Quick Access */}
      <div className="mt-10 nes-container with-title animate-fade-in-up">
        <p className="title font-pixel text-[9px]">QUICK ACCESS</p>
        <div className="grid sm:grid-cols-3 gap-6 pt-2">
          {quickLinks.map(({ href, label, icon, desc, nesBtnClass }, i) => (
            <Link
              key={href}
              href={href}
              className={`nes-btn ${nesBtnClass} !text-left !h-auto !py-4 !px-4 flex flex-col gap-2 animate-fade-in-up ${staggerClasses[i]} no-underline`}
            >
              <span className="text-xl">{icon}</span>
              <span className="font-pixel text-[9px] block leading-relaxed">
                {label}
              </span>
              <span className="font-pixel text-[8px] font-normal opacity-75 block normal-case">
                {desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
