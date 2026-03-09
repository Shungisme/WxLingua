"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-56 rounded-lg border border-surface-200 bg-surface-0 shadow-lg z-50",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "danger";
}

export function DropdownMenuItem({
  onClick,
  children,
  icon,
  variant = "default",
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
        variant === "default"
          ? "text-surface-700 hover:bg-surface-50"
          : "text-red-600 hover:bg-red-50",
      )}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <hr className="my-1 border-surface-100" />;
}
