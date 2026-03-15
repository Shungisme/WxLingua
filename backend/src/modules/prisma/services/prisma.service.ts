import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { AppLogger } from '../../logger/app-logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient<{
    log: Array<{ emit: 'event'; level: 'query' | 'warn' | 'error' }>;
  }>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: AppLogger) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Register event listeners immediately after super() so they are active
    // before the first $connect() call.
    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.query(
        `${e.query} | params: ${e.params} | duration: ${e.duration}ms`,
        'DB',
      );
    });

    this.$on('warn', (e: Prisma.LogEvent) => {
      this.logger.warn(e.message, 'DB');
    });

    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(e.message, 'DB');
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected', 'DB');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected', 'DB');
  }
}
