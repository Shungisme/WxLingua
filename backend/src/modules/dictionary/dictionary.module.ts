import { Module } from '@nestjs/common';
import { DictionaryController } from './controllers/dictionary.controller';
import { DictionaryService } from './services/dictionary.service';
import { HandwritingService } from './services/handwriting.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DictionaryController],
  providers: [DictionaryService, HandwritingService],
  exports: [DictionaryService],
})
export class DictionaryModule {}
