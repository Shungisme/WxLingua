import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar?: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string | null;
}

export type AuthenticatedRequest = Request & {
  user: AuthUser;
};
