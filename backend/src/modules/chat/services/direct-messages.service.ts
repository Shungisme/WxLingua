import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import { ChatPaginationDto } from '../../../core/dtos/chat/chat-pagination.dto';
import { ConversationListQueryDto } from '../../../core/dtos/chat/conversation-list-query.dto';
import { CreateGroupConversationDto } from '../../../core/dtos/chat/create-group-conversation.dto';
import { UpdateGroupConversationDto } from '../../../core/dtos/chat/update-group-conversation.dto';

@Injectable()
export class DirectMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeLimit(limit?: number): number {
    if (!limit || Number.isNaN(limit)) {
      return 20;
    }

    return Math.min(Math.max(limit, 1), 50);
  }

  private normalizeParticipants(participantIds: string[]): string[] {
    return [...new Set(participantIds)].sort();
  }

  private toDirectKey(participants: string[]): string {
    return participants.join(':');
  }

  private async assertUsersExist(userIds: string[]): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users were not found');
    }
  }

  private async enrichConversationsWithParticipants<
    T extends {
      participantIds: string[];
      messages?: Array<{
        id: string;
        senderId: string;
        content: string;
        createdAt: Date;
      }>;
    },
  >(conversations: T[]) {
    const allParticipantIds = [
      ...new Set(conversations.flatMap((c) => c.participantIds)),
    ];

    const participants = await this.prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
      },
    });

    const participantMap = new Map(participants.map((p) => [p.id, p]));

    return conversations.map((conversation) => ({
      ...conversation,
      participants: conversation.participantIds
        .map((id) => participantMap.get(id))
        .filter((user): user is NonNullable<typeof user> => Boolean(user)),
      lastMessage:
        conversation.messages && conversation.messages.length > 0
          ? conversation.messages[0]
          : null,
    }));
  }

  private async assertFriendship(
    userId: string,
    friendId: string,
  ): Promise<void> {
    const friendship = await this.prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId,
          friendId,
        },
      },
      select: { id: true },
    });

    if (!friendship) {
      throw new ForbiddenException(
        'Direct messages are only available between friends',
      );
    }
  }

  private async assertConversationParticipant(
    userId: string,
    conversationId: string,
  ) {
    const conversation = await this.prisma.messageConversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        isGroup: true,
        participantIds: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return conversation;
  }

  async ensureConversationAccess(userId: string, conversationId: string) {
    return this.assertConversationParticipant(userId, conversationId);
  }

  private async enrichSingleConversation(conversation: {
    participantIds: string[];
    messages?: Array<{
      id: string;
      senderId: string;
      content: string;
      createdAt: Date;
    }>;
  }) {
    const [enriched] = await this.enrichConversationsWithParticipants([
      {
        ...conversation,
        messages: conversation.messages ?? [],
      },
    ]);

    return enriched;
  }

  async getOrCreateConversation(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException(
        'You cannot start a conversation with yourself',
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    await this.assertFriendship(userId, friendId);

    const participants = this.normalizeParticipants([userId, friendId]);
    const directKey = this.toDirectKey(participants);

    try {
      const created = await this.prisma.messageConversation.create({
        data: {
          isGroup: false,
          participantIds: participants,
          directKey,
        },
        include: { messages: { take: 0 } },
      });

      return this.enrichSingleConversation(created);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.messageConversation.findUnique({
          where: { directKey },
          include: { messages: { take: 0 } },
        });

        if (existing) {
          return this.enrichSingleConversation(existing);
        }
      }

      throw error;
    }
  }

  async createGroupConversation(
    userId: string,
    dto: CreateGroupConversationDto,
  ) {
    const participants = this.normalizeParticipants([
      userId,
      ...dto.participantIds,
    ]);

    if (participants.length < 3) {
      throw new BadRequestException(
        'Group chat requires at least 3 participants including yourself',
      );
    }

    await this.assertUsersExist(participants);

    const created = await this.prisma.messageConversation.create({
      data: {
        isGroup: true,
        name: dto.name.trim(),
        avatar: dto.avatar,
        participantIds: participants,
      },
      include: { messages: { take: 0 } },
    });

    const [conversation] = await this.enrichConversationsWithParticipants([
      created,
    ]);
    return conversation;
  }

  async updateGroupConversation(
    userId: string,
    conversationId: string,
    dto: UpdateGroupConversationDto,
  ) {
    const conversation = await this.assertConversationParticipant(
      userId,
      conversationId,
    );

    if (!conversation.isGroup) {
      throw new BadRequestException(
        'Only group conversations can update name/avatar',
      );
    }

    const updated = await this.prisma.messageConversation.update({
      where: { id: conversationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      include: { messages: { take: 0 } },
    });

    const [result] = await this.enrichConversationsWithParticipants([updated]);
    return result;
  }

  async listConversations(userId: string, query: ConversationListQueryDto) {
    const take = this.normalizeLimit(query.limit);
    const normalizedQuery = query.q?.trim();

    let where: Prisma.MessageConversationWhereInput = {
      participantIds: { has: userId },
    };

    if (normalizedQuery) {
      const matchedUsers = await this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: normalizedQuery, mode: 'insensitive' } },
            { email: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
        take: 100,
      });

      const matchedUserIds = matchedUsers.map((u) => u.id);
      const searchOr: Prisma.MessageConversationWhereInput[] = [
        {
          name: {
            contains: normalizedQuery,
            mode: 'insensitive',
          },
        },
      ];

      if (matchedUserIds.length > 0) {
        searchOr.push({
          participantIds: {
            hasSome: matchedUserIds,
          },
        });
      }

      where = {
        AND: [
          where,
          {
            OR: searchOr,
          },
        ],
      };
    }

    const conversations = await this.prisma.messageConversation.findMany({
      where,
      take,
      skip: query.cursorId ? 1 : 0,
      cursor: query.cursorId ? { id: query.cursorId } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            senderId: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    const items = await this.enrichConversationsWithParticipants(conversations);

    return {
      items,
      nextCursor:
        conversations.length === take
          ? conversations[conversations.length - 1].id
          : null,
    };
  }

  async listMessages(
    userId: string,
    conversationId: string,
    query: ChatPaginationDto,
  ) {
    await this.assertConversationParticipant(userId, conversationId);

    const take = this.normalizeLimit(query.limit);

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      take,
      skip: query.cursorId ? 1 : 0,
      cursor: query.cursorId ? { id: query.cursorId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      items: messages,
      nextCursor:
        messages.length === take ? messages[messages.length - 1].id : null,
    };
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      throw new BadRequestException('Message content cannot be empty');
    }

    await this.assertConversationParticipant(userId, conversationId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: normalizedContent,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.messageConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }
}
