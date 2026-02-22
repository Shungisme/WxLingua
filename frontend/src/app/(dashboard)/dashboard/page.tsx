import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { StatsWidget } from '@/components/features/stats-widget';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Zap, BookOpen, FolderOpen } from 'lucide-react';

export const metadata: Metadata = { title: 'Tổng quan' };

const quickLinks = [
  { href: '/study', label: 'Học ngay', icon: Zap, desc: 'Ôn các thẻ đến hạn' },
  { href: '/words', label: 'Từ vựng', icon: BookOpen, desc: 'Duyệt toàn bộ từ điển' },
  { href: '/decks', label: 'Bộ thẻ', icon: FolderOpen, desc: 'Quản lý bộ thẻ của bạn' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Tổng quan</h1>
      <p className="text-sm text-surface-400 mb-8">Theo dõi tiến độ học tập của bạn.</p>

      <Suspense fallback={<div className="grid grid-cols-3 gap-4"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" /></div>}>
        <StatsWidget />
      </Suspense>

      <h2 className="text-lg font-semibold text-surface-800 mt-10 mb-4">Truy cập nhanh</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-surface-200 bg-surface-0 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2"
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
