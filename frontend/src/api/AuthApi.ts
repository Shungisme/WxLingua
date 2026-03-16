import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types";
import type { AxiosInstance } from "axios";

export class AuthApi {
  constructor(private client: AxiosInstance) {}

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/register",
      data,
    );
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/login", data);
    return response.data;
  }

  async me(): Promise<User> {
    const response = await this.client.get<User>("/auth/me");
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.client.put<User>("/auth/profile", data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post<User>(
      "/auth/profile/avatar/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  }

  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      "/auth/change-password",
      data,
    );
    return response.data;
  }

  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      "/auth/forgot-password",
      data,
    );
    return response.data;
  }

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      "/auth/reset-password",
      data,
    );
    return response.data;
  }
}
