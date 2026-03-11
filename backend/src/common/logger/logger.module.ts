import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';

/**
 * Global logger module – import once in AppModule to make AppLogger
 * injectable in any provider without re-importing.
 */
@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
