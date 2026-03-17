import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { FriendsPaginationDto } from '../../../core/dtos/friends/friends-pagination.dto';
import { SendFriendRequestDto } from '../../../core/dtos/friends/send-friend-request.dto';
import { AuthUser } from '../../../shared/types/auth-user.type';
import { handleControllerException } from '../../../shared/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FriendsService } from '../services/friends.service';

@ApiTags('Friends')
@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);

  constructor(private readonly friendsService: FriendsService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Send a friend request to a user' })
  async sendRequest(
    @CurrentUser() user: AuthUser,
    @Body() dto: SendFriendRequestDto,
  ) {
    try {
      return await this.friendsService.sendFriendRequest(
        user.id,
        dto.targetUserId,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'sendRequest',
      });
    }
  }

  @Post('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel a pending outgoing friend request' })
  async cancelRequest(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    try {
      return await this.friendsService.cancelFriendRequest(user.id, id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'cancelRequest',
      });
    }
  }

  @Post('requests/:id/accept')
  @ApiOperation({ summary: 'Accept an incoming friend request' })
  async acceptRequest(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    try {
      return await this.friendsService.acceptFriendRequest(user.id, id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'acceptRequest',
      });
    }
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject an incoming friend request' })
  async rejectRequest(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    try {
      return await this.friendsService.rejectFriendRequest(user.id, id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'rejectRequest',
      });
    }
  }

  @Get('requests/incoming')
  @ApiOperation({ summary: 'List incoming pending friend requests' })
  async incomingRequests(
    @CurrentUser() user: AuthUser,
    @Query() query: FriendsPaginationDto,
  ) {
    try {
      return await this.friendsService.listIncomingRequests(user.id, query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'incomingRequests',
      });
    }
  }

  @Get('requests/outgoing')
  @ApiOperation({ summary: 'List outgoing pending friend requests' })
  async outgoingRequests(
    @CurrentUser() user: AuthUser,
    @Query() query: FriendsPaginationDto,
  ) {
    try {
      return await this.friendsService.listOutgoingRequests(user.id, query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'outgoingRequests',
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'List accepted friends' })
  async listFriends(
    @CurrentUser() user: AuthUser,
    @Query() query: FriendsPaginationDto,
  ) {
    try {
      return await this.friendsService.listFriends(user.id, query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'listFriends',
      });
    }
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove a friend relationship' })
  async removeFriend(
    @CurrentUser() user: AuthUser,
    @Param('friendId') friendId: string,
  ) {
    try {
      return await this.friendsService.removeFriend(user.id, friendId);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'removeFriend',
      });
    }
  }
}
