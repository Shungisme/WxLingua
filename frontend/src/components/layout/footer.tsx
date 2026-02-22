import Link from 'next/link';
import { BookMarked } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-0">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-surface-600">
          <BookMarked className="h-4 w-4 text-accent-600" />
          <span className="text-sm font-medium">WxLingua</span>
          <span className="text-surface-300">·</span>
          <span className="text-xs text-surface-400">by Vòng Hùng (Wang Xiu Xiong)</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-surface-400">
          <Link href="/words" className="hover:text-surface-600 transition-colors">Từ vựng</Link>
          <Link href="/radicals" className="hover:text-surface-600 transition-colors">Bộ thủ</Link>
          <Link href="/decks" className="hover:text-surface-600 transition-colors">Bộ thẻ</Link>
        </div>
        <p className="text-xs text-surface-300">&copy; {new Date().getFullYear()} WxLingua</p>
      </div>
    </footer>
  );
}
