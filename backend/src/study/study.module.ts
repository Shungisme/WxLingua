import { Module } from '@nestjs/common';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';
import { SrsService } from './srs.service';

@Module({
  controllers: [StudyController],
  providers: [StudyService, SrsService],
})
export class StudyModule {}

