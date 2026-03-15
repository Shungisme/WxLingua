import { CursorResponse, FriendRequestItem, FriendshipItem } from "@/types";
import type { AxiosInstance } from "axios";

export interface FriendsListParams {
  cursorId?: string;
  limit?: number;
  q?: string;
}

export class FriendsApi {
  constructor(private client: AxiosInstance) {}

  async sendRequest(targetUserId: string): Promise<FriendRequestItem> {
    const response = await this.client.post<FriendRequestItem>(
      "/friends/requests",
      { targetUserId },
    );
    return response.data;
  }

  async cancelRequest(requestId: string): Promise<FriendRequestItem> {
    const response = await this.client.post<FriendRequestItem>(
      `/friends/requests/${requestId}/cancel`,
    );
    return response.data;
  }

  async acceptRequest(requestId: string): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>(
      `/friends/requests/${requestId}/accept`,
    );
    return response.data;
  }

  async rejectRequest(requestId: string): Promise<FriendRequestItem> {
    const response = await this.client.post<FriendRequestItem>(
      `/friends/requests/${requestId}/reject`,
    );
    return response.data;
  }

  async listIncoming(
    params?: FriendsListParams,
  ): Promise<CursorResponse<FriendRequestItem>> {
    const response = await this.client.get<CursorResponse<FriendRequestItem>>(
      "/friends/requests/incoming",
      { params },
    );
    return response.data;
  }

  async listOutgoing(
    params?: FriendsListParams,
  ): Promise<CursorResponse<FriendRequestItem>> {
    const response = await this.client.get<CursorResponse<FriendRequestItem>>(
      "/friends/requests/outgoing",
      { params },
    );
    return response.data;
  }

  async listFriends(
    params?: FriendsListParams,
  ): Promise<CursorResponse<FriendshipItem>> {
    const response = await this.client.get<CursorResponse<FriendshipItem>>(
      "/friends",
      { params },
    );
    return response.data;
  }

  async removeFriend(friendId: string): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(
      `/friends/${friendId}`,
    );
    return response.data;
  }
}
