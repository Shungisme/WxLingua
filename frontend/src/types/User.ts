export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}
