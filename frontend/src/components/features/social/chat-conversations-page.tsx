"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { directMessagesApi, friendsApi } from "@/lib/api";
import { useDebounce } from "@/hooks";
import { PixelAvatar } from "@/components/features/chat/PixelAvatar";
import type { AxiosError } from "axios";
import type { Conversation } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}

function getConversationTitle(
  conversation: Conversation,
  currentUserId?: string,
) {
  if (conversation.isGroup) {
    if (conversation.name?.trim()) {
      return conversation.name;
    }
    return "Unnamed Group";
  }

  const others = conversation.participants.filter(
    (p) => p.id !== currentUserId,
  );
  if (others.length === 0) {
    return "Direct Chat";
  }

  return others.map((p) => p.name || p.email || "User").join(", ");
}

export default function ChatConversationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [selectedFriendMap, setSelectedFriendMap] = useState<
    Record<string, { id: string; name: string | null; email?: string }>
  >({});
  const [friendSearch, setFriendSearch] = useState("");
  const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false);
  const friendDropdownListRef = useRef<HTMLDivElement>(null);

  const debouncedFriendSearch = useDebounce(friendSearch.trim(), 300);

  const conversationsQuery = useInfiniteQuery({
    queryKey: ["direct-messages", "conversations", debouncedSearch],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      directMessagesApi.listConversations({
        limit: 20,
        cursorId: pageParam,
        q: debouncedSearch || undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const conversations = useMemo(
    () => conversationsQuery.data?.pages.flatMap((page) => page.items) || [],
    [conversationsQuery.data?.pages],
  );

  useEffect(() => {
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
  }, [conversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const messagesQuery = useQuery({
    queryKey: ["direct-messages", "messages", selectedConversationId],
    queryFn: () =>
      directMessagesApi.listMessages(selectedConversationId as string, {
        limit: 50,
      }),
    enabled: Boolean(selectedConversationId),
    refetchInterval: 3000,
  });

  const [messageInput, setMessageInput] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      directMessagesApi.sendMessage(selectedConversationId as string, content),
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({
        queryKey: ["direct-messages", "messages", selectedConversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["direct-messages", "conversations"],
      });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to send message"), "error");
    },
  });

  const friendsQuery = useInfiniteQuery({
    queryKey: ["friends", "list", "create-group", debouncedFriendSearch],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      friendsApi.listFriends({
        limit: 20,
        cursorId: pageParam,
        q: debouncedFriendSearch || undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isCreateGroupOpen,
  });

  const friendItems = useMemo(
    () => friendsQuery.data?.pages.flatMap((page) => page.items) || [],
    [friendsQuery.data?.pages],
  );

  const selectedFriends = useMemo(
    () =>
      selectedFriendIds
        .map((id) => selectedFriendMap[id])
        .filter((friend): friend is NonNullable<typeof friend> =>
          Boolean(friend),
        ),
    [selectedFriendIds, selectedFriendMap],
  );

  const handleFriendDropdownScroll = () => {
    const container = friendDropdownListRef.current;
    if (
      !container ||
      !friendsQuery.hasNextPage ||
      friendsQuery.isFetchingNextPage
    ) {
      return;
    }

    const threshold = 40;
    const atBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - threshold;

    if (atBottom) {
      friendsQuery.fetchNextPage();
    }
  };

  const createGroupMutation = useMutation({
    mutationFn: () =>
      directMessagesApi.createGroupConversation({
        name: groupName.trim(),
        avatar: groupAvatar.trim() || undefined,
        participantIds: selectedFriendIds,
      }),
    onSuccess: (created) => {
      setIsCreateGroupOpen(false);
      setGroupName("");
      setGroupAvatar("");
      setSelectedFriendIds([]);
      setSelectedFriendMap({});
      setFriendSearch("");
      setIsFriendDropdownOpen(false);
      setSelectedConversationId(created.id);
      queryClient.invalidateQueries({
        queryKey: ["direct-messages", "conversations"],
      });
      toast("Group conversation created", "success");
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to create group"), "error");
    },
  });

  const canCreateGroup =
    groupName.trim().length > 0 && selectedFriendIds.length >= 2;
  const canSendMessage =
    messageInput.trim().length > 0 && Boolean(selectedConversationId);
  const orderedMessages = [...(messagesQuery.data?.items || [])].reverse();

  return (
    <div className="h-full px-4 sm:px-6 py-4 sm:py-6 overflow-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 min-h-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-pixel text-sm text-surface-900">Chat</h1>
            <p className="font-pixel text-[8px] text-surface-600 mt-2">
              Browse conversations, search by group or participant, and start
              group chats.
            </p>
          </div>
          <Button size="sm" onClick={() => setIsCreateGroupOpen(true)}>
            <i className="hn hn-plus text-base mr-1.5" />
            New Group
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 flex-1 min-h-0">
          <section className="nes-container is-rounded space-y-3 min-h-0 overflow-hidden !flex !flex-col">
            <div>
              {" "}
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by conversation or participant"
                className="!text-[8px]"
              />
            </div>

            <div className="space-y-2 overflow-y-auto pr-1 min-h-0 flex-1">
              {conversations.map((conversation) => {
                const active = selectedConversationId === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={[
                      "w-full text-left border-2 px-3 py-2 transition-colors",
                      active
                        ? "border-black bg-accent-100"
                        : "border-surface-300 hover:border-black bg-surface-0",
                    ].join(" ")}
                  >
                    <p className="font-pixel text-[8px] text-surface-900 truncate">
                      {getConversationTitle(conversation, user?.id)}
                    </p>
                    <p className="font-pixel text-[7px] text-surface-500 mt-1 truncate">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </p>
                  </button>
                );
              })}

              {!conversationsQuery.isLoading && conversations.length === 0 ? (
                <p className="font-pixel text-[8px] text-surface-500">
                  No conversations found.
                </p>
              ) : null}

              {conversationsQuery.hasNextPage ? (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={conversationsQuery.isFetchingNextPage}
                  onClick={() => conversationsQuery.fetchNextPage()}
                >
                  Load More
                </Button>
              ) : null}
            </div>
          </section>

          <section className="nes-container is-rounded !flex flex-col min-h-0 overflow-hidden">
            <div className="pb-3 border-b border-surface-200">
              <h2 className="font-pixel text-[9px] text-surface-900">
                {selectedConversation
                  ? getConversationTitle(selectedConversation, user?.id)
                  : "Select a conversation"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0">
              {orderedMessages.length === 0 && !messagesQuery.isLoading ? (
                <p className="font-pixel text-[8px] text-surface-500">
                  No messages yet.
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
                      className={`max-w-[78%] flex gap-2 ${
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
                        <p className="font-pixel text-[8px] text-surface-900 whitespace-pre-wrap m-0">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-surface-200 flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    canSendMessage &&
                    !sendMessageMutation.isPending
                  ) {
                    sendMessageMutation.mutate(messageInput.trim());
                  }
                }}
              />
              <Button
                loading={sendMessageMutation.isPending}
                disabled={!canSendMessage}
                onClick={() => sendMessageMutation.mutate(messageInput.trim())}
                className="!py-1 !px-3 shrink-0"
              >
                <i className="hn hn-play-solid"></i>
              </Button>
            </div>
          </section>
        </div>
      </div>

      <Dialog
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        title="Create Group Chat"
        description="Select at least 2 friends to form a group with you"
        className="max-w-2xl"
      >
        <div className="space-y-3">
          <div>
            <label className="font-pixel text-[8px] text-surface-700 block mb-1">
              Group Name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="HSK Team Study"
            />
          </div>

          <div>
            <label className="font-pixel text-[8px] text-surface-700 block mb-1">
              Avatar URL (optional)
            </label>
            <Input
              value={groupAvatar}
              onChange={(e) => setGroupAvatar(e.target.value)}
              placeholder="https://example.com/group.png"
            />
          </div>

          <div>
            <p className="font-pixel text-[8px] text-surface-700 mb-2">
              Friends
            </p>
            <div className="relative">
              <Input
                value={friendSearch}
                onChange={(e) => {
                  setFriendSearch(e.target.value);
                  setIsFriendDropdownOpen(true);
                }}
                onFocus={() => setIsFriendDropdownOpen(true)}
                placeholder="Search friends to add"
              />

              {isFriendDropdownOpen ? (
                <div className="absolute z-20 mt-1 w-full border-2 border-black bg-surface-0 max-h-56 overflow-y-auto p-2 space-y-2">
                  <div
                    ref={friendDropdownListRef}
                    className="max-h-48 overflow-y-auto space-y-2 pr-1"
                    onScroll={handleFriendDropdownScroll}
                  >
                    {friendItems.map((item) => {
                      const friendId = item.friend.id;
                      const checked = selectedFriendIds.includes(friendId);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={[
                            "w-full text-left border-2 px-2 py-2",
                            checked
                              ? "border-black bg-accent-100"
                              : "border-surface-300 bg-surface-0 hover:border-black",
                          ].join(" ")}
                          onClick={() => {
                            setSelectedFriendIds((prev) => {
                              if (prev.includes(friendId)) {
                                const nextIds = prev.filter(
                                  (id) => id !== friendId,
                                );
                                setSelectedFriendMap((current) => {
                                  const nextMap = { ...current };
                                  delete nextMap[friendId];
                                  return nextMap;
                                });
                                return nextIds;
                              }

                              setSelectedFriendMap((current) => ({
                                ...current,
                                [friendId]: {
                                  id: item.friend.id,
                                  name: item.friend.name,
                                  email: item.friend.email,
                                },
                              }));
                              return [...prev, friendId];
                            });
                          }}
                        >
                          <p className="font-pixel text-[8px] text-surface-900">
                            {item.friend.name || item.friend.email || "User"}
                          </p>
                          <p className="font-pixel text-[7px] text-surface-500 mt-1 truncate">
                            {item.friend.email}
                          </p>
                        </button>
                      );
                    })}

                    {!friendsQuery.isLoading && friendItems.length === 0 ? (
                      <p className="font-pixel text-[8px] text-surface-500">
                        No friends found.
                      </p>
                    ) : null}

                    {friendsQuery.isFetchingNextPage ? (
                      <p className="font-pixel text-[8px] text-surface-500">
                        Loading more...
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-2 mt-2 border-t border-surface-300 flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsFriendDropdownOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            {selectedFriends.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedFriends.map((friend) => (
                  <span
                    key={friend.id}
                    className="inline-flex items-center gap-2 border-2 border-black bg-accent-100 px-2 py-1"
                  >
                    <span className="font-pixel text-[7px] text-surface-900">
                      {friend.name || friend.email || "User"}
                    </span>
                    <button
                      type="button"
                      className="font-pixel text-[7px] text-surface-700"
                      onClick={() => {
                        setSelectedFriendIds((prev) =>
                          prev.filter((id) => id !== friend.id),
                        );
                        setSelectedFriendMap((current) => {
                          const nextMap = { ...current };
                          delete nextMap[friend.id];
                          return nextMap;
                        });
                      }}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <DialogActions>
          <Button
            variant="secondary"
            onClick={() => setIsCreateGroupOpen(false)}
            className="!text-[8px]"
          >
            Cancel
          </Button>
          <Button
            loading={createGroupMutation.isPending}
            disabled={!canCreateGroup}
            onClick={() => createGroupMutation.mutate()}
            className="!text-[8px]"
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
