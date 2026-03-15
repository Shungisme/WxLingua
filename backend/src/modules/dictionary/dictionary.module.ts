import { Module } from '@nestjs/common';
import { DictionaryController } from './controllers/dictionary.controller';
import { DictionaryService } from './services/dictionary.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DictionaryController],
  providers: [DictionaryService],
  exports: [DictionaryService],
})
export class DictionaryModule {}
