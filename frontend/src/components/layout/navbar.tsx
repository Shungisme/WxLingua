"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

const navLinks = [
  { href: "/dictionary", label: "Dictionary" },
  { href: "/radicals", label: "Radicals" },
  { href: "/decks", label: "Decks" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-surface-0 dark:bg-surface-0">
      <nav className="!flex mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-pixel text-[10px] text-accent-600 leading-none tracking-tight">
            Wx
          </span>
          <span className="font-pixel text-[10px] text-surface-900 dark:text-white leading-none">
            WxLingua
          </span>
          {/* NES heart icon */}
          <i
            className="nes-icon heart is-small ml-1"
            style={{ transform: "scale(0.6)" }}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "font-pixel text-[9px] px-3 py-2 border-2 transition-colors no-underline",
                pathname?.startsWith(l.href)
                  ? "border-black bg-accent-600 text-white"
                  : "border-transparent text-surface-600 dark:text-white hover:border-black hover:text-surface-900 dark:hover:text-white hover:bg-surface-100",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <SettingsDialog />
          <ButtonLink variant="secondary" size="sm" href="/login">
            Log in
          </ButtonLink>
          <ButtonLink size="sm" href="/register">
            Start free
          </ButtonLink>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-surface-500 dark:text-white hover:text-surface-900 dark:hover:text-white transition-colors border-2 border-transparent hover:border-black"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <i className="hn hn-times text-xl" />
          ) : (
            <i className="hn hn-bars text-xl" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t-4 border-black bg-surface-0"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-pixel text-[9px] text-surface-700 dark:text-white hover:text-accent-600 transition-colors no-underline"
                  onClick={() => setOpen(false)}
                >
                  &gt; {l.label}
                </Link>
              ))}
              <hr className="border-2 border-black" />
              <SettingsDialog />
              <ButtonLink variant="ghost" size="sm" href="/login">
                Log in
              </ButtonLink>
              <ButtonLink size="sm" href="/register">
                Start free
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
