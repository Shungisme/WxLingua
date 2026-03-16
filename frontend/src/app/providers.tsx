"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";
import { Toaster } from "@/components/ui/toaster";
import { UiSettingsProvider } from "@/contexts/ui-settings-context";
import { FloatingHearts } from "@/components/ui/floating-hearts";
import { SnowfallOverlay } from "@/components/ui/snowfall-overlay";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <UiSettingsProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
            <SnowfallOverlay />
            <FloatingHearts />
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </UiSettingsProvider>
    </QueryClientProvider>
  );
}
