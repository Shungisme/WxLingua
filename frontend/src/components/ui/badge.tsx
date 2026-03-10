import { cn } from "@/lib/utils";

const variants = {
  default: "bg-surface-100 text-surface-600",
  accent: "bg-accent-100 text-accent-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

interface BadgeProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none font-pixel tracking-wide border",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Level-specific badge with auto colour */
export function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;
  const map: Record<string, BadgeProps["variant"]> = {
    A1: "green",
    A2: "green",
    B1: "accent",
    B2: "accent",
    N5: "green",
    N4: "green",
    N3: "accent",
    N2: "amber",
    N1: "red",
  };
  return <Badge variant={map[level] ?? "default"}>{level}</Badge>;
}
