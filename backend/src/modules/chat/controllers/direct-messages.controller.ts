import {
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGroupConversationDto } from '../../../core/dtos/chat/create-group-conversation.dto';
import { ConversationListQueryDto } from '../../../core/dtos/chat/conversation-list-query.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { ChatPaginationDto } from '../../../core/dtos/chat/chat-pagination.dto';
import { SendDirectMessageDto } from '../../../core/dtos/chat/send-direct-message.dto';
import { StartConversationDto } from '../../../core/dtos/chat/start-conversation.dto';
import { UpdateGroupConversationDto } from '../../../core/dtos/chat/update-group-conversation.dto';
import { AuthUser } from '../../../shared/types/auth-user.type';
import { handleControllerException } from '../../../shared/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DirectMessagesService } from '../services/direct-messages.service';

@ApiTags('Direct Messages')
@Controller('direct-messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DirectMessagesController {
  private readonly logger = new Logger(DirectMessagesController.name);

  constructor(private readonly directMessagesService: DirectMessagesService) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'Get or create a direct-message conversation with a friend',
  })
  async getOrCreateConversation(
    @CurrentUser() user: AuthUser,
    @Body() dto: StartConversationDto,
  ) {
    try {
      return await this.directMessagesService.getOrCreateConversation(
        user.id,
        dto.userId,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getOrCreateConversation',
      });
    }
  }

  @Post('conversations/group')
  @ApiOperation({ summary: 'Create a new group conversation' })
  async createGroupConversation(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateGroupConversationDto,
  ) {
    try {
      return await this.directMessagesService.createGroupConversation(
        user.id,
        dto,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'createGroupConversation',
      });
    }
  }

  @Patch('conversations/:conversationId')
  @ApiOperation({ summary: 'Update group conversation name/avatar' })
  async updateGroupConversation(
    @CurrentUser() user: AuthUser,
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateGroupConversationDto,
  ) {
    try {
      return await this.directMessagesService.updateGroupConversation(
        user.id,
        conversationId,
        dto,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'updateGroupConversation',
      });
    }
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'List direct-message conversations for current user',
  })
  async listConversations(
    @CurrentUser() user: AuthUser,
    @Query() query: ConversationListQueryDto,
  ) {
    try {
      return await this.directMessagesService.listConversations(user.id, query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'listConversations',
      });
    }
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'List messages in a direct-message conversation' })
  async listMessages(
    @CurrentUser() user: AuthUser,
    @Param('conversationId') conversationId: string,
    @Query() query: ChatPaginationDto,
  ) {
    try {
      return await this.directMessagesService.listMessages(
        user.id,
        conversationId,
        query,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'listMessages',
      });
    }
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a direct message to a conversation' })
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendDirectMessageDto,
  ) {
    try {
      return await this.directMessagesService.sendMessage(
        user.id,
        conversationId,
        dto.content,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'sendMessage',
      });
    }
  }
}
