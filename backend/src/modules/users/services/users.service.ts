import { Injectable, NotFoundException } from '@nestjs/common';
import { FriendRequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import { SearchUsersDto } from '../../../core/dtos/users/search-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeLimit(limit?: number): number {
    if (!limit || Number.isNaN(limit)) {
      return 20;
    }

    return Math.min(Math.max(limit, 1), 50);
  }

  private async getRelationshipStatus(viewerId: string, targetUserId: string) {
    if (viewerId === targetUserId) {
      return 'self';
    }

    const [friendship, outgoingPending, incomingPending] = await Promise.all([
      this.prisma.friendship.findUnique({
        where: {
          userId_friendId: {
            userId: viewerId,
            friendId: targetUserId,
          },
        },
        select: { id: true },
      }),
      this.prisma.friendRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: viewerId,
            receiverId: targetUserId,
          },
        },
        select: { status: true },
      }),
      this.prisma.friendRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: targetUserId,
            receiverId: viewerId,
          },
        },
        select: { status: true },
      }),
    ]);

    if (friendship) {
      return 'friend';
    }

    if (outgoingPending?.status === FriendRequestStatus.PENDING) {
      return 'outgoing_pending';
    }

    if (incomingPending?.status === FriendRequestStatus.PENDING) {
      return 'incoming_pending';
    }

    return 'none';
  }

  async searchUsers(currentUserId: string, query: SearchUsersDto) {
    const q = query.q?.trim();
    if (!q) {
      return {
        items: [],
        nextCursor: null,
      };
    }

    const take = this.normalizeLimit(query.limit);

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
      skip: query.cursorId ? 1 : 0,
      cursor: query.cursorId ? { id: query.cursorId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        createdAt: true,
      },
    });

    const items = await Promise.all(
      users.map(async (user) => ({
        ...user,
        relationshipStatus: await this.getRelationshipStatus(
          currentUserId,
          user.id,
        ),
      })),
    );

    return {
      items,
      nextCursor: users.length === take ? users[users.length - 1].id : null,
    };
  }

  async getUserProfile(currentUserId: string, targetUserId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        createdAt: true,
      },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    const relationshipStatus = await this.getRelationshipStatus(
      currentUserId,
      targetUserId,
    );

    const isFriendOrSelf =
      relationshipStatus === 'friend' || relationshipStatus === 'self';

    return {
      id: target.id,
      name: target.name,
      avatar: target.avatar,
      createdAt: target.createdAt,
      relationshipStatus,
      ...(isFriendOrSelf ? { email: target.email } : {}),
    };
  }
}
