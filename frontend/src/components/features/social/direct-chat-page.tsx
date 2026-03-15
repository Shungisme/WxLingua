"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { directMessagesApi, usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { PixelAvatar } from "@/components/features/chat/PixelAvatar";
import type { AxiosError } from "axios";

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}

interface DirectChatPageProps {
  userId: string;
}

export default function DirectChatPage({ userId }: DirectChatPageProps) {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["users", "profile", userId],
    queryFn: () => usersApi.getById(userId),
    enabled: Boolean(userId),
  });

  const conversationMutation = useMutation({
    mutationFn: () => directMessagesApi.getOrCreateConversation(userId),
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to open conversation"), "error");
    },
  });

  useEffect(() => {
    if (userId) {
      conversationMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const conversationId = conversationMutation.data?.id;

  const messagesQuery = useQuery({
    queryKey: ["direct-messages", "messages", conversationId],
    queryFn: () =>
      directMessagesApi.listMessages(conversationId as string, { limit: 50 }),
    enabled: Boolean(conversationId),
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      directMessagesApi.sendMessage(conversationId as string, message),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({
        queryKey: ["direct-messages", "messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["direct-messages", "conversations"],
      });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to send message"), "error");
    },
  });

  const orderedMessages = useMemo(
    () => [...(messagesQuery.data?.items || [])].reverse(),
    [messagesQuery.data?.items],
  );

  const canSend = content.trim().length > 0 && Boolean(conversationId);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="font-pixel text-sm text-surface-900">
            Chat with {profileQuery.data?.name || "User"}
          </h1>
          <p className="font-pixel text-[8px] text-surface-600 mt-2">
            Direct messages are saved and synced.
          </p>
        </div>

        <div className="nes-container is-rounded h-[420px] overflow-y-auto space-y-3">
          {messagesQuery.isLoading || conversationMutation.isPending ? (
            <p className="font-pixel text-[9px] text-surface-600">
              Loading messages...
            </p>
          ) : null}

          {orderedMessages.length === 0 && !messagesQuery.isLoading ? (
            <p className="font-pixel text-[9px] text-surface-600">
              No messages yet. Say hello.
            </p>
          ) : null}

          {orderedMessages.map((message) => {
            const isOwn = message.senderId === user?.id;
            const senderName = message.sender.name || "User";
            const timestamp = new Date(message.createdAt).toLocaleString();

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] flex gap-2 ${
                    isOwn ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <PixelAvatar
                    userId={message.senderId}
                    name={senderName}
                    avatarUrl={message.sender.avatar}
                  />
                  <div
                    className={`nes-balloon ${
                      isOwn ? "from-right chat-balloon-own" : "from-left"
                    }`}
                    title={timestamp}
                  >
                    <p className="font-pixel text-[9px] text-surface-900 whitespace-pre-wrap m-0">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="nes-container is-rounded flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                canSend &&
                !sendMessageMutation.isPending
              ) {
                sendMessageMutation.mutate(content.trim());
              }
            }}
          />
          <Button
            loading={sendMessageMutation.isPending}
            disabled={!canSend}
            onClick={() => sendMessageMutation.mutate(content.trim())}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
