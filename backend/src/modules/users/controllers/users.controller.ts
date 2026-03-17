import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { SearchUsersDto } from '../../../core/dtos/users/search-users.dto';
import { AuthUser } from '../../../shared/types/auth-user.type';
import { handleControllerException } from '../../../shared/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users by email or display name' })
  async searchUsers(
    @CurrentUser() user: AuthUser,
    @Query() query: SearchUsersDto,
  ) {
    try {
      return await this.usersService.searchUsers(user.id, query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'searchUsers',
      });
    }
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Get user profile. Email is returned only when requester is self or friend',
  })
  async getUserProfile(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    try {
      return await this.usersService.getUserProfile(user.id, id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getUserProfile',
      });
    }
  }
}
