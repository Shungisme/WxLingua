"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useChat";

// Pixel-art palette — one per avatar
const AVATAR_COLORS = [
  "#ea4c46", // red
  "#f7941d", // orange
  "#ffd700", // yellow
  "#7dc242", // green
  "#5b9bd5", // blue
  "#9b59b6", // purple
  "#e91e8c", // pink
  "#00bcd4", // cyan
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(username: string): string {
  return username
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function PixelAvatar({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const bg = getAvatarColor(userId);
  const initials = getInitials(username) || "?";
  return (
    <div
      className="shrink-0 w-8 h-8 border-[3px] border-black flex items-center justify-center"
      style={{ backgroundColor: bg }}
      title={username}
    >
      <span className="font-pixel text-[5px] text-white leading-none select-none">
        {initials}
      </span>
    </div>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn("flex gap-2 mb-3", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className="flex flex-col justify-end shrink-0">
        <PixelAvatar userId={message.userId} username={message.username} />
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {/* Username */}
        {!isOwn && (
          <span className="font-pixel text-[6px] leading-none truncate max-w-[140px] text-surface-500">
            {message.username}
          </span>
        )}

        {/* NES balloon bubble */}
        <div
          className={cn(
            "nes-balloon",
            isOwn ? "from-right chat-balloon-own" : "from-left",
          )}
        >
          <p className="text-[10px] leading-relaxed break-words max-w-[180px] m-0">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-[8px] text-surface-400 font-pixel leading-none">
          {time}
        </span>
      </div>
    </div>
  );
}
