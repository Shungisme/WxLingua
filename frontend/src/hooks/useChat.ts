"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { User } from "@/types";

// Strip the /api suffix from the REST API URL to get the bare WebSocket base.
// NEXT_PUBLIC_API_URL is e.g. "http://localhost:3000/api" → we need "http://localhost:3000"
// so the socket.io namespace becomes /chat (not /api/chat).
const BACKEND_WS_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").replace(
    /\/$/,
    "",
  ) ?? "http://localhost:3000";

const PAGE_SIZE = 20;

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string | null;
  content: string;
  createdAt: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  visibleMessages: ChatMessage[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
  loadMore: () => void;
  hasMore: boolean;
  resetVisible: () => void;
}

export function useChat(user: User | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Guard: only connect when logged in and running in browser
    if (!user || typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socket = io(`${BACKEND_WS_URL}/chat`, {
      auth: { token },
      // Allow polling → websocket upgrade (default). Forcing websocket-only
      // skips the HTTP handshake and breaks in many environments.
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("chat:history", (history: ChatMessage[]) => {
      setMessages(history);
      // Start with the last PAGE_SIZE messages visible
      setVisibleCount(PAGE_SIZE);
    });

    socket.on("chat:message", (msg: ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev, msg];
        // Keep local buffer in sync with server cap
        return next.length > 100 ? next.slice(next.length - 100) : next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setMessages([]);
    };
    // Re-connect whenever the logged-in user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit("chat:send", { content });
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, messages.length));
  }, [messages.length]);

  const resetVisible = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  // visibleMessages: show the LAST visibleCount messages (newest at end)
  const visibleMessages = messages.slice(
    Math.max(0, messages.length - visibleCount),
  );

  return {
    messages,
    visibleMessages,
    sendMessage,
    isConnected,
    loadMore,
    hasMore: visibleCount < messages.length,
    resetVisible,
  };
}
