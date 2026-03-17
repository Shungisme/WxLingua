import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';

type PaginationInput = {
  limit?: number;
  cursorId?: string;
  q?: string;
};

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeLimit(limit?: number): number {
    if (!limit || Number.isNaN(limit)) {
      return 20;
    }

    return Math.min(Math.max(limit, 1), 50);
  }

  private async assertTargetExists(targetUserId: string): Promise<void> {
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('Target user not found');
    }
  }

  async isFriend(userId: string, targetUserId: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId,
          friendId: targetUserId,
        },
      },
      select: { id: true },
    });

    return Boolean(friendship);
  }

  async sendFriendRequest(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself',
      );
    }

    await this.assertTargetExists(targetUserId);

    if (await this.isFriend(userId, targetUserId)) {
      throw new ConflictException('You are already friends');
    }

    const reverseRequest = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: targetUserId,
          receiverId: userId,
        },
      },
    });

    if (reverseRequest?.status === FriendRequestStatus.PENDING) {
      throw new ConflictException(
        'This user already sent you a friend request',
      );
    }

    const sameDirection = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: targetUserId,
        },
      },
    });

    if (!sameDirection) {
      return this.prisma.friendRequest.create({
        data: {
          senderId: userId,
          receiverId: targetUserId,
          status: FriendRequestStatus.PENDING,
        },
      });
    }

    if (sameDirection.status === FriendRequestStatus.PENDING) {
      throw new ConflictException('Friend request is already pending');
    }

    if (sameDirection.status === FriendRequestStatus.ACCEPTED) {
      throw new ConflictException('You are already friends');
    }

    return this.prisma.friendRequest.update({
      where: { id: sameDirection.id },
      data: { status: FriendRequestStatus.PENDING },
    });
  }

  async cancelFriendRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.senderId !== userId) {
      throw new ForbiddenException('You can only cancel your own request');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new ConflictException('Only pending requests can be canceled');
    }

    return this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.CANCELED },
    });
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.receiverId !== userId) {
      throw new ForbiddenException('You can only accept requests sent to you');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new ConflictException('Only pending requests can be accepted');
    }

    await this.prisma.$transaction([
      this.prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: FriendRequestStatus.ACCEPTED },
      }),
      this.prisma.friendship.createMany({
        data: [
          {
            userId: request.senderId,
            friendId: request.receiverId,
          },
          {
            userId: request.receiverId,
            friendId: request.senderId,
          },
        ],
        skipDuplicates: true,
      }),
    ]);

    return { success: true };
  }

  async rejectFriendRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.receiverId !== userId) {
      throw new ForbiddenException('You can only reject requests sent to you');
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new ConflictException('Only pending requests can be rejected');
    }

    return this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.REJECTED },
    });
  }

  async listIncomingRequests(userId: string, query: PaginationInput) {
    const take = this.normalizeLimit(query.limit);

    const requests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      },
      take,
      skip: query.cursorId ? 1 : 0,
      cursor: query.cursorId ? { id: query.cursorId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      items: requests,
      nextCursor:
        requests.length === take ? requests[requests.length - 1].id : null,
    };
  }

  async listOutgoingRequests(userId: string, query: PaginationInput) {
    const take = this.normalizeLimit(query.limit);

    const requests = await this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING,
      },
      take,
      skip: query.cursorId ? 1 : 0,
      cursor: query.cursorId ? { id: query.cursorId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      items: requests,
      nextCursor:
        requests.length === take ? requests[requests.length - 1].id : null,
    };
  }

  async listFriends(userId: string, query: PaginationInput) {
    const take = this.normalizeLimit(query.limit);
    const normalizedQuery = query.q?.trim();

    const where: Prisma.FriendshipWhereInput = {
      userId,
      ...(normalizedQuery
        ? {
            friend: {
              OR: [
                {
                  name: {
                    contains: normalizedQuery,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: normalizedQuery,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          }
        : {}),
    };

    const friends = await this.prisma.friendship.findMany({
      where,
      take,
      skip: query.cursorId ? 1 : 0,
      cursor: query.cursorId ? { id: query.cursorId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        friend: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      items: friends,
      nextCursor:
        friends.length === take ? friends[friends.length - 1].id : null,
    };
  }

  async removeFriend(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException('Invalid friend id');
    }

    const removed = await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          {
            userId,
            friendId,
          },
          {
            userId: friendId,
            friendId: userId,
          },
        ],
      },
    });

    if (removed.count === 0) {
      throw new NotFoundException('Friendship not found');
    }

    return { success: true };
  }
}
