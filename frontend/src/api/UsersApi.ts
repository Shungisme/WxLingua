import { CursorResponse, SocialUser, UserProfile } from "@/types";
import type { AxiosInstance } from "axios";

export interface SearchUsersParams {
  q?: string;
  cursorId?: string;
  limit?: number;
}

export class UsersApi {
  constructor(private client: AxiosInstance) {}

  async search(params: SearchUsersParams): Promise<CursorResponse<SocialUser>> {
    const response = await this.client.get<CursorResponse<SocialUser>>(
      "/users/search",
      { params },
    );
    return response.data;
  }

  async getById(userId: string): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>(`/users/${userId}`);
    return response.data;
  }
}
