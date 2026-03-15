"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}

export default function FriendsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

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

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.acceptRequest(requestId),
    onSuccess: () => {
      toast("Friend request accepted", "success");
      refresh();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to accept request"), "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.rejectRequest(requestId),
    onSuccess: () => {
      toast("Friend request rejected", "info");
      refresh();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to reject request"), "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.cancelRequest(requestId),
    onSuccess: () => {
      toast("Friend request canceled", "info");
      refresh();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to cancel request"), "error");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendId: string) => friendsApi.removeFriend(friendId),
    onSuccess: () => {
      toast("Friend removed", "info");
      refresh();
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to remove friend"), "error");
    },
  });

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-pixel text-sm text-surface-900">Friends</h1>
          <p className="font-pixel text-[8px] text-surface-600 mt-2">
            Manage friends and requests.
          </p>
        </div>

        <section className="nes-container is-rounded space-y-3">
          <h2 className="font-pixel text-xs">My Friends</h2>
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
        </section>

        <section className="nes-container is-rounded space-y-3">
          <h2 className="font-pixel text-xs">Incoming Requests</h2>
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
        </section>

        <section className="nes-container is-rounded space-y-3">
          <h2 className="font-pixel text-xs">Outgoing Requests</h2>
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
        </section>
      </div>
    </div>
  );
}
