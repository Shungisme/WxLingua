"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Menu, BookMarked } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-surface-200 bg-surface-0/90 backdrop-blur-sm">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-accent-600" />
            <span className="font-semibold text-surface-900">WxLingua</span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-auto bg-surface-50">{children}</main>
      </div>
    </div>
  );
}
