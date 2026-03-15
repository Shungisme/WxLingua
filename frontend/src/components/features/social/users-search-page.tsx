"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendsApi, usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { useDebounce } from "@/hooks";

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}

function getRelationshipLabel(status?: string): string {
  switch (status) {
    case "friend":
      return "Friend";
    case "outgoing_pending":
      return "Request Sent";
    case "incoming_pending":
      return "Incoming Request";
    case "self":
      return "You";
    default:
      return "Not Connected";
  }
}

type FriendsTab = "friends" | "incoming" | "outgoing";

export default function UsersSearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FriendsTab>("friends");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const debouncedQuery = useDebounce(trimmedQuery, 400);

  const searchQuery = useQuery({
    queryKey: ["users", "search", debouncedQuery],
    queryFn: () => usersApi.search({ q: debouncedQuery, limit: 30 }),
    enabled: debouncedQuery.length >= 2,
  });

  const friendsQuery = useQuery({
    queryKey: ["friends", "list"],
    queryFn: () => friendsApi.listFriends({ limit: 50 }),
  });

  const incomingQuery = useQuery({
    queryKey: ["friends", "incoming"],
    queryFn: () => friendsApi.listIncoming({ limit: 50 }),
  });

  const outgoingQuery = useQuery({
    queryKey: ["friends", "outgoing"],
    queryFn: () => friendsApi.listOutgoing({ limit: 50 }),
  });

  const refreshSocialData = () => {
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => friendsApi.sendRequest(targetUserId),
    onSuccess: () => {
      toast("Friend request sent", "success");
      refreshSocialData();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to send request"), "error");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.acceptRequest(requestId),
    onSuccess: () => {
      toast("Friend request accepted", "success");
      refreshSocialData();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to accept request"), "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.rejectRequest(requestId),
    onSuccess: () => {
      toast("Friend request rejected", "info");
      refreshSocialData();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to reject request"), "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.cancelRequest(requestId),
    onSuccess: () => {
      toast("Friend request canceled", "info");
      refreshSocialData();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to cancel request"), "error");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendId: string) => friendsApi.removeFriend(friendId),
    onSuccess: () => {
      toast("Friend removed", "info");
      refreshSocialData();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to remove friend"), "error");
    },
  });

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-pixel text-sm text-surface-900">
            Users & Friends
          </h1>
          <p className="font-pixel text-[8px] text-surface-600 mt-2">
            Search users, manage friend requests, and start direct chats.
          </p>
        </div>

        <div className="nes-container">
          <label className="block font-pixel text-[9px] text-surface-700 mb-2">
            Search users
          </label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name or email"
          />
          {trimmedQuery.length > 0 && trimmedQuery.length < 2 ? (
            <p className="font-pixel text-[8px] text-surface-500 mt-2">
              Type at least 2 characters.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {searchQuery.isLoading ? (
            <p className="font-pixel text-[9px] text-surface-600">
              Searching...
            </p>
          ) : null}

          {!searchQuery.isLoading &&
          searchQuery.data?.items.length === 0 &&
          trimmedQuery.length >= 2 ? (
            <p className="font-pixel text-[9px] text-surface-600">
              No users found.
            </p>
          ) : null}

          {searchQuery.data?.items.map((user) => (
            <div
              key={user.id}
              className="nes-container is-rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <Link
                  href={`/users/${user.id}`}
                  className="font-pixel text-xs text-surface-900 no-underline hover:underline"
                >
                  {user.name || "Unnamed user"}
                </Link>
                <p className="font-pixel text-[8px] text-surface-600 mt-1">
                  {user.email}
                </p>
                <p className="font-pixel text-[8px] text-surface-500 mt-1">
                  Status: {getRelationshipLabel(user.relationshipStatus)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  View Profile
                </Button>

                {user.relationshipStatus === "friend" ? (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/chat/${user.id}`)}
                  >
                    Message
                  </Button>
                ) : user.relationshipStatus === "none" ? (
                  <Button
                    size="sm"
                    loading={sendRequestMutation.isPending}
                    onClick={() => sendRequestMutation.mutate(user.id)}
                  >
                    Add Friend
                  </Button>
                ) : (
                  <Button size="sm" disabled>
                    {user.relationshipStatus === "outgoing_pending"
                      ? "Request Sent"
                      : "Incoming Request"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <section className="nes-container is-rounded space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeTab === "friends" ? "primary" : "secondary"}
              onClick={() => setActiveTab("friends")}
            >
              My Friends
            </Button>
            <Button
              size="sm"
              variant={activeTab === "incoming" ? "primary" : "secondary"}
              onClick={() => setActiveTab("incoming")}
            >
              Incoming Requests
            </Button>
            <Button
              size="sm"
              variant={activeTab === "outgoing" ? "primary" : "secondary"}
              onClick={() => setActiveTab("outgoing")}
            >
              Outgoing Requests
            </Button>
          </div>

          {activeTab === "friends" ? (
            <div className="space-y-3">
              {friendsQuery.data?.items.length ? (
                friendsQuery.data.items.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-surface-100 pb-2"
                  >
                    <div>
                      <Link
                        className="font-pixel text-xs no-underline hover:underline"
                        href={`/users/${entry.friend.id}`}
                      >
                        {entry.friend.name || "Unnamed user"}
                      </Link>
                      <p className="font-pixel text-[8px] text-surface-600 mt-1">
                        {entry.friend.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/chat/${entry.friend.id}`)}
                      >
                        Message
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        loading={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(entry.friend.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-pixel text-[9px] text-surface-600">
                  No friends yet.
                </p>
              )}
            </div>
          ) : null}

          {activeTab === "incoming" ? (
            <div className="space-y-3">
              {incomingQuery.data?.items.length ? (
                incomingQuery.data.items.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-surface-100 pb-2"
                  >
                    <div>
                      <p className="font-pixel text-xs">
                        {request.sender?.name || request.sender?.email}
                      </p>
                      <p className="font-pixel text-[8px] text-surface-600 mt-1">
                        {request.sender?.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        loading={acceptMutation.isPending}
                        onClick={() => acceptMutation.mutate(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        loading={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-pixel text-[9px] text-surface-600">
                  No incoming requests.
                </p>
              )}
            </div>
          ) : null}

          {activeTab === "outgoing" ? (
            <div className="space-y-3">
              {outgoingQuery.data?.items.length ? (
                outgoingQuery.data.items.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-surface-100 pb-2"
                  >
                    <div>
                      <p className="font-pixel text-xs">
                        {request.receiver?.name || request.receiver?.email}
                      </p>
                      <p className="font-pixel text-[8px] text-surface-600 mt-1">
                        {request.receiver?.email}
                      </p>
                    </div>
                    <Button
                      variant="warning"
                      size="sm"
                      loading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(request.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ))
              ) : (
                <p className="font-pixel text-[9px] text-surface-600">
                  No outgoing requests.
                </p>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
