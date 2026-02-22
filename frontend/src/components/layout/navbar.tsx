'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/button';

const navLinks = [
  { href: '/words', label: 'Words' },
  { href: '/radicals', label: 'Radicals' },
  { href: '/decks', label: 'Decks' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-surface-0/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-surface-900">
          <BookOpen className="h-5 w-5 text-accent-600" />
          <span>WxLingua</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname?.startsWith(l.href)
                  ? 'text-accent-600'
                  : 'text-surface-500 hover:text-surface-800',
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ButtonLink variant="ghost" size="sm" href="/login">Đăng nhập</ButtonLink>
          <ButtonLink size="sm" href="/register">Bắt đầu miễn phí</ButtonLink>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-surface-500 hover:text-surface-800 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-surface-100 bg-surface-0 px-4 py-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-surface-700"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-surface-100" />
          <ButtonLink variant="ghost" size="sm" href="/login">Đăng nhập</ButtonLink>
          <ButtonLink size="sm" href="/register">Bắt đầu miễn phí</ButtonLink>
        </div>
      )}
    </header>
  );
}
