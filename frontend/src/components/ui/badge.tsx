import { cn } from "@/lib/utils";

const variants = {
  default: "is-dark",
  accent: "is-primary",
  green: "is-success",
  amber: "is-warning",
  red: "is-error",
};

const sizes = {
  sm: "!text-[7px]",
  md: "!text-[9px]",
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
    <span className={cn("nes-badge font-pixel", sizes[size], className)}>
      <span className={variants[variant]}>{children}</span>
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
