import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { FriendsController } from '../friends/controllers/friends.controller';
import { FriendsService } from '../friends/services/friends.service';

@Module({
  controllers: [UsersController, FriendsController],
  providers: [UsersService, FriendsService],
})
export class UsersModule {}
