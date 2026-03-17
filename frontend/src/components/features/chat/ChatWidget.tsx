"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/hooks/useChat";
import { ChatBubble } from "./ChatBubble";
import { PixelAvatar } from "./PixelAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { directMessagesApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import type { Conversation } from "@/types";

type WidgetTab = "community" | "direct";

function getConversationTitle(
  conversation: Conversation,
  currentUserId?: string,
) {
  if (conversation.isGroup) {
    return conversation.name?.trim() || "Unnamed Group";
  }

  const others = conversation.participants.filter(
    (p) => p.id !== currentUserId,
  );
  if (others.length === 0) {
    return "Direct Chat";
  }

  return others.map((p) => p.name || p.email || "User").join(", ");
}

export function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WidgetTab>("community");
  const [input, setInput] = useState("");
  const [directSearch, setDirectSearch] = useState("");
  const [directInput, setDirectInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const {
    messages,
    visibleMessages,
    sendMessage,
    isConnected,
    loadMore,
    hasMore,
    resetVisible,
  } = useChat(user);
  const queryClient = useQueryClient();
  const debouncedDirectSearch = useDebounce(directSearch.trim(), 300);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const directMessagesEndRef = useRef<HTMLDivElement>(null);
  const directMessagesContainerRef = useRef<HTMLDivElement>(null);
  // Track whether we're mid-load to avoid triggering loadMore multiple times
  const isLoadingMoreRef = useRef(false);

  // When panel opens: reset to last PAGE_SIZE messages and instantly jump to bottom
  useEffect(() => {
    if (!isOpen) return;
    resetVisible();
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });
  }, [isOpen, resetVisible]);

  // When new messages arrive: smooth-scroll to bottom only if user is already near the bottom.
  // Uses messages.length (not visibleMessages.length which stays constant at PAGE_SIZE).
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return; // panel is closed
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 120) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const conversationsQuery = useQuery({
    queryKey: [
      "direct-messages",
      "conversations",
      "widget",
      debouncedDirectSearch,
    ],
    queryFn: () =>
      directMessagesApi.listConversations({
        limit: 20,
        q: debouncedDirectSearch || undefined,
      }),
    enabled: isAuthenticated && isOpen && activeTab === "direct",
    refetchInterval: 5000,
  });

  const conversations = conversationsQuery.data?.items || [];

  useEffect(() => {
    if (activeTab !== "direct") {
      return;
    }

    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
      return;
    }

    if (
      selectedConversationId &&
      conversations.length > 0 &&
      !conversations.some((c) => c.id === selectedConversationId)
    ) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [activeTab, conversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const directMessagesQuery = useQuery({
    queryKey: ["direct-messages", "messages", "widget", selectedConversationId],
    queryFn: () =>
      directMessagesApi.listMessages(selectedConversationId as string, {
        limit: 50,
      }),
    enabled:
      isAuthenticated &&
      isOpen &&
      activeTab === "direct" &&
      Boolean(selectedConversationId),
    refetchInterval: 3000,
  });

  const orderedDirectMessages = useMemo(
    () => [...(directMessagesQuery.data?.items || [])].reverse(),
    [directMessagesQuery.data?.items],
  );

  useEffect(() => {
    if (activeTab !== "direct") {
      return;
    }

    const container = directMessagesContainerRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 120) {
      directMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, orderedDirectMessages.length]);

  const sendDirectMessageMutation = useMutation({
    mutationFn: (content: string) =>
      directMessagesApi.sendMessage(selectedConversationId as string, content),
    onSuccess: () => {
      setDirectInput("");
      queryClient.invalidateQueries({
        queryKey: [
          "direct-messages",
          "messages",
          "widget",
          selectedConversationId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["direct-messages", "conversations"],
      });
    },
  });

  // Infinity scroll: listen to scroll on the messages container.
  // When user scrolls near the top (scrollTop < 80px) load the previous page.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      if (container.scrollTop < 80 && hasMore && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        // Save distance from bottom so we can restore it after DOM updates
        const scrollBottom = container.scrollHeight - container.scrollTop;
        loadMore();
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - scrollBottom;
          isLoadingMoreRef.current = false;
        });
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen, hasMore, loadMore]);

  const handleSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || !isConnected) return;
      sendMessage(trimmed);
      setInput("");
    },
    [input, isConnected, sendMessage],
  );

  const handleDirectSend = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = directInput.trim();
      if (!trimmed || !selectedConversationId) {
        return;
      }
      sendDirectMessageMutation.mutate(trimmed);
    },
    [directInput, selectedConversationId, sendDirectMessageMutation],
  );

  const canSendDirect =
    Boolean(selectedConversationId) && directInput.trim().length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-[500px] w-[760px] max-w-[calc(100vw-1.5rem)] flex flex-col nes-container !p-0 !rounded-none bg-surface-0 shadow-[4px_4px_0_#0f172a]"
          >
            {/* Header */}
            <div className="flex flex-col border-b-4 border-black bg-accent-600">
              <div className="flex items-center justify-end">
                <div className="flex flex-1 items-center p-3">
                  <div className="inline-flex items-center gap-2 border-2 border-black bg-surface-50 px-2 py-1">
                    <span
                      className={cn(
                        "inline-block h-2 w-2 border border-black",
                        isConnected ? "bg-green-400" : "bg-surface-400",
                      )}
                    />
                    <span className="font-pixel text-[7px] leading-none text-surface-700">
                      {isConnected ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  variant="destructive"
                  className="scale-40"
                >
                  <i className="hn hn-times text-xl" />
                </Button>
              </div>

              <div className="px-2 pb-0">
                <div className="nes-tabs w-full">
                  <button
                    type="button"
                    className={cn(
                      "nes-tabs__tab",
                      activeTab === "community" && "is-active",
                    )}
                    onClick={() => setActiveTab("community")}
                  >
                    Community
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "nes-tabs__tab",
                      activeTab === "direct" && "is-active",
                    )}
                    onClick={() => setActiveTab("direct")}
                  >
                    Direct
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            {!isAuthenticated ? (
              /* Guest gate */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <i className="nes-icon trophy is-medium" aria-hidden="true" />
                <p className="font-pixel text-[8px] leading-relaxed text-surface-700">
                  LOGIN TO JOIN THE CHAT
                </p>
                <a href="/login" className="nes-btn is-primary !text-[8px]">
                  LOGIN
                </a>
              </div>
            ) : activeTab === "community" ? (
              <div className="flex-1 w-full flex flex-col border-x-4 border-black">
                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-3 py-2 flex flex-col"
                >
                  {/* Load-more indicator at top */}
                  {hasMore && (
                    <div className="flex justify-center py-1">
                      <span className="font-pixel text-[6px] text-surface-400">
                        ↑ SCROLL UP FOR MORE
                      </span>
                    </div>
                  )}

                  {visibleMessages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="font-pixel text-[7px] text-surface-400 text-center leading-relaxed">
                        NO MESSAGES YET.
                        <br />
                        SAY HELLO!
                      </p>
                    </div>
                  ) : (
                    visibleMessages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.userId === user?.id}
                      />
                    ))
                  )}

                  {/* Auto-scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <form
                  onSubmit={handleSend}
                  className="flex gap-2 px-3 py-3 border-t-4 border-black bg-surface-50"
                >
                  <Input
                    type="text"
                    className="!text-[9px] flex-1 !py-1"
                    placeholder={
                      isConnected ? "Type a message..." : "Connecting..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={500}
                    disabled={!isConnected}
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    disabled={!isConnected || !input.trim()}
                    className="!py-1 !px-3 shrink-0"
                  >
                    <i className="hn hn-play-solid"></i>
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-0 flex">
                  <section className="min-w-0 flex-1 !flex flex-col border-r-4 border-black">
                    <div className="px-3 py-2 border-b-2 border-black bg-surface-50">
                      <p className="font-pixel text-[7px] text-surface-700 truncate">
                        {selectedConversation
                          ? getConversationTitle(selectedConversation, user?.id)
                          : "Select a conversation"}
                      </p>
                    </div>

                    <div
                      ref={directMessagesContainerRef}
                      className="flex-1 overflow-y-auto px-3 py-2 flex flex-col"
                    >
                      {orderedDirectMessages.length === 0 &&
                      !directMessagesQuery.isLoading ? (
                        <p className="font-pixel text-[7px] text-surface-500 text-center">
                          No messages yet.
                        </p>
                      ) : null}

                      {orderedDirectMessages.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        const senderName = msg.sender.name || "User";
                        const timestamp = new Date(
                          msg.createdAt,
                        ).toLocaleString();
                        return (
                          <div
                            key={msg.id}
                            className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex gap-2 max-w-[84%] ${
                                isOwn ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <PixelAvatar
                                userId={msg.senderId}
                                name={senderName}
                                avatarUrl={msg.sender.avatar}
                              />
                              <div
                                className={`nes-balloon ${
                                  isOwn
                                    ? "from-right chat-balloon-own"
                                    : "from-left"
                                }`}
                                title={timestamp}
                              >
                                <p className="font-pixel text-[7px] whitespace-pre-wrap m-0">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div ref={directMessagesEndRef} />
                    </div>

                    <form
                      onSubmit={handleDirectSend}
                      className="flex gap-2 px-3 py-3 border-t-4 border-black bg-surface-50"
                    >
                      <Input
                        type="text"
                        className="!text-[9px] flex-1 !py-1"
                        placeholder={
                          selectedConversationId
                            ? "Type a message..."
                            : "Select a conversation"
                        }
                        value={directInput}
                        onChange={(e) => setDirectInput(e.target.value)}
                        maxLength={500}
                        disabled={!selectedConversationId}
                        autoComplete="off"
                      />
                      <Button
                        type="submit"
                        disabled={
                          !canSendDirect || sendDirectMessageMutation.isPending
                        }
                        className="!py-1 !px-3 shrink-0"
                      >
                        <i className="hn hn-play-solid"></i>
                      </Button>
                    </form>
                  </section>

                  <aside className="w-[260px] shrink-0 flex flex-col bg-surface-50">
                    <div className="px-3 py-2 border-b-2 border-black bg-surface-100">
                      <Input
                        value={directSearch}
                        onChange={(e) => setDirectSearch(e.target.value)}
                        placeholder="Search chats"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {conversations.map((conversation) => {
                        const active =
                          selectedConversationId === conversation.id;
                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() =>
                              setSelectedConversationId(conversation.id)
                            }
                            className={[
                              "w-full text-left border-2 px-2 py-2",
                              active
                                ? "border-black bg-accent-100"
                                : "border-surface-300 bg-surface-0",
                            ].join(" ")}
                          >
                            <p className="font-pixel text-[7px] text-surface-900 truncate">
                              {getConversationTitle(conversation, user?.id)}
                            </p>
                            <p className="font-pixel text-[6px] text-surface-500 truncate mt-1">
                              {conversation.lastMessage?.content ||
                                "No messages yet"}
                            </p>
                          </button>
                        );
                      })}

                      {!conversationsQuery.isLoading &&
                      conversations.length === 0 ? (
                        <p className="font-pixel text-[7px] text-surface-500">
                          No conversations
                        </p>
                      ) : null}
                    </div>
                  </aside>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <Button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close community chat" : "Open community chat"}
      >
        <i className="hn hn-comment-dots-solid" aria-hidden="true" />
      </Button>
    </div>
  );
}
