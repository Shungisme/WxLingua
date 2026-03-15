import { Module } from '@nestjs/common';
import { RadicalsService } from './services/radicals.service';
import { RadicalsController } from './controllers/radicals.controller';

@Module({
  controllers: [RadicalsController],
  providers: [RadicalsService],
  exports: [RadicalsService],
})
export class RadicalsModule {}
