"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", iconClass: "hn-home" },
  { href: "/chat", label: "Chat", iconClass: "hn-comment-dots" },
  { href: "/users", label: "Users", iconClass: "hn-users" },
  { href: "/decks", label: "Decks", iconClass: "hn-folder-open" },
  { href: "/dictionary", label: "Dictionary", iconClass: "hn-translate" },
  { href: "/radicals", label: "Radicals", iconClass: "hn-grid" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b-4 border-black">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px] text-accent-600 leading-none">
            Wx
          </span>
          <span className="font-pixel text-[10px] text-surface-900 leading-none">
            WxLingua
          </span>
          <i
            className="nes-icon heart"
            style={{ transform: "scale(0.45)", marginLeft: "2px" }}
          />
        </div>
        {onClose && (
          <Button
            variant="destructive"
            onClick={onClose}
            aria-label="Close menu"
          >
            <i className="hn hn-times text-xs" />
          </Button>
        )}
      </div>

      {/* User Menu */}
      <div className="p-3 border-b-4 border-black">
        <UserMenu />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {items.map(({ href, label, iconClass }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors border-l-4 no-underline",
                active
                  ? "border-black bg-accent-600 text-white font-semibold"
                  : "border-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 hover:border-black",
              )}
            >
              <i className={`hn ${iconClass} text-base shrink-0`} />
              <span className="font-pixel text-xs leading-relaxed">
                {label}
              </span>
              {active && (
                <span className="ml-auto font-pixel text-xs">
                  <i className="hn hn-play-solid"></i>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings button at bottom */}
      <div className="p-3 border-t-4 border-black">
        <SettingsDialog className="w-full justify-center" />
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r-4 border-black bg-surface-0 dark:bg-surface-0 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 !flex flex-col bg-surface-0 dark:bg-surface-0 border-r-4 border-black shadow-pixel md:hidden"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
