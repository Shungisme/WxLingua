import { Module } from '@nestjs/common';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
