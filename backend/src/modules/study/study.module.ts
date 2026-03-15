import { Module } from '@nestjs/common';
import { StudyService } from './services/study.service';
import { StudyController } from './controllers/study.controller';
import { SrsService } from './services/srs.service';

@Module({
  controllers: [StudyController],
  providers: [StudyService, SrsService],
})
export class StudyModule {}
