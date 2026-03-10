import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link, { type LinkProps } from "next/link";

const variants = {
  primary: "nes-btn is-primary",
  secondary: "nes-btn",
  ghost:
    "text-surface-600 hover:bg-surface-100 hover:text-surface-900 border-2 border-transparent transition-colors duration-150",
  destructive: "nes-btn is-error",
  outline: "nes-btn",
  warning: "nes-btn is-warning",
  success: "nes-btn is-success",
};

const sizes = {
  sm: "!py-1 !px-3 !text-[10px]",
  md: "",
  lg: "!py-3 !px-6 !text-xs",
};

const baseClass = (
  variant: keyof typeof variants,
  size: keyof typeof sizes,
  className?: string,
) =>
  cn(
    "inline-flex items-center justify-center gap-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    size !== "md" && sizes[size],
    className,
  );

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={baseClass(variant, size, className)}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

/** Link styled as a button */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkProps & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link className={baseClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
