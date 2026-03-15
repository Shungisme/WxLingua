import { Module } from '@nestjs/common';
import { WordsService } from './services/words.service';
import { WordsController } from './controllers/words.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
