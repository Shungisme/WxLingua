"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendsApi, usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}

function getRelationshipLabel(status: string): string {
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

interface UserProfilePageProps {
  userId: string;
}

export default function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const profileQuery = useQuery({
    queryKey: ["users", "profile", userId],
    queryFn: () => usersApi.getById(userId),
    enabled: Boolean(userId),
  });

  const incomingRequestsQuery = useQuery({
    queryKey: ["friends", "incoming", "for-profile", userId],
    queryFn: () => friendsApi.listIncoming({ limit: 50 }),
    enabled: Boolean(userId),
  });

  const outgoingRequestsQuery = useQuery({
    queryKey: ["friends", "outgoing", "for-profile", userId],
    queryFn: () => friendsApi.listOutgoing({ limit: 50 }),
    enabled: Boolean(userId),
  });

  const incomingRequest = useMemo(
    () => incomingRequestsQuery.data?.items.find((r) => r.senderId === userId),
    [incomingRequestsQuery.data?.items, userId],
  );

  const outgoingRequest = useMemo(
    () =>
      outgoingRequestsQuery.data?.items.find((r) => r.receiverId === userId),
    [outgoingRequestsQuery.data?.items, userId],
  );

  const sendRequestMutation = useMutation({
    mutationFn: () => friendsApi.sendRequest(userId),
    onSuccess: () => {
      toast("Friend request sent", "success");
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to send request"), "error");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.acceptRequest(requestId),
    onSuccess: () => {
      toast("Friend request accepted", "success");
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to accept request"), "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.rejectRequest(requestId),
    onSuccess: () => {
      toast("Friend request rejected", "info");
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to reject request"), "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => friendsApi.cancelRequest(requestId),
    onSuccess: () => {
      toast("Friend request canceled", "info");
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to cancel request"), "error");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => friendsApi.removeFriend(userId),
    onSuccess: () => {
      toast("Friend removed", "info");
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      toast(getErrorMessage(error, "Failed to remove friend"), "error");
    },
  });

  if (profileQuery.isLoading) {
    return (
      <div className="px-6 py-10 font-pixel text-xs">Loading profile...</div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="px-6 py-10 font-pixel text-xs">
        Unable to load profile.
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="nes-container is-rounded space-y-4">
          <div>
            <h1 className="font-pixel text-sm text-surface-900">
              {profile.name || "Unnamed user"}
            </h1>
            <p className="font-pixel text-[8px] text-surface-600 mt-2">
              Relationship: {getRelationshipLabel(profile.relationshipStatus)}
            </p>
            {profile.email ? (
              <p className="font-pixel text-[8px] text-surface-600 mt-1">
                Email: {profile.email}
              </p>
            ) : (
              <p className="font-pixel text-[8px] text-surface-500 mt-1">
                Email visible to friends only.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.relationshipStatus === "friend" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => router.push(`/chat/${profile.id}`)}
                >
                  Message
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  loading={removeMutation.isPending}
                  onClick={() => removeMutation.mutate()}
                >
                  Remove Friend
                </Button>
              </>
            ) : null}

            {profile.relationshipStatus === "none" ? (
              <Button
                size="sm"
                loading={sendRequestMutation.isPending}
                onClick={() => sendRequestMutation.mutate()}
              >
                Send Friend Request
              </Button>
            ) : null}

            {profile.relationshipStatus === "incoming_pending" &&
            incomingRequest ? (
              <>
                <Button
                  size="sm"
                  loading={acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate(incomingRequest.id)}
                >
                  Accept Request
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  loading={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate(incomingRequest.id)}
                >
                  Reject
                </Button>
              </>
            ) : null}

            {profile.relationshipStatus === "outgoing_pending" &&
            outgoingRequest ? (
              <Button
                variant="warning"
                size="sm"
                loading={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(outgoingRequest.id)}
              >
                Cancel Request
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
