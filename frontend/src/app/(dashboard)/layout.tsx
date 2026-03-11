"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/features/chat/ChatWidget";

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
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b-4 border-black bg-surface-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors border-2 border-transparent hover:border-black"
            aria-label="Open menu"
          >
            <i className="hn hn-bars text-xl" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-accent-600 leading-none">
              Wx
            </span>
            <span className="font-pixel text-[10px] text-surface-900">
              WxLingua
            </span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-auto bg-surface-50 bg-dot-grid-wrap">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
