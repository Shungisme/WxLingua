import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

/**
 * AppLogger – singleton logger used throughout the entire application.
 * Extends ConsoleLogger to preserve NestJS's standard output format.
 * Inject via LoggerModule (global).
 */
@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor() {
    super('App', {
      logLevels: getLogLevels(),
    });
  }

  /** Override to add formatting for HTTP request logs */
  http(message: string, context?: string) {
    this.printMessages([message], context ?? 'HTTP', 'log');
  }

  /** DB query log (separate method to allow easy filtering) */
  query(message: string, context = 'DB') {
    if (process.env.LOG_DB_QUERIES !== 'false') {
      this.printMessages([message], context, 'verbose');
    }
  }
}

function getLogLevels(): LogLevel[] {
  const env = process.env.NODE_ENV ?? 'development';
  if (env === 'production') {
    return ['log', 'warn', 'error'];
  }
  return ['log', 'warn', 'error', 'debug', 'verbose'];
}
