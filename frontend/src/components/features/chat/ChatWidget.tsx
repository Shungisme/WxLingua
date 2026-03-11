"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/hooks/useChat";
import { ChatBubble } from "./ChatBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const {
    messages,
    visibleMessages,
    sendMessage,
    isConnected,
    loadMore,
    hasMore,
    resetVisible,
  } = useChat(user);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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
            className="w-80 h-[480px] flex flex-col nes-container !p-0 !rounded-none bg-surface-0 shadow-[4px_4px_0_#0f172a]"
          >
            {/* Header */}
            <div className="flex items-center justify-end border-b-4 border-black bg-accent-600">
              <div className="flex flex-1 items-center gap-2 p-3">
                {/* Online indicator */}
                <span
                  className={`inline-block w-2 h-2 border-2 border-black ${isConnected ? "bg-green-400" : "bg-surface-400"}`}
                />
                <span className="font-pixel text-[8px] text-white leading-none tracking-wide">
                  Community Chat
                </span>
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
            ) : (
              <>
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
