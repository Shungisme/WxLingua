import type { AxiosInstance } from "axios";
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../lib/types";

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
}
