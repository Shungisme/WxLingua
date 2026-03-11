"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" />

      {/* Dialog Content */}
      <div
        className={cn(
          "nes-container with-title relative z-10 w-full max-w-md bg-surface-0",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
      >
        {title && (
          <p className="title font-pixel text-[9px]" id="dialog-title">
            {title}
          </p>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="nes-btn is-error absolute top-3 right-3 !py-0.5 !px-2 !text-[9px]"
          aria-label="Đóng"
        >
          ✕
        </button>

        {/* Description */}
        {description && (
          <p
            id="dialog-description"
            className="font-pixel text-[8px] text-surface-500 mb-4 -mt-2"
          >
            {description}
          </p>
        )}

        {/* Content */}
        <div>{children}</div>
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
        "border-t-4 border-black",
        className,
      )}
    >
      {children}
    </div>
  );
}
