import { Module } from '@nestjs/common';
import { RadicalsService } from './radicals.service';
import { RadicalsController } from './radicals.controller';

@Module({
  controllers: [RadicalsController],
  providers: [RadicalsService],
  exports: [RadicalsService],
})
export class RadicalsModule {}
