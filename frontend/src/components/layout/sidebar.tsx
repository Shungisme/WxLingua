"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FolderOpen,
  BookMarked,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decks", label: "Study & Decks", icon: FolderOpen },
  { href: "/dictionary", label: "Dictionary", icon: Languages },
  { href: "/words", label: "Words", icon: BookOpen },
  { href: "/radicals", label: "Radicals", icon: Layers },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-surface-200 bg-surface-0 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-surface-100">
        <BookMarked className="h-5 w-5 text-accent-600" />
        <span className="font-semibold text-surface-900">WxLingua</span>
      </div>

      {/* User Menu */}
      <div className="p-3 border-b border-surface-100">
        <UserMenu />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-50 text-accent-700"
                  : "text-surface-500 hover:bg-surface-100 hover:text-surface-800",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
