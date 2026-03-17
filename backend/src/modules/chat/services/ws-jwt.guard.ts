import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../../shared/types/auth-user.type';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const socketData = client.data as { user?: JwtPayload };
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      socketData.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }
}
