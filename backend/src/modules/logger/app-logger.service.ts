import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as fs from 'node:fs';
import * as path from 'node:path';
import 'winston-daily-rotate-file';

enum LogLevelColor {
  INFO = '\u001b[32m',
  ERROR = '\u001b[31m',
  WARN = '\u001b[33m',
  DEBUG = '\u001b[35m',
  VERBOSE = '\u001b[36m',
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly applicationName = 'WxLingua';
  private readonly logLevel: string;
  private readonly logMaxAge: string;
  private readonly greenColorCode = '\u001b[32m';
  private readonly yellowColorCode = '\u001b[33m';
  private readonly resetColorCode = '\u001b[0m';
  private readonly boldCode = '\u001b[1m';

  constructor(private readonly configService: ConfigService) {
    this.logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    this.logMaxAge = this.configService.get<string>('LOG_MAX_AGE', '14d');

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: this.logLevel,
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'MMM DD, YYYY, HH:mm:ss A',
          }),
          winston.format.printf((logInfo) => {
            return this.formatLog(logInfo);
          }),
          winston.format.colorize({
            all: true,
          }),
        ),
      }),
    ];

    const fileLogDir = this.resolveWritableLogDir();

    if (fileLogDir) {
      transports.unshift(
        new winston.transports.DailyRotateFile({
          level: this.logLevel,
          dirname: fileLogDir,
          filename: `${this.applicationName.toLowerCase().replaceAll(/\s+/g, '_')}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: this.logMaxAge,
        }),
      );
    } else {
      // Keep app alive even if filesystem is read-only inside container.
      console.warn(
        `[${this.applicationName}] Log file transport disabled: no writable log directory found. Falling back to console logging only.`,
      );
    }

    this.logger = winston.createLogger({
      level: this.logLevel,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'MMM DD, YYYY, HH:mm:ss A',
        }),
        winston.format.printf((logInfo) => {
          return this.formatLog(logInfo, false);
        }),
      ),
      transports,
    });
  }

  private resolveWritableLogDir(): string | null {
    const configuredDir = this.configService.get<string>('LOG_DIR', 'logs');
    const candidateDirs = [configuredDir, '/tmp/wxlingua-logs'];

    for (const candidate of candidateDirs) {
      const resolvedPath = path.isAbsolute(candidate)
        ? candidate
        : path.resolve(process.cwd(), candidate);

      try {
        fs.mkdirSync(resolvedPath, { recursive: true });
        fs.accessSync(resolvedPath, fs.constants.W_OK);
        return resolvedPath;
      } catch {
        continue;
      }
    }

    return null;
  }

  log(message: string, context?: string) {
    this.logger.info({ message, context });
  }

  error(message: string, context?: string) {
    this.logger.error({ message, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ message, context });
  }

  debug(message: string, context?: string) {
    this.logger.debug({ message, context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose({ message, context });
  }

  http(message: string, context = 'HTTP') {
    this.logger.http({ message, context });
  }

  query(message: string, context = 'DB') {
    this.logger.verbose({ message, context });
  }

  private formatLog(
    logInfo: winston.Logform.TransformableInfo,
    useColor = true,
  ): string {
    const { timestamp, level, message = '', context = 'APP' } = logInfo;
    const levelString = String(level);
    const messageString = String(message);
    const contextString = String(context);
    const timestampString = String(timestamp);
    const levelUpperCase = levelString.toUpperCase();

    if (!useColor) {
      // Remove all ANSI color codes
      const escapeChar = String.fromCharCode(27);
      const handledMessage = messageString.replaceAll(
        new RegExp(`${escapeChar}\\[(?:\\d{1,2}(?:;\\d{1,2})?)?[mK]`, 'g'),
        '',
      );

      return `[${this.applicationName}] ${timestampString} - ${levelUpperCase} [${contextString}]: ${handledMessage}`;
    } else {
      const levelColor =
        LogLevelColor[levelUpperCase as keyof typeof LogLevelColor] ??
        this.resetColorCode;

      return `${this.resetColorCode}${this.boldCode}${this.greenColorCode}[${this.applicationName}]${this.resetColorCode} ${timestampString} - ${levelColor}${levelUpperCase} ${this.boldCode}${this.yellowColorCode}[${contextString}]${this.resetColorCode}: ${levelColor}${messageString}${this.resetColorCode}`;
    }
  }
}
