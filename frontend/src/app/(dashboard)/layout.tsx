"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/features/chat/ChatWidget";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="flex md:hidden sticky top-0 z-30 items-center justify-between px-4 py-3 border-b-4 border-black bg-surface-0">
          <Button
            variant="secondary"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors border-2 border-transparent hover:border-black"
            aria-label="Open menu"
          >
            <i className="hn hn-bars text-xl" />
          </Button>
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
