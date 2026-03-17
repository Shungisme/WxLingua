import { Conversation, CursorResponse, DirectMessage } from "@/types";
import type { AxiosInstance } from "axios";

export interface DirectMessagesListParams {
  cursorId?: string;
  limit?: number;
  q?: string;
}

export interface CreateGroupConversationPayload {
  name: string;
  avatar?: string;
  participantIds: string[];
}

export interface UpdateGroupConversationPayload {
  name?: string;
  avatar?: string;
}

export class DirectMessagesApi {
  constructor(private client: AxiosInstance) {}

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const response = await this.client.post<Conversation>(
      "/direct-messages/conversations",
      { userId },
    );
    return response.data;
  }

  async listConversations(
    params?: DirectMessagesListParams,
  ): Promise<CursorResponse<Conversation>> {
    const response = await this.client.get<CursorResponse<Conversation>>(
      "/direct-messages/conversations",
      { params },
    );
    return response.data;
  }

  async createGroupConversation(
    payload: CreateGroupConversationPayload,
  ): Promise<Conversation> {
    const response = await this.client.post<Conversation>(
      "/direct-messages/conversations/group",
      payload,
    );
    return response.data;
  }

  async updateGroupConversation(
    conversationId: string,
    payload: UpdateGroupConversationPayload,
  ): Promise<Conversation> {
    const response = await this.client.patch<Conversation>(
      `/direct-messages/conversations/${conversationId}`,
      payload,
    );
    return response.data;
  }

  async listMessages(
    conversationId: string,
    params?: DirectMessagesListParams,
  ): Promise<CursorResponse<DirectMessage>> {
    const response = await this.client.get<CursorResponse<DirectMessage>>(
      `/direct-messages/conversations/${conversationId}/messages`,
      { params },
    );
    return response.data;
  }

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<DirectMessage> {
    const response = await this.client.post<DirectMessage>(
      `/direct-messages/conversations/${conversationId}/messages`,
      { content },
    );
    return response.data;
  }
}
