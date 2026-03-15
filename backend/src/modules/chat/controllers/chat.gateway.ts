import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../services/ws-jwt.guard';
import { SendMessageDto } from '../../../core/dtos/chat/send-message.dto';
import { JwtPayload } from '../../../shared/types/auth-user.type';

const MAX_MESSAGES = 100;
const RATE_LIMIT_MS = 1000;

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

@WebSocketGateway({
  cors: {
    // Explicitly allow any localhost port in dev; in production
    // replace with the real frontend domain.
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void,
    ) => {
      cb(null, true);
    },
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private messages: ChatMessage[] = [];
  /** Map<userId, lastMessageTimestamp> — used for rate limiting */
  private lastMessageAt = new Map<string, number>();

  constructor(private readonly jwtService: JwtService) {}

  // ── Connection lifecycle ────────────────────────────────────────────────

  handleConnection(client: Socket) {
    const socketData = client.data as { user?: JwtPayload };
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      socketData.user = payload;
    } catch {
      client.disconnect(true);
      return;
    }

    // Send message history to the newly connected client
    client.emit('chat:history', this.messages);
  }

  handleDisconnect(client: Socket) {
    const socketData = client.data as { user?: JwtPayload };
    const userId: string | undefined = socketData.user?.sub;
    if (userId) {
      this.lastMessageAt.delete(userId);
    }
  }

  // ── Incoming events ─────────────────────────────────────────────────────

  @UseGuards(WsJwtGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @SubscribeMessage('chat:send')
  handleMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const socketData = client.data as { user?: JwtPayload };
    const user = socketData.user;
    const userId: string = user?.sub ?? client.id;
    const username: string = user?.name ?? user?.email ?? 'Anonymous';

    // Rate limiting: max 1 message per second per user
    const now = Date.now();
    const last = this.lastMessageAt.get(userId) ?? 0;
    if (now - last < RATE_LIMIT_MS) {
      return; // silently drop; client should debounce anyway
    }
    this.lastMessageAt.set(userId, now);

    const message: ChatMessage = {
      id: `${userId}-${now}`,
      userId,
      username,
      content: dto.content,
      createdAt: new Date().toISOString(),
    };

    // Circular buffer: evict oldest when limit exceeded
    if (this.messages.length >= MAX_MESSAGES) {
      this.messages.shift();
    }
    this.messages.push(message);

    // Broadcast to every connected client (including sender)
    this.server.emit('chat:message', message);
  }
}
