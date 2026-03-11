"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToast, type ToastVariant } from "@/contexts/toast-context";

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: string; borderClass: string; bgClass: string; textClass: string }
> = {
  success: {
    icon: "hn-check-circle",
    borderClass: "border-green-600",
    bgClass: "bg-green-50 dark:bg-green-950",
    textClass: "text-green-800 dark:text-green-200",
  },
  error: {
    icon: "hn-x-circle",
    borderClass: "border-red-600",
    bgClass: "bg-red-50 dark:bg-red-950",
    textClass: "text-red-800 dark:text-red-200",
  },
  warning: {
    icon: "hn-warning-triangle",
    borderClass: "border-yellow-500",
    bgClass: "bg-yellow-50 dark:bg-yellow-950",
    textClass: "text-yellow-800 dark:text-yellow-200",
  },
  info: {
    icon: "hn-info-circle",
    borderClass: "border-accent-600",
    bgClass: "bg-accent-50 dark:bg-accent-50",
    textClass: "text-accent-700 dark:text-accent-700",
  },
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const cfg = VARIANT_CONFIG[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 48, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.92 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={[
                "pointer-events-auto",
                "flex items-start gap-3",
                "min-w-[220px] max-w-[320px]",
                "px-4 py-3",
                "border-2 pixel-box",
                cfg.borderClass,
                cfg.bgClass,
              ].join(" ")}
            >
              {/* Icon */}
              <i
                className={`hn ${cfg.icon} text-lg mt-0.5 flex-shrink-0 ${cfg.textClass}`}
              />

              {/* Message */}
              <span
                className={`font-pixel text-[8px] leading-relaxed flex-1 ${cfg.textClass}`}
              >
                {t.message}
              </span>

              {/* Dismiss button */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className={`flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity ${cfg.textClass}`}
              >
                <i className="hn hn-x text-xs" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
