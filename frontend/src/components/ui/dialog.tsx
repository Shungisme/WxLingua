"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md mx-4",
          "bg-surface-0 rounded-2xl shadow-xl",
          "border border-surface-200",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-surface-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title && (
                  <h2
                    id="dialog-title"
                    className="text-lg font-semibold text-surface-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="dialog-description"
                    className="mt-1 text-sm text-surface-500"
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  "text-surface-400 hover:text-surface-600",
                  "hover:bg-surface-100",
                )}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogActions({ children, className }: DialogActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-4 mt-4",
        "border-t border-surface-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
