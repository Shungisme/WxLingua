"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useChat";
import { PixelAvatar } from "./PixelAvatar";

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const timestamp = new Date(message.createdAt).toLocaleString();

  return (
    <div
      className={cn("flex gap-2 mb-3", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className="flex flex-col justify-end shrink-0">
        <PixelAvatar
          userId={message.userId}
          name={message.username}
          avatarUrl={message.avatar}
        />
      </div>

      {/* Content */}
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {/* NES balloon bubble */}
        <div
          className={cn(
            "nes-balloon",
            isOwn ? "from-right chat-balloon-own" : "from-left",
          )}
          title={timestamp}
        >
          <p className="text-[10px] leading-relaxed break-words max-w-[180px] m-0">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
