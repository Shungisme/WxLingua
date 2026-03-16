"use client";

const AVATAR_COLORS = [
  "#ea4c46",
  "#f7941d",
  "#ffd700",
  "#7dc242",
  "#5b9bd5",
  "#9b59b6",
  "#e91e8c",
  "#00bcd4",
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface PixelAvatarProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export function PixelAvatar({
  userId,
  name,
  avatarUrl,
  className,
}: PixelAvatarProps) {
  const bg = getAvatarColor(userId);
  const initials = getInitials(name) || "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        className={`shrink-0 w-8 h-8 border-[3px] border-black object-cover pixelated ${className || ""}`}
      />
    );
  }

  return (
    <div
      className={`shrink-0 w-8 h-8 border-[3px] border-black flex items-center justify-center ${className || ""}`}
      style={{ backgroundColor: bg }}
      title={name}
    >
      <span className="font-pixel text-[5px] text-white leading-none select-none">
        {initials}
      </span>
    </div>
  );
}
