import { Module } from '@nestjs/common';
import { DecksService } from './services/decks.service';
import { DecksController } from './controllers/decks.controller';

@Module({
  controllers: [DecksController],
  providers: [DecksService],
})
export class DecksModule {}
